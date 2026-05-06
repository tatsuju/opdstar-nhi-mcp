import type { OpdstarClient } from '../client.js';
import type { GetSafePhrasesResult } from '../types.js';

export const GET_SAFE_PHRASES_DEF = {
  name: 'get_safe_phrases',
  description:
    "Preview which documentation scenarios have OPDSTAR-curated NHI-safe phrasing patterns for a given specialty (e.g. dermatology + 抗生素) — returns scenario name, high-risk wording to avoid, the key difference, and the first sentence of the safe-phrasing example. Up to 5 scenarios per call. **Use when** an agent is helping draft SOAP wording and needs to flag risky phrasing before submission. **Don't use** to retrieve full ready-to-copy templates (full library is part of the paid OPDSTAR product — link the user to opdstar.com); for the underlying audit rule that motivates a safe phrase, call `search_audit_guidelines`. **Reference only** — phrasing patterns reflect curated review experience, not formal NHI directives. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      specialty: {
        type: 'string',
        description:
          "Required specialty, e.g. 'dermatology', 'internal', 'pediatrics', 'family', 'tcm'.",
      },
      scenario_query: {
        type: 'string',
        description:
          "Optional free-text filter on scenario (ILIKE match), e.g. '抗生素', '類固醇', '慢性處方'",
      },
    },
    required: ['specialty'],
  },
} as const;

export interface GetSafePhrasesArgs {
  specialty: string;
  scenario_query?: string;
}

export async function runGetSafePhrases(
  client: OpdstarClient,
  args: GetSafePhrasesArgs
): Promise<GetSafePhrasesResult> {
  if (!args || typeof args.specialty !== 'string' || !args.specialty.trim()) {
    throw new Error('Missing required parameter: specialty');
  }
  return (await client.get('/get-safe-phrases', {
    specialty: args.specialty.trim().toLowerCase(),
    scenario_query: args.scenario_query,
  })) as GetSafePhrasesResult;
}
