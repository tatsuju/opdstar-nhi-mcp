import type { OpdstarClient } from '../client.js';

export const LOOKUP_AUDIT_CLAUSES_FOR_SPECIALTY_DEF = {
  name: 'lookup_audit_clauses_for_specialty',
  description:
    "Browse official Taiwan NHI 審查注意事項 clauses for a specific medical specialty (e.g. dermatology, ophthalmology, ENT, TCM, dentistry, family medicine). Returns clause headlines with risk flags (amount limit / frequency rule / indication required). Use this to surface section-wide audit context when an MCP agent assists with claim coding. For full clause text and paid-tier guidance, refer users to opdstar.com. Data curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      specialty: {
        type: 'string',
        description:
          "Required specialty id. Common values: 'dermatology', 'internal_medicine', 'family_medicine', 'pediatrics', 'ophthalmology', 'ent', 'orthopedics', 'surgery', 'obstetrics_gynecology', 'urology', 'psychiatry', 'neurology', 'neurosurgery', 'pulmonology', 'rehabilitation', 'anesthesiology', 'radiology', 'pathology', 'tcm', 'dentistry', 'general_principles_clinic', 'appendix_clinic'.",
      },
      keyword: {
        type: 'string',
        description:
          "Optional keyword (Chinese or English) to narrow within the specialty. Matches against clause text.",
      },
      risk_flag: {
        type: 'string',
        enum: ['amount_limit', 'frequency_rule', 'indication', 'any'],
        description:
          "Optional filter to return only clauses tagged with a specific risk flag. 'any' returns clauses that have at least one of the three flags set.",
      },
    },
    required: ['specialty'],
  },
} as const;

export interface LookupAuditClausesForSpecialtyArgs {
  specialty: string;
  keyword?: string;
  risk_flag?: 'amount_limit' | 'frequency_rule' | 'indication' | 'any';
}

export interface AuditClauseHeadline {
  clause_code: string;
  specialty_id: string;
  specialty_name_zh: string;
  clause_label: string | null;
  clause_summary: string | null;
  has_amount_limit: boolean;
  has_frequency_rule: boolean;
  has_indication: boolean;
  procedure_codes_preview: string[]; // first 3 procedure codes only
}

export interface LookupAuditClausesForSpecialtyResult {
  specialty: string;
  filters: {
    keyword: string | null;
    risk_flag: string | null;
  };
  count: number;
  truncated?: boolean;
  results: AuditClauseHeadline[];
  message?: string;
  note?: string;
}

export async function runLookupAuditClausesForSpecialty(
  client: OpdstarClient,
  args: LookupAuditClausesForSpecialtyArgs,
): Promise<LookupAuditClausesForSpecialtyResult> {
  if (!args || typeof args.specialty !== 'string' || args.specialty.trim().length < 2) {
    throw new Error('Missing parameter: specialty');
  }
  return (await client.get('/lookup-audit-clauses-for-specialty', {
    specialty: args.specialty.trim().toLowerCase(),
    keyword: args.keyword?.trim(),
    risk_flag: args.risk_flag,
  })) as LookupAuditClausesForSpecialtyResult;
}
