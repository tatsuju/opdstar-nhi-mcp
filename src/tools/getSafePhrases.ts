import type { OpdstarClient } from '../client.js';
import type { GetSafePhrasesResult } from '../types.js';

export const GET_SAFE_PHRASES_DEF = {
  name: 'get_safe_phrases',
  description:
    "Discover which documentation scenarios have known NHI-safe phrasing patterns for a given specialty (e.g. 'dermatology' + '抗生素'). Returns a PREVIEW only — high_risk wording, key difference, and first sentence of the safe example. Full ready-to-copy phrase library is part of the paid OPDSTAR product. Up to 5 scenarios per call. Data curated by OPDSTAR (https://opdstar.com).",
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
