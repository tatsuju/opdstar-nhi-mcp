import type { OpdstarClient } from '../client.js';

export const LOOKUP_MAJOR_ILLNESS_DEF = {
  name: 'lookup_major_illness',
  description:
    "Look up Taiwan NHI 重大傷病 (major illness) categories — official categories that grant copayment exemption and a more lenient claim-review process. Returns category name, ICD-10 code coverage, application requirement, and validity period. **Use when** an agent needs a category by code or by keyword (e.g. '癌症', '透析'). A call needs category_code or keyword; the full list is not served in one call. **Don't use** if you already have an ICD-10 code and want to know which categories it qualifies for — call `check_icd_for_major_illness_eligibility` instead. **Reference only** — final eligibility requires a formal application with supporting documentation per the official 重大傷病範圍及項目. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      category_code: {
        type: 'string',
        minLength: 1,
        pattern: '\\S',
        description:
          "1-3 char category code (e.g. '001' = 癌症, '005' = 慢性腎衰竭). Required unless keyword is given.",
      },
      keyword: {
        type: 'string',
        minLength: 1,
        pattern: '\\S',
        description:
          "Chinese keyword (e.g. '癌症', '透析', '罕見') matched against category names. Required unless category_code is given.",
      },
    },
    anyOf: [{ required: ['category_code'] }, { required: ['keyword'] }],
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
  if (!(args?.category_code?.trim() || args?.keyword?.trim())) {
    throw new Error('lookup_major_illness requires category_code or keyword');
  }
  return (await client.get('/lookup-major-illness', {
    category_code: args?.category_code?.trim(),
    keyword: args?.keyword?.trim(),
  })) as LookupMajorIllnessResult;
}
