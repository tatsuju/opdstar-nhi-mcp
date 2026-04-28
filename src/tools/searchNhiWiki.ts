import type { OpdstarClient } from '../client.js';
import type { SearchWikiResult } from '../types.js';

const CATEGORIES = [
  'audit','drugs','fees','plans','services','insurance','forms','records','admin',
] as const;

export const SEARCH_NHI_WIKI_DEF = {
  name: 'search_nhi_wiki',
  description:
    "Semantic + full-text search across Taiwan's official NHI Wiki (健保署全球資訊網), 9 categories: audit (審查)/drugs (藥品特材)/fees (費用)/plans (醫療計畫)/services (醫療服務)/insurance (投保)/forms (表單)/records (紀錄)/admin (行政). Curated and indexed by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Natural language query in Traditional Chinese or English, e.g. "慢性病連續處方箋天數上限"',
      },
      category: {
        type: 'string',
        description: 'Optional category filter — narrows search to one of 9 NHI categories',
        enum: [...CATEGORIES],
      },
      limit: {
        type: 'integer',
        description: 'Max results (1-10, default 5)',
        minimum: 1,
        maximum: 10,
        default: 5,
      },
    },
    required: ['query'],
  },
} as const;

export interface SearchNhiWikiArgs {
  query: string;
  category?: string;
  limit?: number;
}

export async function runSearchNhiWiki(
  client: OpdstarClient,
  args: SearchNhiWikiArgs
): Promise<SearchWikiResult> {
  if (!args || typeof args.query !== 'string') {
    throw new Error('Missing required parameter: query');
  }
  return (await client.post('/search-wiki', {
    query: args.query,
    category: args.category,
    limit: args.limit,
  })) as SearchWikiResult;
}
