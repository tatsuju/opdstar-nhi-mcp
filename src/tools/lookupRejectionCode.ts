import type { OpdstarClient } from '../client.js';
import type { LookupRejectionCodeResult } from '../types.js';

export const LOOKUP_REJECTION_CODE_DEF = {
  name: 'lookup_rejection_code',
  description:
    "Look up a single Taiwan NHI rejection code (5-character format `NNNNL` — 4 digits + 1 uppercase letter A/B/C/..., e.g. '0317A', '0338A', '0114A'). Returns severity (low / medium / high), category (00 診療品質 · 01 病歷紀錄 · 02 基本診療 · 03 藥品特材 · 04 手術處置 · 05 檢查檢驗 · 06 論病例計酬 · 07 復健精神 · 08 其他 · 09 法令 — first two digits encode the category), and the official Chinese description from 健保署 專業審查不予支付理由代碼. Returns a not-found message (not an error) if the code does not exist. **Use when** an agent encounters a known rejection code in a notice or claim response and needs the human-readable explanation, or when triaging which category a code belongs to. **Typical follow-up**: call `get_drug_rules({rejection_code})` if the code is in category 03 (藥品特材) to surface the drug rule behind the rejection; call `search_audit_guidelines({query: <code>})` for codes in 04 / 05 to read the underlying audit-clause text; call `count_appeal_precedents_for_rejection_code({rejection_code})` to gauge whether disputes for this code are commonly successful. **Don't use** to enumerate codes by category — call `get_rejection_code_category({category})` instead. **Reference only** — the official 健保署 code list is authoritative. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description:
          "Required. The exact 5-character NHI rejection code in `NNNNL` format (4 digits followed by 1 uppercase letter). Lowercase letters are auto-uppercased; whitespace is trimmed. Examples: '0317A' (病歷紀錄不全) / '0338A' (藥品特材) / '0114A' (病歷紀錄). The first two digits identify the category (00-09).",
        pattern: '^[0-9]{4}[A-Z]$',
        minLength: 5,
        maxLength: 5,
      },
    },
    required: ['code'],
  },
} as const;

export interface LookupRejectionCodeArgs {
  code: string;
}

export async function runLookupRejectionCode(
  client: OpdstarClient,
  args: LookupRejectionCodeArgs
): Promise<LookupRejectionCodeResult> {
  if (!args || typeof args.code !== 'string') {
    throw new Error('Missing required parameter: code');
  }
  const result = (await client.get('/lookup-rejection-code', {
    code: args.code.trim().toUpperCase(),
  })) as LookupRejectionCodeResult;
  return result;
}
