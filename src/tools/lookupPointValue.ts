import type { OpdstarClient } from '../client.js';

export const LOOKUP_POINT_VALUE_DEF = {
  name: 'lookup_point_value',
  description:
    "Look up Taiwan NHI floating point values (浮動點值) — the settled per-point payment amount by region and total-budget sector. Taiwan NHI reimburses on a points system under a global budget, so one claimed point is usually worth less than NT$1; this tool returns the actual settled rate. With no year, returns the latest settled value for each region × sector; with a year (and optional quarter), returns the quarterly time series. **Use when** an agent needs to estimate actual reimbursement — claimed points × point value ≈ amount paid. **Reference only** — official figures are published quarterly by 衛生福利部中央健康保險署. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      region: {
        type: 'string',
        description:
          "Optional NHI region: 'taipei', 'northern', 'central', 'southern', 'kaoping', 'eastern', or 'national'.",
      },
      sector: {
        type: 'string',
        description:
          "Optional budget sector: 'hospital', 'primary_clinic', 'dental', 'tcm', or 'dialysis'.",
      },
      year: {
        type: 'integer',
        description:
          'Optional Gregorian year (e.g. 2025). If omitted, returns the latest settled value per region × sector.',
      },
      quarter: {
        type: 'integer',
        description: 'Optional quarter 1-4 (only used together with year).',
        minimum: 1,
        maximum: 4,
      },
      metric: {
        type: 'string',
        description:
          "Optional metric: 'floating' (一般服務浮動點值, default) or 'average' (平均點值, weighted across payment types).",
      },
    },
  },
} as const;

export interface LookupPointValueArgs {
  region?: string;
  sector?: string;
  year?: number;
  quarter?: number;
  metric?: string;
}

export interface PointValueEntry {
  region: string;
  region_zh: string;
  sector: string;
  sector_zh: string;
  period_year: number;
  period_quarter: number;
  point_value: number;
  metric: string;
  value_type: string;
  source_document?: string | null;
  source_url?: string | null;
}

export interface LookupPointValueResult {
  filters: {
    region: string | null;
    sector: string | null;
    year: number | null;
    quarter: number | null;
    metric: string | null;
  };
  mode: 'latest_settled' | 'detail';
  count: number;
  results: PointValueEntry[];
  message?: string;
}

export async function runLookupPointValue(
  client: OpdstarClient,
  args: LookupPointValueArgs,
): Promise<LookupPointValueResult> {
  return (await client.get('/lookup-point-value', {
    region: args?.region?.trim(),
    sector: args?.sector?.trim(),
    year: args?.year != null ? String(args.year) : undefined,
    quarter: args?.quarter != null ? String(args.quarter) : undefined,
    metric: args?.metric?.trim(),
  })) as LookupPointValueResult;
}
