import type { OpdstarClient } from '../client.js';

export const LOOKUP_SPECIAL_MATERIAL_DEF = {
  name: 'lookup_special_material',
  description:
    "Look up Taiwan NHI 特殊材料給付規定 (special-material payment rules) — returns the official rule text verbatim, quantity limits, whether prior authorisation applies, the procedure codes the material is claimed alongside, and the effective-date window. **Use when** a claim involves an implant, catheter, stapler, lens, stent or similar device and the agent needs the conditions under which it is reimbursed, or needs to check which materials pair with a given procedure code. **Version matters**: a material code can carry several historical rule versions and a superseded rule reads exactly like a live one — the default `current: true` returns only the rule in force; pass `current: false` deliberately when tracing history. **Don't use** for the procedure's own payment conditions — that is `lookup_fee_code`. **Reference only** — claiming decisions require physician judgement. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        description:
          "給付規定分類碼 (format [A-Z]\\d{2,3}-\\d+, e.g. 'A101-1', 'I203-12'), or a name fragment in 中文 or English (e.g. '縫合釘', 'Hem-o-lok', 'stapler').",
      },
      procedure: {
        type: 'string',
        description:
          "Optional NHI procedure code (e.g. '62015B'). Returns materials whose rule text names that procedure as a claiming context.",
      },
      current: {
        type: 'boolean',
        description:
          'Return only the rule version currently in force. Default true. Set false to include superseded versions when tracing how a rule changed.',
      },
    },
  },
} as const;

export interface LookupSpecialMaterialArgs {
  q?: string;
  procedure?: string;
  current?: boolean;
}

export interface SpecialMaterialEntry {
  material_code: string;
  name_zh: string;
  name_en: string | null;
  category: string | null;
  subcategory: string | null;
  effective_start: string;
  effective_end: string | null;
  is_current: boolean;
  rule_text: string | null;
  rule_text_full_length: number;
  quantity_limit: string | null;
  prior_authorization: boolean;
  procedure_code_refs: string[];
  source_document: string;
  source_url: string | null;
  source_revision: string | null;
}

export interface LookupSpecialMaterialResult {
  filters: { q: string | null; procedure: string | null; current_only: boolean };
  count: number;
  truncated?: boolean;
  results: SpecialMaterialEntry[];
  message?: string;
  note?: string;
}

export async function runLookupSpecialMaterial(
  client: OpdstarClient,
  args: LookupSpecialMaterialArgs,
): Promise<LookupSpecialMaterialResult> {
  return (await client.get('/lookup-special-material', {
    q: args?.q?.trim(),
    procedure: args?.procedure?.trim().toUpperCase(),
    current: args?.current === false ? 'false' : undefined,
  })) as LookupSpecialMaterialResult;
}
