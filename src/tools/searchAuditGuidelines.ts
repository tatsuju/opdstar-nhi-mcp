import type { OpdstarClient } from '../client.js';
import type { SearchAuditGuidelinesResult } from '../types.js';

export const SEARCH_AUDIT_GUIDELINES_DEF = {
  name: 'search_audit_guidelines',
  description:
    "Free-text search over Taiwan NHI 審查注意事項 rules maintained in the OPDSTAR audit engine. Returns reason + suggestion summaries (first sentence only) for rules matching a keyword. Full SOAP example templates and detailed explanations are part of the paid OPDSTAR product. Up to 10 rules per call. Data curated by OPDSTAR (https://opdstar.com).",
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
