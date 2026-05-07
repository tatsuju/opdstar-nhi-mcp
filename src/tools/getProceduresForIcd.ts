import type { OpdstarClient } from '../client.js';
import type { ProceduresForIcdResult } from '../types.js';

const SPECIALTIES = [
  'dermatology','internal','family','pediatrics','ent','ophthalmology','orthopedics',
  'pmr','gastro','urology','psychiatry','neurology','cardiology','pulmonology',
  'surgery','obstetrics_gynecology','infectious','rheumatology','dentistry','tcm',
] as const;

export const GET_PROCEDURES_FOR_ICD_DEF = {
  name: 'get_procedures_for_icd',
  description:
    "Given a Taiwan ICD-10 code and a medical specialty, return the NHI procedure codes plausibly applicable to that diagnosis within that specialty. Each result includes the procedure code, Chinese name, English name, nhi_points (payment points), and audit_notes (specialty-specific review caveats and risk hints). Results are ordered by curated relevance (most commonly applied codes first), capped at `limit` (default 10, max 20). Returns an empty list (not an error) when no curated mapping exists for the given (icd10, specialty) pair — this is common because the mapping is intentionally conservative. **Use when** an agent is drafting SOAP and needs a starting set of procedure codes for the diagnosis within the clinician's specialty context — e.g. dermatologist with `L30.9` (chronic eczema) needs candidate procedure codes. **Typical follow-up**: for each candidate code, call `lookup_fee_code({q: <code>})` to confirm current points and effective dates, and `lookup_audit_clauses_for_procedure({procedure_code})` to surface any audit-clause caveats. **Don't use** as a billing source of truth — the original NHI fee schedule has no ICD field, this is a curated, intentionally conservative mapping that prefers false negatives over false positives; for the canonical fee-schedule entry of a known code, call `lookup_fee_code`. **Reference only** — final code selection remains the clinician's responsibility. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      icd10: {
        type: 'string',
        description:
          "Required. ICD-10-CM code in standard `LNN.N` format (letter + 2 digits + optional decimal + 1-4 sub-digits). Whitespace is trimmed; case is preserved (ICD-10 letters are uppercase by convention). Match is exact-prefix (passing 'L30' may match 'L30.0' / 'L30.9' depending on curation granularity). Examples: 'L30.9' (chronic eczema, dermatology) / 'J06.9' (acute URI, family / ent / pediatrics) / 'H66.9' (otitis media, ent / pediatrics) / 'M25.5' (joint pain, orthopedics / pmr).",
        pattern: '^[A-Z][0-9]{2}(\\.[0-9A-Z]{1,4})?$',
        minLength: 3,
      },
      specialty: {
        type: 'string',
        description:
          "Required. The clinician's specialty (lowercase ID). Curated mappings differ by specialty because procedure relevance is specialty-specific (e.g. L30.9 in dermatology surfaces topical-treatment codes; in family medicine surfaces general-care codes). Pass the closest match — e.g. 'internal' for internal medicine, 'obstetrics_gynecology' for OB/GYN, 'tcm' for traditional Chinese medicine.",
        enum: [...SPECIALTIES],
      },
      limit: {
        type: 'integer',
        description:
          "Optional. Maximum number of procedure-code candidates to return, ordered by curated relevance. Range 1-20. Default 10. Lower limits (3-5) work well when the agent only needs the top candidates; higher limits help when the diagnosis is broad and many codes may apply.",
        minimum: 1,
        maximum: 20,
        default: 10,
      },
    },
    required: ['icd10', 'specialty'],
  },
} as const;

export interface GetProceduresForIcdArgs {
  icd10: string;
  specialty: string;
  limit?: number;
}

export async function runGetProceduresForIcd(
  client: OpdstarClient,
  args: GetProceduresForIcdArgs
): Promise<ProceduresForIcdResult> {
  if (!args || typeof args.icd10 !== 'string' || typeof args.specialty !== 'string') {
    throw new Error('Missing required parameters: icd10 and specialty');
  }
  return (await client.get('/procedures-for-icd', {
    icd10: args.icd10.trim(),
    specialty: args.specialty.trim().toLowerCase(),
    limit: args.limit,
  })) as ProceduresForIcdResult;
}
