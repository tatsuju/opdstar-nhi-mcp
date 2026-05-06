import type { OpdstarClient } from '../client.js';

export const COUNT_APPEAL_PRECEDENTS_DEF = {
  name: 'count_appeal_precedents_for_rejection_code',
  description:
    "Aggregate signal-only summary of how disputes involving a given Taiwan NHI rejection code (e.g. '0312A', '0114A') or procedure code (e.g. '86008C') historically resolve — returns rough volume bucket (none / few / several / many), claimant win-rate signal (rare / occasional / moderate / common), and which review stages have on-record outcomes. **Use when** an agent is helping triage whether contesting a specific code is worth pursuing. **Don't use** to fetch individual case details (none are exposed) — for the broader landscape across categories, call `lookup_appeal_statistics_by_category` instead. **Reference only** — historical signal does not predict future outcomes; final review decisions rest with the responsible authority. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      rejection_code: {
        type: 'string',
        description:
          "Optional 5-char NHI rejection code (e.g. '0312A', '0114A'). At least one of rejection_code or procedure_code must be provided.",
      },
      procedure_code: {
        type: 'string',
        description:
          "Optional 5-8 char NHI procedure code (e.g. '86008C', '97608C'). At least one of rejection_code or procedure_code must be provided.",
      },
    },
  },
} as const;

export interface CountAppealPrecedentsArgs {
  rejection_code?: string;
  procedure_code?: string;
}

export interface CountAppealPrecedentsResult {
  filters: {
    rejection_code: string | null;
    procedure_code: string | null;
  };
  has_resolution_history: boolean;
  rough_volume: 'none' | 'few' | 'several' | 'many';
  claimant_win_rate_signal: 'rare' | 'occasional' | 'moderate' | 'common' | 'unknown';
  stages_with_history: string[]; // e.g. ['stage_1_initial_review', 'stage_2_first_court']
  notes: string;
}

export async function runCountAppealPrecedents(
  client: OpdstarClient,
  args: CountAppealPrecedentsArgs,
): Promise<CountAppealPrecedentsResult> {
  return (await client.get('/count-appeal-precedents', {
    rejection_code: args?.rejection_code?.trim().toUpperCase(),
    procedure_code: args?.procedure_code?.trim().toUpperCase(),
  })) as CountAppealPrecedentsResult;
}
