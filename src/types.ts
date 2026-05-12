/** Shared result shapes — mirror the /api/mcp/* proxy responses. */

export interface LookupRejectionCodeResult {
  code: string;
  found?: boolean;
  description?: string;
  severity?: 'critical' | 'warning';
  category?: string;
  category_name?: string;
  opdstar_relevant?: boolean;
  source_url?: string;
  message?: string;
}

export interface ProcedureItem {
  code: string;
  name_zh: string;
  name_en: string | null;
  category: string | null;
  nhi_points: number | null;
  applicable_icd10: string[];
  audit_notes: string | null;
  soap_minimum: string | null;
  frequency: string | null;
  source_url: string;
}

export interface ProceduresForIcdResult {
  icd10: string;
  specialty: string;
  count: number;
  results: ProcedureItem[];
}

export interface IndicatorResult {
  code: string;
  found?: boolean;
  name?: string;
  suggestion?: string | null;
  threshold_pct?: number | null;
  applicable_drugs?: string[];
  applicable_icd_patterns?: string[];
  excluded_icd_patterns?: string[];
  severity?: string;
  rejection_codes?: string[];
  nhi_part?: string | null;
  nhi_section?: string | null;
  rule_code?: string;
  source_url?: string;
  message?: string;
}

export interface WikiHit {
  title: string | null;
  content: string;
  chunk_type: string;
  specialty: string | null;
  similarity: number;
  source_url_nhi: string | null;
  source_url_opdstar: string;
}

export interface SearchWikiResult {
  query: string;
  category: string | null;
  count: number;
  results: WikiHit[];
}

// ─── v0.2.0 additions ───────────────────────────────────────────────

export interface DrugRuleItem {
  specialty: string;
  drug_category: string;
  diagnosis_pattern: string | null;
  rejection_code: string | null;
  rule_description: string;
  severity: 'critical' | 'warning' | string;
  nhi_indicator_code: string | null;
  threshold_pct: number | null;
  effective_date: string | null;
  source_url: string;
}

export interface GetDrugRulesResult {
  filters: {
    specialty: string | null;
    rejection_code: string | null;
    drug_category_query: string | null;
  };
  count: number;
  truncated: boolean;
  results: DrugRuleItem[];
}

export interface SafePhraseItem {
  specialty: string;
  scenario: string;
  high_risk: string | null;
  safe_example_preview: string | null;
  key_difference: string | null;
  full_content_url: string;
}

export interface GetSafePhrasesResult {
  specialty: string;
  scenario_query: string | null;
  count: number;
  truncated: boolean;
  note: string;
  results: SafePhraseItem[];
  message?: string;
}

export interface AuditGuidelineItem {
  rule_code: string;
  rule_type: string;
  specialty: string;
  severity: string;
  related_rejection_codes: string[];
  reason_zh: string | null;
  suggestion_zh: string | null;
  nhi_indicator_code: string | null;
  effective_date: string | null;
  source_url: string;
}

export interface SearchAuditGuidelinesResult {
  query: string;
  specialty: string | null;
  count: number;
  truncated: boolean;
  note: string;
  results: AuditGuidelineItem[];
}

export interface RejectionCodeItem {
  code: string;
  description: string;
  severity: string;
  opdstar_relevant: boolean;
  source_url: string;
}

export interface RejectionCodesByCategoryResult {
  category: string;
  category_name?: string;
  opdstar_relevant_only: boolean;
  count: number;
  truncated: boolean;
  results: RejectionCodeItem[];
  message?: string;
}

// ─── v0.7.0 additions ───────────────────────────────────────────────

export interface NhiAmendmentItem {
  effective_date: string | null;
  announce_date: string | null;
  amendment_type: 'primary' | 'comparison' | string;
  target_document: string;
  title: string;
  description: string | null;
  doc_url: string | null;
  odt_url: string | null;
  pdf_url: string | null;
  source_url: string;
}

export interface RecentNhiAmendmentsResult {
  filters: {
    since_days: number;
    type: 'primary' | 'comparison' | 'all';
    limit: number;
  };
  since_date: string;
  count: number;
  results: NhiAmendmentItem[];
}

export interface TaiwanDrugItem {
  generic_name: string;
  generic_name_zh: string | null;
  brand_names: string[];
  aliases: string[];
  strength: string | null;
  dosage_form: string | null;
  route: string | null;
  nhi_drug_code: string | null;
  atc_code: string | null;
  drug_category: string | null;
  therapeutic_class: string | null;
  specialties: string[];
  is_compound: boolean;
  effective_date: string | null;
  source_document: string | null;
  source_url: string;
}

export interface SearchTaiwanDrugResult {
  filters: {
    query: string | null;
    atc_prefix: string | null;
    form: string | null;
    limit: number;
  };
  query_kind: 'nhi_code' | 'atc_code' | 'text' | 'atc_only';
  count: number;
  results: TaiwanDrugItem[];
}

export interface Icd10CmItem {
  code: string;
  description_en?: string;
  description_zh?: string;
  category: string;
  specialties: string[];
  source_url: string;
}

export interface LookupIcd10CmResult {
  filters: {
    code: string | null;
    keyword: string | null;
    lang: 'en' | 'zh' | 'both';
    limit: number;
  };
  count: number;
  scope_note: string;
  results: Icd10CmItem[];
}
