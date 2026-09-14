import type { OpdstarClient } from '../client.js';

export const LOOKUP_SAMPLING_AUDIT_RULES_DEF = {
  name: 'lookup_sampling_audit_rules',
  description:
    "Look up Taiwan NHI clinic-level 專業審查抽審指標 (per-region sampling-audit screening rules that decide WHICH CLINICS get selected for professional claim review) — returns mandatory-audit triggers (new-contract clinics, annual rotation, violations), weighted scoring indicators, growth-rate exemption-exclusion thresholds, and audit-exemption conditions, each with the official definition text and structured thresholds. **Region matters**: each NHI regional division sets its own thresholds — always pass `region`; a region not yet covered returns empty results, not 'no rules'. **Use when** a clinic asks why it might be sampled for audit, how new-clinic mandatory review works, or what growth/volume patterns remove audit exemption. **Don't use** for per-claim percentage-cap denial rules — those live in `lookup_audit_indicator`. **Reference only** — thresholds are revised quarterly by regional joint-management meetings. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      region: {
        type: 'string',
        enum: ['taipei', 'northern', 'central', 'southern', 'kaoping', 'eastern'],
        description:
          "NHI regional division (業務組). Thresholds are region-specific and NOT interchangeable. 'kaoping' = 高屏, 'southern' = 南區.",
      },
      rule_group: {
        type: 'string',
        enum: [
          'framework',
          'mandatory_management',
          'mandatory_specialty',
          'key_management',
          'weighted_utilization',
          'weighted_specialty',
          'weighted_reward',
          'weighted_composite',
          'exemption',
          'exemption_exclusion',
          'sampling_note',
        ],
        description:
          "Optional filter: 'mandatory_management' = 必審-管理類 (new-contract, violations, annual rotation), 'exemption_exclusion' = high-growth thresholds that remove audit exemption, 'exemption' = conditions for reduced audit frequency, 'weighted_*' = scoring indicators, 'framework' = how selection works, 'sampling_note' = sampling-ratio notes.",
      },
      specialty: {
        type: 'string',
        description:
          "Optional specialty filter (e.g. 'ent', 'psychiatry', 'rehabilitation', 'obstetrics_gynecology'). Only returns rules scoped to that specialty; omit to include clinic-wide rules.",
      },
    },
  },
} as const;

export interface LookupSamplingAuditRulesArgs {
  region?: string;
  rule_group?: string;
  specialty?: string;
}

export interface SamplingAuditRuleEntry {
  region: string;
  region_zh: string;
  sector: string;
  rule_group: string;
  item_no: string;
  name: string;
  specialty: string | null;
  specialty_zh: string | null;
  definition: string;
  thresholds: Record<string, unknown> | null;
  weight_score: string | null;
  direction: string | null;
  data_period: string | null;
  management_category: string[];
  computation_basis: string | null;
  effective_date: string | null;
  revision_date: string | null;
  source_document: string;
  source_url: string;
}

export interface LookupSamplingAuditRulesResult {
  filters: {
    region: string | null;
    rule_group: string | null;
    specialty: string | null;
  };
  count: number;
  covered_regions?: string[];
  results: SamplingAuditRuleEntry[];
  message?: string;
  note?: string;
}

export async function runLookupSamplingAuditRules(
  client: OpdstarClient,
  args: LookupSamplingAuditRulesArgs,
): Promise<LookupSamplingAuditRulesResult> {
  return (await client.get('/lookup-sampling-audit-rules', {
    region: args?.region?.trim().toLowerCase(),
    rule_group: args?.rule_group?.trim().toLowerCase(),
    specialty: args?.specialty?.trim().toLowerCase(),
  })) as LookupSamplingAuditRulesResult;
}
