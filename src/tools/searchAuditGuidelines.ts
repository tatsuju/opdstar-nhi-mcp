import type { OpdstarClient } from '../client.js';
import type { SearchAuditGuidelinesResult } from '../types.js';

export const SEARCH_AUDIT_GUIDELINES_DEF = {
  name: 'search_audit_guidelines',
  description:
    "Free-text search over Taiwan NHI 審查注意事項 rules — returns reason + suggestion summaries (first sentence only) for up to 10 rules matching a keyword (Traditional Chinese or English). **Use when** an agent is exploring whether any audit rule covers a topic (e.g. '抗生素', '檢查頻率', '慢性病處方') without knowing a specific code. **Don't use** for clauses tied to a known procedure code — call `lookup_audit_clauses_for_procedure` instead. Full SOAP example templates and detailed reasoning are part of the paid OPDSTAR product. **Reference only** — official 健保署 審查注意事項 is authoritative; results are previews. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          "Free-text query (2+ chars), Traditional Chinese or English. Examples: '抗生素', '檢查頻率', '慢性病處方'.",
        minLength: 2,
      },
      specialty: {
        type: 'string',
        description:
          "Optional specialty filter (e.g. 'tcm', 'dermatology'). Omit to search all specialties.",
      },
    },
    required: ['query'],
  },
} as const;

export interface SearchAuditGuidelinesArgs {
  query: string;
  specialty?: string;
}

export async function runSearchAuditGuidelines(
  client: OpdstarClient,
  args: SearchAuditGuidelinesArgs
): Promise<SearchAuditGuidelinesResult> {
  if (!args || typeof args.query !== 'string' || args.query.trim().length < 2) {
    throw new Error('Missing or too-short required parameter: query (2+ chars)');
  }
  return (await client.get('/search-audit-guidelines', {
    query: args.query.trim(),
    specialty: args.specialty?.trim().toLowerCase(),
  })) as SearchAuditGuidelinesResult;
}
