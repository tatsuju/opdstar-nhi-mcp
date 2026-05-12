import type { OpdstarClient } from '../client.js';
import type { SearchTaiwanDrugResult } from '../types.js';

export const SEARCH_TAIWAN_DRUG_DEF = {
  name: 'search_taiwan_drug',
  description:
    "Search Taiwan drugs across NHI and TFDA registries with unified cross-reference. Returns generic name (EN + 中文學名), all brand names + aliases, NHI 9碼 billing code, ATC code, dosage form, strength, route, therapeutic class, applicable specialties, compound-flag, and effective date. The query auto-detects four input shapes: (1) **NHI drug code** 9碼 (e.g. 'AC4537911', 'A04403412' — 1-2 letter prefix + 6-9 digits) → direct match; (2) **ATC code** prefix (e.g. 'J01CR02' or 'J01' for the antibacterials class) → class match; (3) **Generic name** EN or 中文 → ILIKE; (4) **Brand name / alias** → secondary fallback. **Use when** an agent has any drug identifier and needs the canonical record for billing / SOAP / appeal context. **Typical follow-up**: call `get_drug_rules({drug_category_query})` for NHI payment rules / prior-authorization on this drug, `lookup_icd10_cm` for the diagnosis side, or `count_appeal_precedents_for_rejection_code` if a rejection code is involved. **Out of scope**: drug-drug interactions, severity scoring, indication-specific dosing. **Reference only** — TFDA license / 健保 給付規定 are authoritative. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          "Search term: generic name (EN or 中文), brand name, alias, NHI 9碼, or ATC code. Minimum 2 chars (unless atc_prefix is provided).",
      },
      atc_prefix: {
        type: 'string',
        description:
          "Optional ATC code prefix to filter / browse by therapeutic class (e.g. 'J01' = systemic antibacterials, 'C09' = renin-angiotensin agents). Can be used alone to enumerate a class.",
      },
      form: {
        type: 'string',
        description:
          "Optional dosage_form filter (e.g. 'tablet', 'capsule', 'cream', 'ointment', 'inj', 'syrup'). Partial match.",
      },
      limit: {
        type: 'integer',
        description: 'Max results (1..30). Default 15.',
        minimum: 1,
        maximum: 30,
        default: 15,
      },
    },
  },
} as const;

export interface SearchTaiwanDrugArgs {
  query?: string;
  atc_prefix?: string;
  form?: string;
  limit?: number;
}

export async function runSearchTaiwanDrug(
  client: OpdstarClient,
  args: SearchTaiwanDrugArgs = {}
): Promise<SearchTaiwanDrugResult> {
  const query = (args.query ?? '').trim();
  const atcPrefix = (args.atc_prefix ?? '').trim();
  if (query.length < 2 && !atcPrefix) {
    throw new Error('query must be at least 2 characters (or pass atc_prefix to browse by class)');
  }
  return (await client.get('/search-taiwan-drug', {
    query,
    atc_prefix: atcPrefix,
    form: args.form,
    limit: args.limit,
  })) as SearchTaiwanDrugResult;
}
