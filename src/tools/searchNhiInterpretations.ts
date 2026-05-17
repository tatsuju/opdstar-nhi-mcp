import type { OpdstarClient } from '../client.js';
import type { SearchInterpretationsResult } from '../types.js';

export const SEARCH_NHI_INTERPRETATIONS_DEF = {
  name: 'search_nhi_interpretations',
  description:
    "Search Taiwan's official NHI administrative interpretations (健保署行政函釋 / 函令) — the binding 公告 and 解釋函 issued by the National Health Insurance Administration that clarify how payment rules, drug-formulary provisions, special-material coverage, and review policy apply in practice. Each result returns the official document number (字號), issue date, 主旨 (subject), a content excerpt, and the source URL on the government law portal. Returns up to 10 ranked excerpts (most relevant first); returns an empty list (not an error) when nothing matches. **Use when** a question turns on an official ruling rather than a code definition — e.g. '函釋怎麼說人工水晶體的給付規定' / 'is there an interpretation on continuous-prescription day limits' — or when the user cites a 函釋 文號 directly (e.g. 健保審字第 1090017813 號). **Don't use** when you already have a specific rejection code, fee code, or drug name — those have dedicated lookup tools (`lookup_rejection_code`, `lookup_fee_code`, `lookup_drug`). **Reference only** — the official 健保署 / 衛福部 publication is authoritative; an excerpt may lag the latest revision and is not the full document, so open the source URL for the binding text. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Required. Natural-language query in Traditional Chinese or English, OR a 函釋 document number. Multi-word phrases work best (concept + qualifier). Examples: "人工水晶體 給付規定" / "continuous prescription day limit interpretation" / "健保審字第1090017813號". Single characters or 1-letter strings are unlikely to return useful matches.',
        minLength: 2,
      },
      limit: {
        type: 'integer',
        description:
          'Optional. Maximum number of ranked excerpts to return. Range 1-10. Default 5. Increase to 10 when surveying a topic; keep at 5 for a targeted look-up to save context.',
        minimum: 1,
        maximum: 10,
        default: 5,
      },
    },
    required: ['query'],
  },
} as const;

export interface SearchNhiInterpretationsArgs {
  query: string;
  limit?: number;
}

export async function runSearchNhiInterpretations(
  client: OpdstarClient,
  args: SearchNhiInterpretationsArgs
): Promise<SearchInterpretationsResult> {
  if (!args || typeof args.query !== 'string') {
    throw new Error('Missing required parameter: query');
  }
  return (await client.post('/search-interpretations', {
    query: args.query,
    limit: args.limit,
  })) as SearchInterpretationsResult;
}
