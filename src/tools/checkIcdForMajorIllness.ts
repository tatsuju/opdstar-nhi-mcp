import type { OpdstarClient } from '../client.js';

export const CHECK_ICD_FOR_MAJOR_ILLNESS_DEF = {
  name: 'check_icd_for_major_illness_eligibility',
  description:
    "Reverse-lookup: given a single ICD-10 code, return the Taiwan NHI 重大傷病 (major illness) categories the diagnosis may qualify for, including category name, the ICD pattern that matched, and copayment-exemption flag. **Use when** an agent has a diagnosis and needs to flag major-illness applicability before claim submission. **Don't use** to browse all categories — call `lookup_major_illness` instead (also use it for the category → applicable ICDs direction). **Reference only** — confirmed eligibility still requires a formal application with supporting documentation per the official 重大傷病範圍及項目. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      icd_code: {
        type: 'string',
        description:
          "Required ICD-10 code (e.g. 'C50.9' breast cancer, 'N18.6' end-stage renal disease, 'F20.9' schizophrenia). Case-insensitive. Prefix-matches against the official ICD-10 ranges defined per category.",
        minLength: 2,
      },
    },
    required: ['icd_code'],
  },
} as const;

export interface CheckIcdForMajorIllnessArgs {
  icd_code: string;
}

export interface MajorIllnessMatch {
  category_code: string;
  category_name: string;
  matched_pattern: string;
  copay_exemption: boolean;
  application_required: boolean;
}

export interface CheckIcdForMajorIllnessResult {
  icd_code: string;
  count: number;
  results: MajorIllnessMatch[];
  message?: string;
  note?: string;
}

export async function runCheckIcdForMajorIllness(
  client: OpdstarClient,
  args: CheckIcdForMajorIllnessArgs,
): Promise<CheckIcdForMajorIllnessResult> {
  if (!args || typeof args.icd_code !== 'string' || args.icd_code.trim().length < 2) {
    throw new Error('Missing or too-short parameter: icd_code (must be ≥2 chars)');
  }
  return (await client.get('/check-icd-major-illness', {
    icd_code: args.icd_code.trim().toUpperCase(),
  })) as CheckIcdForMajorIllnessResult;
}
