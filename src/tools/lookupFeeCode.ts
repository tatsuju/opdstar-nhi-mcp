import type { OpdstarClient } from '../client.js';

export const LOOKUP_FEE_CODE_DEF = {
  name: 'lookup_fee_code',
  description:
    "Look up the Taiwan NHI fee schedule (全民健康保險醫療服務給付項目及支付標準, current effective edition). Search by exact code (e.g. '00101B', 'P15001'), or by Chinese/English name (e.g. '門診診察', 'ICU'). Returns code, points, effective dates, and audit notes (truncated to 600 chars). Use category prefix to scope ('00' 基本診療, '06' 手術, 'P1' 病例計酬, 'N2' 護理). Use icd to filter by OPDSTAR-curated ICD-10 mapping. Data curated by OPDSTAR (https://opdstar.com) from 健保署官方支付標準. For a drug code, use lookup_drug. For an ICD-10 → procedure mapping, use get_procedures_for_icd.",
  inputSchema: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        description:
          "Required ≥2 chars. Exact code match for 2-8 char alphanumerics (e.g. '00101B', 'OT1', 'P15001'); otherwise ILIKE search across name_zh + name_en. Examples: '00101B', '門診診察費', 'ICU', '麻醉', 'physical therapy'.",
        minLength: 2,
      },
      category: {
        type: 'string',
        description:
          "Optional 1-2 char category prefix filter. Examples: '00' 基本診療, '01' 麻醉, '06' 手術, '08' 檢驗, 'P1'/'P4' 病例計酬, 'N2' 護理, 'A0'-'D9' 牙醫.",
      },
      icd: {
        type: 'string',
        description:
          "Optional ICD-10 code to filter by OPDSTAR-curated applicable_icd_pattern. NOTE: this mapping is sparse — original NHI data has no ICD field; OPDSTAR enriches incrementally. Most codes will return no result with icd filter active.",
      },
    },
    required: ['q'],
  },
} as const;

export interface LookupFeeCodeArgs {
  q: string;
  category?: string;
  icd?: string;
}

export interface LookupFeeCodeResult {
  query: string;
  filters: {
    category: string | null;
    icd: string | null;
  };
  count: number;
  truncated?: boolean;
  results: Array<{
    code: string;
    category_prefix: string;
    section: string | null;
    chapter: string | null;
    name_zh: string;
    name_en: string | null;
    points: number | null;
    effective_start: string;
    effective_end: string | null;
    audit_notes: string | null;
    audit_notes_full_length: number;
    applicable_icd_pattern: string[];
    specialty_tags: string[];
  }>;
  message?: string;
  note?: string;
}

export async function runLookupFeeCode(
  client: OpdstarClient,
  args: LookupFeeCodeArgs,
): Promise<LookupFeeCodeResult> {
  if (!args || typeof args.q !== 'string' || args.q.trim().length < 2) {
    throw new Error('Missing or too-short parameter: q (must be ≥2 chars)');
  }
  return (await client.get('/lookup-fee-code', {
    q: args.q.trim(),
    category: args.category?.trim().toUpperCase(),
    icd: args.icd?.trim().toUpperCase(),
  })) as LookupFeeCodeResult;
}
