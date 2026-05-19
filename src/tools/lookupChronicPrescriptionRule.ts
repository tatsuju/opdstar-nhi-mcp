import type { OpdstarClient } from '../client.js';

export const LOOKUP_CHRONIC_PRESCRIPTION_RULE_DEF = {
  name: 'lookup_chronic_prescription_rule',
  description:
    "Look up Taiwan NHI chronic-disease continuous-prescription (慢性病連續處方箋) rules. Given an ICD-10 code or a disease name, returns whether the condition falls within the official chronic-disease scope and its dispensing limits — maximum days per dispense, maximum total medication days, and prescription validity. **Use when** an agent needs to know if a diagnosis qualifies for a continuous prescription and the applicable day limits. **Reference only** — the issuing physician must confirm the patient's condition is stable and that the same long-term medication applies, per the official 全民健康保險醫療辦法 慢性病範圍. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      icd_code: {
        type: 'string',
        description:
          "Optional ICD-10 code (e.g. 'I10', 'E11.9'). Prefix-matched against each chronic disease's ICD-10 range.",
      },
      disease: {
        type: 'string',
        description: "Optional Chinese disease name keyword (e.g. '高血壓', '糖尿病', '氣喘').",
      },
      category: {
        type: 'string',
        description:
          "Optional disease category (e.g. 'cardiovascular', 'endocrine_metabolic', 'respiratory', 'psychiatric').",
      },
    },
  },
} as const;

export interface LookupChronicPrescriptionRuleArgs {
  icd_code?: string;
  disease?: string;
  category?: string;
}

export interface ChronicPrescriptionRuleEntry {
  rule_key: string;
  disease_group: string;
  disease_category: string | null;
  applicable_icd_pattern: string[];
  icd_range_text: string | null;
  max_days_per_dispense: number | null;
  max_total_days: number | null;
  validity_days: number | null;
  max_refill_count: number | null;
  special_dispense_rule: string | null;
  stable_condition_required: boolean;
  excluded_drug_levels: string | null;
  notes: string | null;
  source_document: string | null;
  source_url: string | null;
}

export interface LookupChronicPrescriptionRuleResult {
  filters: {
    icd_code: string | null;
    disease: string | null;
    category: string | null;
  };
  count: number;
  results: ChronicPrescriptionRuleEntry[];
  message?: string;
}

export async function runLookupChronicPrescriptionRule(
  client: OpdstarClient,
  args: LookupChronicPrescriptionRuleArgs,
): Promise<LookupChronicPrescriptionRuleResult> {
  return (await client.get('/lookup-chronic-prescription-rule', {
    icd_code: args?.icd_code?.trim(),
    disease: args?.disease?.trim(),
    category: args?.category?.trim(),
  })) as LookupChronicPrescriptionRuleResult;
}
