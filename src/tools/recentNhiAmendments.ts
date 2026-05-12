import type { OpdstarClient } from '../client.js';
import type { RecentNhiAmendmentsResult } from '../types.js';

export const RECENT_NHI_AMENDMENTS_DEF = {
  name: 'recent_nhi_amendments',
  description:
    "List recent amendments to Taiwan NHI rules and audit guidelines (健保署「醫療費用審查注意事項」近一年修正公告). Returns the publication / effective dates, the amendment title and type ('primary' = main regulation update, 'comparison' = side-by-side diff document), and direct links to the official DOCX / ODT / PDF announcement files plus the 健保署 listing page. **Use when** an agent needs to answer 'what NHI rule changes are coming?', 'when does the new 審查注意事項 take effect?', or wants to check whether a specific rule has been recently amended before quoting it. **Typical follow-up**: call `search_audit_guidelines({query})` to pull the post-amendment clause text, or `lookup_rejection_code({code})` to see how it ties into existing rejection codes. **Reference only** — official 健保署 announcements are authoritative. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      since_days: {
        type: 'integer',
        description:
          "Limit to amendments effective within N days from today (1..3650). Default 365 (近一年).",
        minimum: 1,
        maximum: 3650,
        default: 365,
      },
      type: {
        type: 'string',
        enum: ['primary', 'comparison', 'all'],
        description:
          "'primary' = main regulation update (affects nhi_audit_clauses content); 'comparison' = side-by-side diff document. 'all' returns both. Default 'all'.",
        default: 'all',
      },
      limit: {
        type: 'integer',
        description: 'Max results (1..50). Default 20.',
        minimum: 1,
        maximum: 50,
        default: 20,
      },
    },
  },
} as const;

export interface RecentNhiAmendmentsArgs {
  since_days?: number;
  type?: 'primary' | 'comparison' | 'all';
  limit?: number;
}

export async function runRecentNhiAmendments(
  client: OpdstarClient,
  args: RecentNhiAmendmentsArgs = {}
): Promise<RecentNhiAmendmentsResult> {
  return (await client.get('/recent-amendments', {
    since_days: args.since_days,
    type: args.type,
    limit: args.limit,
  })) as RecentNhiAmendmentsResult;
}
