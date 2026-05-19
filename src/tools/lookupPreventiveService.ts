import type { OpdstarClient } from '../client.js';

export const LOOKUP_PREVENTIVE_SERVICE_DEF = {
  name: 'lookup_preventive_service',
  description:
    "Browse Taiwan NHI preventive-care and screening services — adult health checks, the major cancer screenings (breast, cervical, colorectal, oral, lung LDCT), prenatal care, child preventive health, and child dental fluoride / pit-and-fissure sealant programs. Returns each service's target population, age / sex eligibility, subsidy frequency, and screening tool. **Use when** an agent needs to know who is eligible for a preventive service and how often it is subsidised (e.g. 'who can get a mammogram and how often', 'child fluoride coverage'). **Reference only** — eligibility and subsidy follow the official 衛生福利部 announcements; the screening provider confirms eligibility at the point of service. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description:
          "Optional service category: 'adult_health_check', 'cancer_screening', 'prenatal_care', 'child_preventive', 'dental_preventive', or 'integrated_screening'. If omitted, returns all services.",
      },
      keyword: {
        type: 'string',
        description:
          "Optional Chinese keyword (e.g. '乳房', '子宮頸', '塗氟', '產檢') to filter by service name, screening tool, or target population.",
      },
    },
  },
} as const;

export interface LookupPreventiveServiceArgs {
  category?: string;
  keyword?: string;
}

export interface PreventiveServiceEntry {
  service_key: string;
  service_category: string;
  name_zh: string;
  name_en: string | null;
  screening_tool: string | null;
  target_population: string;
  age_min: number | null;
  age_max: number | null;
  sex: string | null;
  eligibility_conditions: string | null;
  frequency_text: string;
  frequency_interval_months: number | null;
  payment_source: string | null;
  coverage_notes: string | null;
  governing_agency: string | null;
  source_document: string | null;
  source_url: string | null;
}

export interface LookupPreventiveServiceResult {
  filters: {
    category: string | null;
    keyword: string | null;
  };
  count: number;
  results: PreventiveServiceEntry[];
  message?: string;
}

export async function runLookupPreventiveService(
  client: OpdstarClient,
  args: LookupPreventiveServiceArgs,
): Promise<LookupPreventiveServiceResult> {
  return (await client.get('/lookup-preventive-service', {
    category: args?.category?.trim(),
    keyword: args?.keyword?.trim(),
  })) as LookupPreventiveServiceResult;
}
