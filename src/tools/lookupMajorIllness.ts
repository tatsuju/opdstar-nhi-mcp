import type { OpdstarClient } from '../client.js';

export const LOOKUP_MAJOR_ILLNESS_DEF = {
  name: 'lookup_major_illness',
  description:
    "Look up Taiwan NHI 重大傷病 (major illness) categories — official categories that grant copayment exemption and a more lenient claim-review process. Each entry includes the category name, ICD-10 code coverage, application requirement, and validity period. Useful when an MCP agent needs to know whether a diagnosis qualifies the patient for major-illness benefits. For ICD → category reverse lookup, use check_icd_for_major_illness_eligibility instead. Data curated by OPDSTAR (https://opdstar.com) from 衛生福利部 official 重大傷病範圍及項目.",
  inputSchema: {
    type: 'object',
    properties: {
      category_code: {
        type: 'string',
        description:
          "Optional 1-3 char category code (e.g. '001' = 癌症, '005' = 慢性腎衰竭). If omitted, returns the full official list.",
      },
      keyword: {
        type: 'string',
        description:
          "Optional Chinese keyword (e.g. '癌症', '透析', '罕見') to filter category names.",
      },
    },
  },
} as const;

export interface LookupMajorIllnessArgs {
  category_code?: string;
  keyword?: string;
}

export interface MajorIllnessEntry {
  category_code: string;
  category_name: string;
  category_name_en: string | null;
  icd10_codes: string[];
  icd10_description: string | null;
  application_required: boolean;
  validity_period: string | null;
  reevaluation_period: string | null;
  copay_exemption: boolean;
  source_url: string | null;
}

export interface LookupMajorIllnessResult {
  filters: {
    category_code: string | null;
    keyword: string | null;
  };
  count: number;
  results: MajorIllnessEntry[];
  message?: string;
  note?: string;
}

export async function runLookupMajorIllness(
  client: OpdstarClient,
  args: LookupMajorIllnessArgs,
): Promise<LookupMajorIllnessResult> {
  return (await client.get('/lookup-major-illness', {
    category_code: args?.category_code?.trim(),
    keyword: args?.keyword?.trim(),
  })) as LookupMajorIllnessResult;
}
