import type { OpdstarClient } from '../client.js';
import type { ProceduresForIcdResult } from '../types.js';

const SPECIALTIES = [
  'dermatology','internal','family','pediatrics','ent','ophthalmology','orthopedics',
  'pmr','gastro','urology','psychiatry','neurology','cardiology','pulmonology',
  'surgery','obstetrics_gynecology','infectious','rheumatology','dentistry','tcm',
] as const;

export const GET_PROCEDURES_FOR_ICD_DEF = {
  name: 'get_procedures_for_icd',
  description:
    'Given a Taiwan ICD-10 code and specialty, return the NHI procedure codes applicable. Results include nhi_points (healthcare payment points) and audit_notes (review caveats). Curated mapping across major specialties by OPDSTAR (https://opdstar.com).',
  inputSchema: {
    type: 'object',
    properties: {
      icd10: {
        type: 'string',
        description: "ICD-10 code, e.g. 'L30.9' (chronic eczema), 'J06.9' (acute URI)",
      },
      specialty: {
        type: 'string',
        description: 'Specialty ID — see enum for supported values',
        enum: [...SPECIALTIES],
      },
      limit: {
        type: 'integer',
        description: 'Max results (1-20, default 10)',
        minimum: 1,
        maximum: 20,
        default: 10,
      },
    },
    required: ['icd10', 'specialty'],
  },
} as const;

export interface GetProceduresForIcdArgs {
  icd10: string;
  specialty: string;
  limit?: number;
}

export async function runGetProceduresForIcd(
  client: OpdstarClient,
  args: GetProceduresForIcdArgs
): Promise<ProceduresForIcdResult> {
  if (!args || typeof args.icd10 !== 'string' || typeof args.specialty !== 'string') {
    throw new Error('Missing required parameters: icd10 and specialty');
  }
  return (await client.get('/procedures-for-icd', {
    icd10: args.icd10.trim(),
    specialty: args.specialty.trim().toLowerCase(),
    limit: args.limit,
  })) as ProceduresForIcdResult;
}
