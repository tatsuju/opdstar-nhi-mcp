/**
 * @opdstar/nhi-mcp — Taiwan's first public NHI MCP Server
 * Powered by OPDSTAR (https://opdstar.com)
 *
 * Read-only MCP tools that let any MCP-compatible AI agent
 * (Claude Desktop, Cursor, etc.) query Taiwan's National Health Insurance
 * curated dataset:
 *
 *   v0.1.0:
 *     1. lookup_rejection_code                       — NHI 核刪代碼
 *     2. get_procedures_for_icd                      — ICD-10 → 處置碼對照
 *     3. get_indicator                               — 健保指標（008/014/027/P043）
 *     4. search_nhi_wiki                             — 官方 Wiki 語意搜
 *
 *   v0.2.0:
 *     5. get_drug_rules                              — 藥品給付規定限制
 *     6. get_safe_phrases                            — 安全句型庫（精簡版）
 *     7. search_audit_guidelines                     — 審查注意事項摘要
 *     8. get_rejection_code_category                 — 核刪代碼分類列表
 *
 *   v0.3.0:
 *     9. lookup_drug                                 — 健保藥品目錄查詢
 *
 *   v0.4.0:
 *    10. lookup_fee_code                             — 健保支付標準查詢
 *
 *   v0.5.0:
 *    11. lookup_audit_clauses_for_procedure         — 處置碼 → 審查注意事項
 *    12. lookup_audit_clauses_for_specialty         — 科別 → 審查注意事項
 *    13. lookup_major_illness                       — 重大傷病類別查詢
 *    14. check_icd_for_major_illness_eligibility    — ICD → 重大傷病反查
 *    15. lookup_audit_indicator                     — 分析審查不予支付指標
 *
 *   v0.6.0:
 *    16. lookup_appeal_statistics_by_category       — 申復統計訊號（按類別）
 *    17. count_appeal_precedents_for_rejection_code — 拒付碼/處置碼申復案量
 *
 * Runs over stdio. Invoke via `npx @opdstar/nhi-mcp`.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

import { OpdstarClient } from './client.js';
import { VERSION } from './version.js';

import { LOOKUP_REJECTION_CODE_DEF, runLookupRejectionCode } from './tools/lookupRejectionCode.js';
import { GET_PROCEDURES_FOR_ICD_DEF, runGetProceduresForIcd } from './tools/getProceduresForIcd.js';
import { GET_INDICATOR_DEF, runGetIndicator } from './tools/getIndicator.js';
import { SEARCH_NHI_WIKI_DEF, runSearchNhiWiki } from './tools/searchNhiWiki.js';
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
import {
  LOOKUP_MAJOR_ILLNESS_DEF,
  runLookupMajorIllness,
} from './tools/lookupMajorIllness.js';
import {
  CHECK_ICD_FOR_MAJOR_ILLNESS_DEF,
  runCheckIcdForMajorIllness,
} from './tools/checkIcdForMajorIllness.js';
import {
  LOOKUP_AUDIT_INDICATOR_DEF,
  runLookupAuditIndicator,
} from './tools/lookupAuditIndicator.js';
import {
  LOOKUP_APPEAL_STATISTICS_DEF,
  runLookupAppealStatistics,
} from './tools/lookupAppealStatistics.js';
import {
  COUNT_APPEAL_PRECEDENTS_DEF,
  runCountAppealPrecedents,
} from './tools/countAppealPrecedents.js';

const client = new OpdstarClient();

const server = new Server(
  {
    name: '@opdstar/nhi-mcp',
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    LOOKUP_REJECTION_CODE_DEF,
    GET_PROCEDURES_FOR_ICD_DEF,
    GET_INDICATOR_DEF,
    SEARCH_NHI_WIKI_DEF,
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
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;
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
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr (stdout is reserved for MCP protocol frames)
  console.error(
    `[opdstar-nhi-mcp v${VERSION}] Ready. Powered by OPDSTAR (https://opdstar.com)`
  );
}

main().catch((err) => {
  console.error('[opdstar-nhi-mcp] Fatal error:', err);
  process.exit(1);
});
