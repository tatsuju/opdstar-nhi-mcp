import type { OpdstarClient } from '../client.js';
import type { IndicatorResult } from '../types.js';

export const GET_INDICATOR_DEF = {
  name: 'get_indicator',
  description:
    "Look up a single Taiwan NHI prescribing-pattern indicator. These are short codes (numeric, or 'P'-prefixed) that encode common over-prescribing patterns such as antibiotic-on-URI, multi-drug co-prescribing, or duration limits. Returns the indicator name, the threshold (e.g. '7-day URI episode'), applicable drugs / diagnoses, and the compliance meaning. Returns a not-found message (not an error) if the code does not exist. **Use when** an agent needs the human-readable explanation for a specific indicator code referenced during a SOAP review or audit response — e.g. an audit notice cites an indicator and the agent needs to surface what it monitors and why a prescription tripped it. **Typical follow-up**: call `get_drug_rules({rejection_code})` with the indicator's downstream rejection code to read the formal payment rule, or `search_audit_guidelines({query})` to read related audit-clause text. **Don't use** for the official 分析審查不予支付指標 (percentage-cap audit) list — that's a different system — call `lookup_audit_indicator` instead. **Reference only** — thresholds and applicable lists reflect published guidance and may change with each NHI release; agents should re-read the indicator each session rather than caching values across sessions. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description:
          "Required. The exact prescribing-pattern indicator code. Format: 1-3 digits OR 'P' + 1-3 digits. Whitespace is trimmed. Numeric codes are NOT zero-padded automatically — pass the code exactly as cited (e.g. '008' not '8'). Lowercase 'p' is accepted but normalized to uppercase.",
        minLength: 1,
        maxLength: 4,
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
