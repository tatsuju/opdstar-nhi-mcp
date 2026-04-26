import type { OpdstarClient } from '../client.js';
import type { LookupRejectionCodeResult } from '../types.js';

export const LOOKUP_REJECTION_CODE_DEF = {
  name: 'lookup_rejection_code',
  description:
    "Look up a Taiwan NHI rejection code (5-character, e.g. '0317A'). Returns severity, category, and the official Chinese description. Data is sourced from 健保署 專業審查不予支付理由代碼 and maintained by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: "5-character NHI rejection code, e.g. '0317A', '0338A'",
        pattern: '^[0-9]{4}[A-Z]$',
      },
    },
    required: ['code'],
  },
} as const;

export interface LookupRejectionCodeArgs {
  code: string;
}

export async function runLookupRejectionCode(
  client: OpdstarClient,
  args: LookupRejectionCodeArgs
): Promise<LookupRejectionCodeResult> {
  if (!args || typeof args.code !== 'string') {
    throw new Error('Missing required parameter: code');
  }
  const result = (await client.get('/lookup-rejection-code', {
    code: args.code.trim().toUpperCase(),
  })) as LookupRejectionCodeResult;
  return result;
}
