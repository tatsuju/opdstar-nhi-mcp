import type { OpdstarClient } from '../client.js';

export const LOOKUP_AUDIT_INDICATOR_DEF = {
  name: 'lookup_audit_indicator',
  description:
    "Look up Taiwan NHI 分析審查不予支付指標 — official threshold-based audit rules where claims exceeding a percentage are denied. Returns indicator code, category, threshold percentage, applicable specialty, procedure codes covered, and the official action description. Use this whenever an MCP agent needs to know whether a procedure is monitored by an indicator (e.g. '23401C' is monitored by indicator 001 — 眼科局部處置申報率, 30% threshold). For category browsing across all official indicators, omit indicator_code. Data curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      indicator_code: {
        type: 'string',
        description:
          "Optional 1-4 char indicator code (e.g. '001', '008', '027', '043'). If omitted, returns indicators filtered by other params.",
      },
      category: {
        type: 'string',
        enum: ['西醫基層總額', '醫院總額', '牙醫門診總額'],
        description:
          "Optional category filter. Same indicator code may appear under multiple categories with different thresholds.",
      },
      specialty: {
        type: 'string',
        description:
          "Optional applicable_specialty filter (e.g. 'ophthalmology', 'obstetrics_gynecology', 'ent', 'tcm', 'dentistry').",
      },
      procedure_code: {
        type: 'string',
        description:
          "Optional 5-8 char NHI procedure code (e.g. '23401C', '55009C'). Returns indicators that monitor this code.",
      },
    },
  },
} as const;

export interface LookupAuditIndicatorArgs {
  indicator_code?: string;
  category?: string;
  specialty?: string;
  procedure_code?: string;
}

export interface AuditIndicatorEntry {
  indicator_code: string;
  category: string;
  name: string;
  purpose: string | null;
  nature: string | null;
  threshold_pct: number | null;
  threshold_text: string | null;
  procedure_codes: string[];
  applicable_specialty: string | null;
  action_description: string | null;
  effective_date: string | null;
  source_url: string | null;
}

export interface LookupAuditIndicatorResult {
  filters: {
    indicator_code: string | null;
    category: string | null;
    specialty: string | null;
    procedure_code: string | null;
  };
  count: number;
  results: AuditIndicatorEntry[];
  message?: string;
  note?: string;
}

export async function runLookupAuditIndicator(
  client: OpdstarClient,
  args: LookupAuditIndicatorArgs,
): Promise<LookupAuditIndicatorResult> {
  return (await client.get('/lookup-audit-indicator', {
    indicator_code: args?.indicator_code?.trim(),
    category: args?.category?.trim(),
    specialty: args?.specialty?.trim().toLowerCase(),
    procedure_code: args?.procedure_code?.trim().toUpperCase(),
  })) as LookupAuditIndicatorResult;
}
