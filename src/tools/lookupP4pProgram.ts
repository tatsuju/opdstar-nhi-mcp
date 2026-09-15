import type { OpdstarClient } from '../client.js';

export const LOOKUP_P4P_PROGRAM_DEF = {
  name: 'lookup_p4p_program',
  description:
    "Look up Taiwan NHI 論質計酬 / 照護品質提升方案 (pay-for-performance and care-management programmes) — returns enrolment criteria, exclusion and closure criteria, required follow-up cadence, required lab tests and care team, the fee codes each programme is claimed with, and per-visit payment. **Use when** a patient's diagnosis might make them eligible for a care programme, when an agent needs to know what enrolling commits the clinic to, or which fee codes a programme unlocks. Call with NO arguments to list every programme first. **ICD matching is bidirectional**: stored targets mix three-character prefixes with full codes, so 'E11' and 'E11.9' both match the diabetes programme. **Scope note**: criteria are summarised from the programme documents, not quoted verbatim — treat them as a guide to eligibility and follow `source_url` for the contractual wording. **Don't use** for ordinary per-claim payment rules — that is `lookup_fee_code`. **Reference only** — enrolment decisions require physician judgement. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      icd: {
        type: 'string',
        description:
          "Optional ICD-10 code or three-character prefix (e.g. 'E11', 'E11.9', 'J45'). Matches in both directions against each programme's target codes.",
      },
      specialty: {
        type: 'string',
        description:
          "Optional specialty slug (e.g. 'nephrology', 'psychiatry', 'family_medicine'). Returns programmes open to that specialty.",
      },
      q: {
        type: 'string',
        description:
          "Optional free-text over programme name and target disease (e.g. '氣喘', '肝炎', 'COPD').",
      },
    },
  },
} as const;

export interface LookupP4pProgramArgs {
  icd?: string;
  specialty?: string;
  q?: string;
}

export interface P4pProgramEntry {
  program_code: string;
  program_type: string;
  program_name: string;
  program_name_short: string | null;
  program_name_en: string | null;
  target_disease: string | null;
  target_icd10: string[];
  target_icd10_desc: string | null;
  applicable_specialty: string[];
  enrollment_criteria: string | null;
  exclusion_criteria: string | null;
  closure_criteria: string | null;
  age_restriction: string | null;
  follow_up_frequency: string | null;
  required_lab_tests: Record<string, unknown> | null;
  required_team: Record<string, unknown> | null;
  training_required: string | null;
  fee_codes: string[];
  payment_summary: Record<string, unknown> | null;
  payment_per_visit: number | null;
  annual_payment_cap: number | null;
  copay_exemption: boolean;
  /** Cross-claiming rules — which codes may not be billed together, and when a
   *  combined programme code replaces the per-disease ones. */
  notes: string | null;
  source_document: string;
  source_url: string | null;
  effective_date: string | null;
  revision_date: string | null;
}

export interface LookupP4pProgramResult {
  filters: { icd: string | null; specialty: string | null; q: string | null };
  count: number;
  truncated?: boolean;
  results: P4pProgramEntry[];
  message?: string;
  note?: string;
}

export async function runLookupP4pProgram(
  client: OpdstarClient,
  args: LookupP4pProgramArgs,
): Promise<LookupP4pProgramResult> {
  return (await client.get('/lookup-p4p', {
    icd: args?.icd?.trim().toUpperCase(),
    specialty: args?.specialty?.trim().toLowerCase(),
    q: args?.q?.trim(),
  })) as LookupP4pProgramResult;
}
