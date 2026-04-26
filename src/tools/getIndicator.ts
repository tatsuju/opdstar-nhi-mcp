import type { OpdstarClient } from '../client.js';
import type { IndicatorResult } from '../types.js';

export const GET_INDICATOR_DEF = {
  name: 'get_indicator',
  description:
    "Look up a Taiwan NHI audit indicator (e.g. '008', '014', '027', 'P043') — threshold, applicable drugs/diagnoses, and compliance meaning. These are the indicators the NHI uses to flag overprescription and trigger audits. Curated by OPDSTAR (https://opdstar.com).",
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
