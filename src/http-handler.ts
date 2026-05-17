/**
 * Transport-agnostic dispatcher for @opdstar/nhi-mcp.
 *
 * Used by:
 *   - src/index.ts (stdio transport)
 *   - opdstar.com `api/mcp.ts` Vercel edge route (HTTPS JSON-RPC transport)
 *
 * Exports:
 *   - TOOL_DEFS — array of all tool definitions
 *   - callToolByName(client, name, args) — dispatches a single tool call
 *   - handleMcpRequest(client, body) — handles a full JSON-RPC 2.0 request
 *     (initialize / tools/list / tools/call / notifications/initialized)
 */

import { OpdstarClient } from './client.js';
import { VERSION } from './version.js';

import { LOOKUP_REJECTION_CODE_DEF, runLookupRejectionCode } from './tools/lookupRejectionCode.js';
import { GET_PROCEDURES_FOR_ICD_DEF, runGetProceduresForIcd } from './tools/getProceduresForIcd.js';
import { GET_INDICATOR_DEF, runGetIndicator } from './tools/getIndicator.js';
import { SEARCH_NHI_WIKI_DEF, runSearchNhiWiki } from './tools/searchNhiWiki.js';
import {
  SEARCH_NHI_INTERPRETATIONS_DEF,
  runSearchNhiInterpretations,
} from './tools/searchNhiInterpretations.js';
import { GET_DRUG_RULES_DEF, runGetDrugRules } from './tools/getDrugRules.js';
import { GET_SAFE_PHRASES_DEF, runGetSafePhrases } from './tools/getSafePhrases.js';
import { SEARCH_AUDIT_GUIDELINES_DEF, runSearchAuditGuidelines } from './tools/searchAuditGuidelines.js';
import { GET_REJECTION_CODE_CATEGORY_DEF, runGetRejectionCodeCategory } from './tools/getRejectionCodeCategory.js';
import { LOOKUP_DRUG_DEF, runLookupDrug } from './tools/lookupDrug.js';
import { LOOKUP_FEE_CODE_DEF, runLookupFeeCode } from './tools/lookupFeeCode.js';
import {
  LOOKUP_AUDIT_CLAUSES_FOR_PROCEDURE_DEF,
  runLookupAuditClausesForProcedure,
} from './tools/lookupAuditClausesForProcedure.js';
import {
  LOOKUP_AUDIT_CLAUSES_FOR_SPECIALTY_DEF,
  runLookupAuditClausesForSpecialty,
} from './tools/lookupAuditClausesForSpecialty.js';
import { LOOKUP_MAJOR_ILLNESS_DEF, runLookupMajorIllness } from './tools/lookupMajorIllness.js';
import { CHECK_ICD_FOR_MAJOR_ILLNESS_DEF, runCheckIcdForMajorIllness } from './tools/checkIcdForMajorIllness.js';
import { LOOKUP_AUDIT_INDICATOR_DEF, runLookupAuditIndicator } from './tools/lookupAuditIndicator.js';
import { LOOKUP_APPEAL_STATISTICS_DEF, runLookupAppealStatistics } from './tools/lookupAppealStatistics.js';
import { COUNT_APPEAL_PRECEDENTS_DEF, runCountAppealPrecedents } from './tools/countAppealPrecedents.js';
import { RECENT_NHI_AMENDMENTS_DEF, runRecentNhiAmendments } from './tools/recentNhiAmendments.js';
import { SEARCH_TAIWAN_DRUG_DEF, runSearchTaiwanDrug } from './tools/searchTaiwanDrug.js';
import { LOOKUP_ICD10_CM_DEF, runLookupIcd10Cm } from './tools/lookupIcd10Cm.js';

const RAW_TOOL_DEFS = [
  LOOKUP_REJECTION_CODE_DEF,
  GET_PROCEDURES_FOR_ICD_DEF,
  GET_INDICATOR_DEF,
  SEARCH_NHI_WIKI_DEF,
  SEARCH_NHI_INTERPRETATIONS_DEF,
  GET_DRUG_RULES_DEF,
  GET_SAFE_PHRASES_DEF,
  SEARCH_AUDIT_GUIDELINES_DEF,
  GET_REJECTION_CODE_CATEGORY_DEF,
  LOOKUP_DRUG_DEF,
  LOOKUP_FEE_CODE_DEF,
  LOOKUP_AUDIT_CLAUSES_FOR_PROCEDURE_DEF,
  LOOKUP_AUDIT_CLAUSES_FOR_SPECIALTY_DEF,
  LOOKUP_MAJOR_ILLNESS_DEF,
  CHECK_ICD_FOR_MAJOR_ILLNESS_DEF,
  LOOKUP_AUDIT_INDICATOR_DEF,
  LOOKUP_APPEAL_STATISTICS_DEF,
  COUNT_APPEAL_PRECEDENTS_DEF,
  RECENT_NHI_AMENDMENTS_DEF,
  SEARCH_TAIWAN_DRUG_DEF,
  LOOKUP_ICD10_CM_DEF,
] as const;

/**
 * User-friendly tool titles surfaced via MCP `annotations.title`.
 * Required by the Anthropic MCP Directory listing so clients can
 * display a human-readable label next to the machine-readable name.
 */
const TOOL_TITLES: Record<string, string> = {
  lookup_rejection_code: 'Lookup NHI Rejection Code',
  get_procedures_for_icd: 'Get NHI Procedures for ICD-10',
  get_indicator: 'Get NHI Audit Indicator',
  search_nhi_wiki: 'Search NHI Wiki',
  search_nhi_interpretations: 'Search NHI Official Interpretations',
  get_drug_rules: 'Get NHI Drug Payment Rules',
  get_safe_phrases: 'Get Safe SOAP Phrases',
  search_audit_guidelines: 'Search NHI Audit Guidelines',
  get_rejection_code_category: 'Browse Rejection Codes by Category',
  lookup_drug: 'Lookup NHI Drug',
  lookup_fee_code: 'Lookup NHI Fee Schedule',
  lookup_audit_clauses_for_procedure: 'Audit Clauses for a Procedure Code',
  lookup_audit_clauses_for_specialty: 'Audit Clauses by Specialty',
  lookup_major_illness: 'Lookup Major-Illness Category',
  check_icd_for_major_illness_eligibility: 'Check ICD for Major-Illness Coverage',
  lookup_audit_indicator: 'Lookup Audit Indicator Detail',
  lookup_appeal_statistics_by_category: 'Appeal Statistics by Category',
  count_appeal_precedents_for_rejection_code: 'Count Appeal Precedents',
  recent_nhi_amendments: 'Recent NHI Rule Amendments',
  search_taiwan_drug: 'Search Taiwan Drug Catalog',
  lookup_icd10_cm: 'Lookup ICD-10-CM Code',
};

/**
 * Every tool in this server is a uniform read-only reference to a
 * closed Taiwan NHI dataset, so the four MCP behaviour hints are the
 * same for all 20 tools. Centralizing here keeps individual tool
 * files free of boilerplate.
 *
 *   readOnlyHint   — no state mutation
 *   destructiveHint — no destructive operations
 *   idempotentHint — same input returns the same output within the
 *                    dataset's freshness window (updated monthly+)
 *   openWorldHint  — closed dataset; does not browse arbitrary URLs
 */
const SHARED_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

export const TOOL_DEFS = RAW_TOOL_DEFS.map((def) => ({
  ...def,
  annotations: {
    title: TOOL_TITLES[def.name] ?? def.name,
    ...SHARED_ANNOTATIONS,
  },
}));

export interface ToolCallContent {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export async function callToolByName(
  client: OpdstarClient,
  name: string,
  args: unknown
): Promise<ToolCallContent> {
  try {
    let result: unknown;
    switch (name) {
      case 'lookup_rejection_code':
        result = await runLookupRejectionCode(client, args as never);
        break;
      case 'get_procedures_for_icd':
        result = await runGetProceduresForIcd(client, args as never);
        break;
      case 'get_indicator':
        result = await runGetIndicator(client, args as never);
        break;
      case 'search_nhi_wiki':
        result = await runSearchNhiWiki(client, args as never);
        break;
      case 'search_nhi_interpretations':
        result = await runSearchNhiInterpretations(client, args as never);
        break;
      case 'get_drug_rules':
        result = await runGetDrugRules(client, args as never);
        break;
      case 'get_safe_phrases':
        result = await runGetSafePhrases(client, args as never);
        break;
      case 'search_audit_guidelines':
        result = await runSearchAuditGuidelines(client, args as never);
        break;
      case 'get_rejection_code_category':
        result = await runGetRejectionCodeCategory(client, args as never);
        break;
      case 'lookup_drug':
        result = await runLookupDrug(client, args as never);
        break;
      case 'lookup_fee_code':
        result = await runLookupFeeCode(client, args as never);
        break;
      case 'lookup_audit_clauses_for_procedure':
        result = await runLookupAuditClausesForProcedure(client, args as never);
        break;
      case 'lookup_audit_clauses_for_specialty':
        result = await runLookupAuditClausesForSpecialty(client, args as never);
        break;
      case 'lookup_major_illness':
        result = await runLookupMajorIllness(client, args as never);
        break;
      case 'check_icd_for_major_illness_eligibility':
        result = await runCheckIcdForMajorIllness(client, args as never);
        break;
      case 'lookup_audit_indicator':
        result = await runLookupAuditIndicator(client, args as never);
        break;
      case 'lookup_appeal_statistics_by_category':
        result = await runLookupAppealStatistics(client, args as never);
        break;
      case 'count_appeal_precedents_for_rejection_code':
        result = await runCountAppealPrecedents(client, args as never);
        break;
      case 'recent_nhi_amendments':
        result = await runRecentNhiAmendments(client, args as never);
        break;
      case 'search_taiwan_drug':
        result = await runSearchTaiwanDrug(client, args as never);
        break;
      case 'lookup_icd10_cm':
        result = await runLookupIcd10Cm(client, args as never);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error calling tool "${name}": ${msg}\n\nDocs: https://github.com/tatsuju/opdstar-nhi-mcp\nPowered by OPDSTAR (https://opdstar.com)`,
        },
      ],
    };
  }
}

// ─── JSON-RPC 2.0 wire layer ──────────────────────────────────────────

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: '@opdstar/nhi-mcp', version: VERSION } as const;

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: unknown;
}

interface JsonRpcSuccess {
  jsonrpc: '2.0';
  id: string | number | null;
  result: unknown;
}

interface JsonRpcError {
  jsonrpc: '2.0';
  id: string | number | null;
  error: { code: number; message: string; data?: unknown };
}

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

function rpcError(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcError {
  return { jsonrpc: '2.0', id, error: { code, message, ...(data !== undefined ? { data } : {}) } };
}

function rpcSuccess(id: string | number | null, result: unknown): JsonRpcSuccess {
  return { jsonrpc: '2.0', id, result };
}

/**
 * Handle a single JSON-RPC 2.0 request and return the response, or null for notifications.
 *
 * Supports the subset of MCP methods needed for a stateless remote server:
 *   - initialize
 *   - notifications/initialized      (no response)
 *   - tools/list
 *   - tools/call
 *   - ping                            (health check)
 */
export async function handleMcpRequest(
  client: OpdstarClient,
  body: JsonRpcRequest
): Promise<JsonRpcResponse | null> {
  const id = body?.id ?? null;
  const method = body?.method;

  if (!method || typeof method !== 'string') {
    return rpcError(id, -32600, 'Invalid Request: missing method');
  }

  // Notifications (no id) — never reply.
  if (method.startsWith('notifications/')) {
    return null;
  }

  try {
    switch (method) {
      case 'initialize': {
        return rpcSuccess(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        });
      }

      case 'ping': {
        return rpcSuccess(id, {});
      }

      case 'tools/list': {
        return rpcSuccess(id, { tools: TOOL_DEFS });
      }

      case 'tools/call': {
        const params = (body.params ?? {}) as { name?: string; arguments?: unknown };
        if (!params.name || typeof params.name !== 'string') {
          return rpcError(id, -32602, 'Invalid params: missing tool name');
        }
        const result = await callToolByName(client, params.name, params.arguments ?? {});
        return rpcSuccess(id, result);
      }

      default:
        return rpcError(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return rpcError(id, -32603, `Internal error: ${msg}`);
  }
}
