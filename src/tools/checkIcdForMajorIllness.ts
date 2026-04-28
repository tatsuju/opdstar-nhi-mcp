import type { OpdstarClient } from '../client.js';

export const CHECK_ICD_FOR_MAJOR_ILLNESS_DEF = {
  name: 'check_icd_for_major_illness_eligibility',
  description:
    "Reverse lookup: given an ICD-10 code, return the Taiwan NHI 重大傷病 (major illness) categories that the diagnosis may qualify for. Returns category code, name, ICD pattern that matched, and whether copayment exemption applies. NOTE: this is a reference lookup — final eligibility requires a formal application with supporting documentation per official rules. For category browsing, use lookup_major_illness. Data curated by OPDSTAR (https://opdstar.com).",
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
