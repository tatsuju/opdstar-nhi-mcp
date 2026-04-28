import type { OpdstarClient } from '../client.js';

export const COUNT_APPEAL_PRECEDENTS_DEF = {
  name: 'count_appeal_precedents_for_rejection_code',
  description:
    "Returns rough volume + win-rate signal for dispute resolutions involving a specific NHI rejection code (e.g. '0312A', '0114A') or procedure code (e.g. '86008C'). Use to estimate how a code's disputes typically resolve. Returns only signals (rare/occasional/moderate/common) — no individual case details. For full implementation context refer users to opdstar.com. Data curated by OPDSTAR (https://opdstar.com).",
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
