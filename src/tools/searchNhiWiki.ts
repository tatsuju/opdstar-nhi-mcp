import type { OpdstarClient } from '../client.js';
import type { SearchWikiResult } from '../types.js';

const CATEGORIES = [
  'audit','drugs','fees','plans','services','insurance','forms','records','admin',
] as const;

export const SEARCH_NHI_WIKI_DEF = {
  name: 'search_nhi_wiki',
  description:
    "Search across Taiwan's official NHI knowledge base (健保署全球資訊網) for natural-language background questions. Covers 9 categories: audit (審查 — review rules / rejection grounds), drugs (藥品特材 — formulary, payment limits), fees (費用 — copay, premiums, contribution), plans (醫療計畫 — disease-management programs), services (醫療服務 — covered benefits), insurance (投保 — enrollment), forms (表單 — applications), records (紀錄 — documentation rules), admin (行政 — contracting, accreditation). Returns up to 10 ranked excerpts (most relevant first); each result includes title, content snippet, source URL, and category tag. Returns an empty list (not an error) when the query has no matches. **Use when** an agent needs broad NHI policy background not tied to a specific code — e.g. '慢性病連續處方箋天數上限' / 'how does balance billing work for orthodontics' / 'what are the rules for telemedicine reimbursement'. **Typical follow-up**: when an excerpt mentions a specific code (e.g. '0317A', '00101B'), call the appropriate code-specific tool (`lookup_rejection_code`, `lookup_fee_code`) for the canonical entry. **Don't use** when you already know a specific rejection code, procedure code, drug name, or audit-clause topic — those have dedicated tools that return structured fields rather than excerpts. **Reference only** — official 健保署 publications are authoritative; ranked excerpts may lag the latest revision and the snippet is not the full document. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Required. Natural-language query in Traditional Chinese or English. Multi-word phrases work best (concept + qualifier). Examples: "慢性病連續處方箋天數上限" / "急診轉診費用" / "telemedicine reimbursement rules" / "orthodontic balance billing". Single Chinese characters or 1-letter strings are unlikely to return useful matches.',
        minLength: 2,
      },
      category: {
        type: 'string',
        description:
          "Optional. Narrows the search to one category. Use `audit` for review/rejection rules, `drugs` for formulary/payment limits, `fees` for copay/premiums, `plans` for disease-management programs, `services` for covered benefits, `insurance` for enrollment, `forms` for applications, `records` for documentation rules, `admin` for contracting/accreditation. Omit to search all categories (recommended when the topic is unclear).",
        enum: [...CATEGORIES],
      },
      limit: {
        type: 'integer',
        description:
          'Optional. Maximum number of ranked excerpts to return. Range 1-10. Default 5. Increase to 10 when surveying a topic; keep at 5 for targeted look-ups to save context.',
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
