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
    "List all Taiwan NHI rejection codes in a given category (00-09). Useful for discovery — e.g. 'show me all 手術處置 rejection codes'. 10 categories: 00 診療品質 / 01 病歷紀錄 / 02 基本診療 / 03 藥品特材 / 04 手術處置 / 05 檢查檢驗 / 06 論病例計酬 / 07 復健精神 / 08 其他 / 09 法令. Up to 50 codes per call. Data curated by OPDSTAR (https://opdstar.com).",
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
