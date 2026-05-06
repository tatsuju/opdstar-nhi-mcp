import type { OpdstarClient } from '../client.js';

export const LOOKUP_MAJOR_ILLNESS_DEF = {
  name: 'lookup_major_illness',
  description:
    "Browse Taiwan NHI 重大傷病 (major illness) categories — official categories that grant copayment exemption and a more lenient claim-review process. Returns category name, ICD-10 code coverage, application requirement, and validity period. **Use when** an agent needs to enumerate or filter major-illness categories (e.g. 'all cancer categories', 'categories that don't require an application'). **Don't use** if you already have an ICD-10 code and want to know which categories it qualifies for — call `check_icd_for_major_illness_eligibility` instead. **Reference only** — final eligibility requires a formal application with supporting documentation per the official 重大傷病範圍及項目. Curated by OPDSTAR (https://opdstar.com).",
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
