import type { OpdstarClient } from '../client.js';
import type { IndicatorResult } from '../types.js';

export const GET_INDICATOR_DEF = {
  name: 'get_indicator',
  description:
    "Look up a single Taiwan NHI prescribing-pattern indicator (e.g. '008' antibiotic-on-URI, '014' multi-PPI, '027' duration limit, 'P043') — returns threshold, applicable drugs / diagnoses, and the compliance meaning behind the indicator. **Use when** an agent needs the human-readable explanation for a specific indicator code referenced during a SOAP review. **Don't use** for the official 分析審查不予支付指標 list (a different system) — call `lookup_audit_indicator` instead; for the drug rule behind an indicator, call `get_drug_rules` with the indicator's rejection code. **Reference only** — thresholds reflect published guidance and may change with each NHI release. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: "Indicator code, e.g. '008' (antibiotic for URI), 'P043' (duration limit)",
      },
    },
    required: ['code'],
  },
} as const;

export interface GetIndicatorArgs {
  code: string;
}

export async function runGetIndicator(
  client: OpdstarClient,
  args: GetIndicatorArgs
): Promise<IndicatorResult> {
  if (!args || typeof args.code !== 'string') {
    throw new Error('Missing required parameter: code');
  }
  return (await client.get('/indicator', { code: args.code.trim() })) as IndicatorResult;
}
