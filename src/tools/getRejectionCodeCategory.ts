import type { OpdstarClient } from '../client.js';
import type { RejectionCodesByCategoryResult } from '../types.js';

const CATEGORIES = [
  '00', // 診療品質
  '01', // 病歷紀錄
  '02', // 基本診療
  '03', // 藥品特材
  '04', // 手術處置
  '05', // 檢查檢驗
  '06', // 論病例計酬
  '07', // 復健精神
  '08', // 其他
  '09', // 法令
] as const;

export const GET_REJECTION_CODE_CATEGORY_DEF = {
  name: 'get_rejection_code_category',
  description:
    "Browse Taiwan NHI rejection codes by category (00-09) for discovery — returns code, severity, and short description, up to 50 per call. Categories: 00 診療品質 · 01 病歷紀錄 · 02 基本診療 · 03 藥品特材 · 04 手術處置 · 05 檢查檢驗 · 06 論病例計酬 · 07 復健精神 · 08 其他 · 09 法令. **Use when** an agent needs to enumerate all rejection codes within a workflow domain (e.g. all surgery-handling codes). **Don't use** to look up a known specific code — call `lookup_rejection_code` instead. **Reference only** — official 健保署 不予支付理由代碼 is authoritative. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: "Two-digit category code, '00' through '09'",
        enum: [...CATEGORIES],
      },
      opdstar_relevant_only: {
        type: 'boolean',
        description:
          'When true, filter to codes flagged as outpatient-relevant by OPDSTAR. Default false (return all).',
        default: false,
      },
    },
    required: ['category'],
  },
} as const;

export interface GetRejectionCodeCategoryArgs {
  category: string;
  opdstar_relevant_only?: boolean;
}

export async function runGetRejectionCodeCategory(
  client: OpdstarClient,
  args: GetRejectionCodeCategoryArgs
): Promise<RejectionCodesByCategoryResult> {
  if (!args || typeof args.category !== 'string') {
    throw new Error('Missing required parameter: category');
  }
  return (await client.get('/rejection-codes-by-category', {
    category: args.category.trim(),
    opdstar_relevant_only: args.opdstar_relevant_only ? 'true' : undefined,
  })) as RejectionCodesByCategoryResult;
}
