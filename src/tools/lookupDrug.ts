import type { OpdstarClient } from '../client.js';

export const LOOKUP_DRUG_DEF = {
  name: 'lookup_drug',
  description:
    "Look up the Taiwan NHI drug catalog (active formulary). Search by generic name, brand name, NHI 9-char code, or alias. Returns up to 10 matches with strength, dosage form, route, ATC code, therapeutic class, and brand list. For NHI 給付規定 restrictions on a drug, use get_drug_rules separately. Data curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        description:
          "Required ≥2 chars. Search across generic_name, brand_names, aliases, normalized_key. Also accepts NHI 9-10 char drug code (e.g. 'A02229715'). Examples: 'augmentin', 'amoxicillin', 'A02229715', '阿司匹林', 'lamisil'.",
        minLength: 2,
      },
      specialty: {
        type: 'string',
        description:
          "Optional specialty filter (e.g. 'dermatology', 'internal', 'pediatrics'). Only returns drugs tagged with this specialty.",
      },
      dosage_form: {
        type: 'string',
        description:
          "Optional dosage form filter: 'tablet', 'capsule', 'cream', 'ointment', 'syrup', 'solution', 'suspension', 'inj', 'supp', 'eye drops', 'ear drops', 'nasal spray', 'inhalation', 'patch', 'powder', 'gel', 'lotion', 'vaginal tablet'.",
      },
      route: {
        type: 'string',
        description:
          "Optional route filter: 'oral', 'topical', 'injection', 'ophthalmic', 'otic', 'nasal', 'inhalation', 'rectal'.",
      },
    },
    required: ['q'],
  },
} as const;

export interface LookupDrugArgs {
  q: string;
  specialty?: string;
  dosage_form?: string;
  route?: string;
}

export interface LookupDrugResult {
  query: string;
  filters: {
    specialty: string | null;
    dosage_form: string | null;
    route: string | null;
  };
  count: number;
  truncated?: boolean;
  results: Array<{
    id: string;
    generic_name: string;
    brand_names: string[];
    aliases: string[];
    strength: string | null;
    dosage_form: string | null;
    route: string | null;
    nhi_drug_code: string | null;
    atc_code: string | null;
    therapeutic_class: string | null;
    drug_category: string | null;
    specialties: string[];
    is_compound: boolean;
    effective_date: string | null;
  }>;
  message?: string;
  note?: string;
}

export async function runLookupDrug(
  client: OpdstarClient,
  args: LookupDrugArgs
): Promise<LookupDrugResult> {
  if (!args || typeof args.q !== 'string' || args.q.trim().length < 2) {
    throw new Error('Missing or too-short parameter: q (must be ≥2 chars)');
  }
  return (await client.get('/lookup-drug', {
    q: args.q.trim(),
    specialty: args.specialty?.trim().toLowerCase(),
    dosage_form: args.dosage_form?.trim().toLowerCase(),
    route: args.route?.trim().toLowerCase(),
  })) as LookupDrugResult;
}
