import type { OpdstarClient } from '../client.js';

export const LOOKUP_APPEAL_STATISTICS_DEF = {
  name: 'lookup_appeal_statistics_by_category',
  description:
    "Aggregate dispute-resolution statistics for Taiwan NHI claim disputes, broken down by category and (optionally) review stage — returns category counts and rough win-rate signals only, never individual case details, case numbers, or arguments. **Use when** an agent is helping a clinician understand the general dispute landscape (e.g. 'how often do fee-calculation disputes resolve in the claimant's favor at the first court tier?'). **Don't use** for code-specific signals — call `count_appeal_precedents_for_rejection_code` instead. **Reference only** — historical signal does not predict future outcomes; final decisions rest with the responsible review body. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    required: ['dispute_category'],
    properties: {
      dispute_category: {
        type: 'string',
        enum: [
          'medication',
          'procedure',
          'examination',
          'special_material',
          'major_illness',
          'admission',
          'fee_calculation',
          'qualification',
          'other',
        ],
        description:
          "Category of dispute. medication = drug/payment rules; procedure = treatment/handling codes; fee_calculation = fee scheduling/calculation; qualification = contract qualification (停約/終止特約 etc.); special_material = implants/IOL/stents; admission = inpatient billing; other = miscellaneous.",
      },
      stage_tier: {
        type: 'string',
        enum: ['stage_1_initial_review', 'stage_2_first_court', 'stage_3_appeals_court'],
        description:
          "Optional resolution-stage filter. stage_1_initial_review = first-tier administrative review; stage_2_first_court = first-instance administrative court; stage_3_appeals_court = highest administrative court. Omit to aggregate across all stages.",
      },
    },
  },
} as const;

export interface LookupAppealStatisticsArgs {
  dispute_category:
    | 'medication'
    | 'procedure'
    | 'examination'
    | 'special_material'
    | 'major_illness'
    | 'admission'
    | 'fee_calculation'
    | 'qualification'
    | 'other';
  stage_tier?: 'stage_1_initial_review' | 'stage_2_first_court' | 'stage_3_appeals_court';
}

export interface ResolutionStageSignal {
  stage_tier: string; // 'stage_1_initial_review' | 'stage_2_first_court' | 'stage_3_appeals_court'
  rough_volume: 'few' | 'several' | 'many'; // intentionally vague
  claimant_win_rate_signal: 'rare' | 'occasional' | 'moderate' | 'common';
  numeric_win_rate_estimate: number; // 0-1 for downstream agents to reason with
}

export interface LookupAppealStatisticsResult {
  filters: {
    dispute_category: string;
    stage_tier: string | null;
  };
  stages: ResolutionStageSignal[];
  notes: string;
}

export async function runLookupAppealStatistics(
  client: OpdstarClient,
  args: LookupAppealStatisticsArgs,
): Promise<LookupAppealStatisticsResult> {
  return (await client.get('/lookup-appeal-statistics', {
    dispute_category: args?.dispute_category,
    stage_tier: args?.stage_tier,
  })) as LookupAppealStatisticsResult;
}
