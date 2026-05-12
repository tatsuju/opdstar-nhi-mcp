import type { OpdstarClient } from '../client.js';
import type { LookupIcd10CmResult } from '../types.js';

export const LOOKUP_ICD10_CM_DEF = {
  name: 'lookup_icd10_cm',
  description:
    "Look up ICD-10-CM diagnosis codes with English / Traditional Chinese descriptions, category, and the OPDSTAR specialties each code is keyed against. **Use when** the agent encounters an ICD-10 code in a note, claim, or rejection notice and needs the canonical name, or wants to free-text search by EN / 中文 keyword to find candidate codes. **Typical follow-up**: chain into `get_procedures_for_icd({icd10, specialty})` to find the procedures commonly paired with the code, or `check_icd_for_major_illness_eligibility({icd10})` to check 重大傷病 coverage. **Scope note**: Currently backed by OPDSTAR's specialty-keyed Taiwan-relevant subset (~3,000 codes covering the diagnoses doctors actually code on outpatient claims); the full CMS public-domain ICD-10-CM 2025 set (~70K codes) will be merged in a later release. **Out of scope**: SNOMED CT cross-mapping, international procedure codes (ICD-10-PCS), drug interactions. **Reference only** — clinical coding decisions require physician judgment. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description:
          "ICD-10-CM code, with or without dot. Examples: 'L20.9', 'L209', 'l20.9'. Auto-normalized (uppercased; tries dotted + undotted forms).",
      },
      keyword: {
        type: 'string',
        description:
          "Free-text search across English description, Chinese description, and code prefix. Examples: 'eczema', '皮膚炎', 'L20'.",
      },
      lang: {
        type: 'string',
        enum: ['en', 'zh', 'both'],
        description:
          "Which description language(s) to include in the result. Default 'both'.",
        default: 'both',
      },
      limit: {
        type: 'integer',
        description: 'Max results (1..50). Default 10.',
        minimum: 1,
        maximum: 50,
        default: 10,
      },
    },
  },
} as const;

export interface LookupIcd10CmArgs {
  code?: string;
  keyword?: string;
  lang?: 'en' | 'zh' | 'both';
  limit?: number;
}

export async function runLookupIcd10Cm(
  client: OpdstarClient,
  args: LookupIcd10CmArgs = {}
): Promise<LookupIcd10CmResult> {
  const code = (args.code ?? '').trim();
  const keyword = (args.keyword ?? '').trim();
  if (!code && !keyword) {
    throw new Error('Provide at least one of: code, keyword');
  }
  return (await client.get('/lookup-icd10', {
    code,
    keyword,
    lang: args.lang,
    limit: args.limit,
  })) as LookupIcd10CmResult;
}
