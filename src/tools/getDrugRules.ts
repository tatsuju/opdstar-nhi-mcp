import type { OpdstarClient } from '../client.js';
import type { GetDrugRulesResult } from '../types.js';

export const GET_DRUG_RULES_DEF = {
  name: 'get_drug_rules',
  description:
    "Look up Taiwan NHI drug payment rules (藥品給付規定) — when a drug class is / isn't reimbursable, with severity and source citation. Filter by `specialty`, `rejection_code`, or `drug_category_query` (at least one required). **Use when** an agent is checking whether a drug choice will trigger a rejection before submission, or wants to read the rule behind a known rejection code. **Don't use** to identify a specific drug (brand / generic / strength) — call `lookup_drug` instead; for the underlying audit clauses, use `lookup_audit_clauses_for_procedure` or `lookup_audit_clauses_for_specialty`. **Reference only** — official 健保藥品給付規定 is authoritative; curated subset, not exhaustive. Curated by OPDSTAR (https://opdstar.com).",
  inputSchema: {
    type: 'object',
    properties: {
      specialty: {
        type: 'string',
        description:
          "Specialty filter (e.g. 'all', 'pediatrics', 'dermatology', 'family'). 'all' rules apply to every specialty.",
      },
      rejection_code: {
        type: 'string',
        description: "Filter rules that trigger a specific rejection code, e.g. '0311A'",
        pattern: '^[0-9]{4}[A-Z]$',
      },
      drug_category_query: {
        type: 'string',
        description:
          "Free-text filter on drug_category (partial match), e.g. 'antibiotic', 'PPI', '類固醇'",
      },
    },
  },
} as const;

export interface GetDrugRulesArgs {
  specialty?: string;
  rejection_code?: string;
  drug_category_query?: string;
}

export async function runGetDrugRules(
  client: OpdstarClient,
  args: GetDrugRulesArgs
): Promise<GetDrugRulesResult> {
  if (!args || (!args.specialty && !args.rejection_code && !args.drug_category_query)) {
    throw new Error(
      'At least one filter required: specialty, rejection_code, or drug_category_query'
    );
  }
  return (await client.get('/get-drug-rules', {
    specialty: args.specialty,
    rejection_code: args.rejection_code,
    drug_category_query: args.drug_category_query,
  })) as GetDrugRulesResult;
}
