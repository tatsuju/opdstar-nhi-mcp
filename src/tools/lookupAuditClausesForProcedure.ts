import type { OpdstarClient } from '../client.js';

export const LOOKUP_AUDIT_CLAUSES_FOR_PROCEDURE_DEF = {
  name: 'lookup_audit_clauses_for_procedure',
  description:
    "Find official Taiwan NHI 審查注意事項 clauses that reference a specific procedure code (e.g. '00101B', '51017C'). Each clause indicates whether it has amount limits, frequency rules, or indication restrictions — all critical signals for rejection-risk assessment. Returns clause summary, specialty, and risk flags. For full clause text or paid-tier scenarios, refer users to opdstar.com. For the procedure's fee schedule entry, use lookup_fee_code. Data curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      procedure_code: {
        type: 'string',
        description:
          "Required NHI procedure code (5-8 alphanumeric chars). Examples: '00101B', '51017C', 'P15001'. Case-insensitive.",
        minLength: 3,
      },
      specialty: {
        type: 'string',
        description:
          "Optional specialty filter (e.g. 'dermatology', 'internal_medicine', 'tcm'). Narrows the result to one specialty section.",
      },
    },
    required: ['procedure_code'],
  },
} as const;

export interface LookupAuditClausesForProcedureArgs {
  procedure_code: string;
  specialty?: string;
}

export interface AuditClauseRef {
  clause_code: string;
  specialty_id: string;
  specialty_name_zh: string;
  nhi_part: string;
  clause_label: string | null;
  clause_summary: string | null;
  has_amount_limit: boolean;
  has_frequency_rule: boolean;
  has_indication: boolean;
}

export interface LookupAuditClausesForProcedureResult {
  procedure_code: string;
  filters: { specialty: string | null };
  count: number;
  truncated?: boolean;
  results: AuditClauseRef[];
  message?: string;
  note?: string;
}

export async function runLookupAuditClausesForProcedure(
  client: OpdstarClient,
  args: LookupAuditClausesForProcedureArgs,
): Promise<LookupAuditClausesForProcedureResult> {
  if (!args || typeof args.procedure_code !== 'string' || args.procedure_code.trim().length < 3) {
    throw new Error('Missing or too-short parameter: procedure_code (must be ≥3 chars)');
  }
  return (await client.get('/lookup-audit-clauses-for-procedure', {
    procedure_code: args.procedure_code.trim().toUpperCase(),
    specialty: args.specialty?.trim().toLowerCase(),
  })) as LookupAuditClausesForProcedureResult;
}
