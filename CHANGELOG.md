# Changelog

All notable changes to `@opdstar/nhi-mcp` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] — 2026-05-19

### Added

- **`lookup_preventive_service`** — browse Taiwan NHI preventive-care and
  screening services: adult health checks, the major cancer screenings
  (breast, cervical, colorectal, oral, lung LDCT), prenatal care, child
  preventive health, and child dental fluoride / pit-and-fissure sealant
  programs. Returns each service's target population, age / sex
  eligibility, subsidy frequency, and screening tool.
- **`lookup_chronic_prescription_rule`** — given an ICD-10 code or a
  disease name, look up whether a condition falls within Taiwan's
  official chronic-disease scope for continuous prescriptions
  (慢性病連續處方箋), with the dispensing day limits (per dispense,
  total medication days, prescription validity).
- **`lookup_point_value`** — look up Taiwan NHI floating point values
  (浮動點值): the settled per-point payment amount by region and
  total-budget sector, for estimating actual reimbursement.

### Why

These three tools extend the server into preventive care,
continuous-prescription eligibility, and reimbursement-rate reference —
three layers outpatient agents routinely need beyond code definitions.

## [0.8.0] — 2026-05-18

### Added

- **`search_nhi_interpretations`** — search Taiwan's official NHI
  administrative interpretations (健保署行政函釋 / 函令): the binding
  公告 and 解釋函 that clarify how payment rules, drug-formulary
  provisions, special-material coverage, and review policy apply in
  practice. Returns ranked excerpts, each with the official document
  number (字號), issue date, 主旨, a content excerpt, and the government
  source URL. Use it when a question turns on an official ruling rather
  than a code definition.

### Why

Agents answering Taiwan NHI questions often need the authoritative 函釋
behind a payment or review rule, not just the code definition. This adds
a search-only, reference-level interface for that layer.

## [0.7.1] — 2026-05-13

### Added

- MCP spec tool annotations on all 20 tools:
  - `annotations.title` — user-friendly title shown in MCP clients
  - `annotations.readOnlyHint: true` — every tool is read-only
  - `annotations.destructiveHint: false`
  - `annotations.idempotentHint: true` — same input returns the same
    output within the dataset's freshness window
  - `annotations.openWorldHint: false` — closed Taiwan NHI dataset,
    not arbitrary web

  Injected centrally in `src/http-handler.ts` so the same shape ships
  on both stdio and the remote HTTPS endpoint. No per-tool edits.

### Why

Required for the Anthropic MCP Directory listing — directories need
human-readable labels and accurate behaviour hints so clients can
auto-allow read-only tools and display tool metadata correctly.

## [0.7.0] — 2026-05-13

### Added

- **Remote MCP HTTPS endpoint** at `opdstar.com/api/mcp` — one-click connect from MCP Directory-compatible clients (Claude.ai, Claude Desktop, Cursor, etc.). JSON-RPC 2.0 over HTTPS POST, no install required.
- **Status page** at [opdstar.com/mcp/status](https://opdstar.com/mcp/status) — live tool list, dataset freshness, sample request / response, and configuration snippets.
- **`recent_nhi_amendments`** — list recent amendments to 健保署「醫療費用審查注意事項」(近一年修正公告). Filters by `since_days`, `type` (primary/comparison/all), `limit`.
- **`search_taiwan_drug`** — unified Taiwan drug lookup with NHI 9碼 ↔ ATC code ↔ generic name ↔ brand cross-reference. Auto-detects input shape (NHI code / ATC / text).
- **`lookup_icd10_cm`** — ICD-10-CM code lookup with EN / 中文 descriptions, category, and OPDSTAR specialties. Free-text keyword search supported.
- **Privacy + Terms pages** at `/legal/mcp-privacy` and `/legal/mcp-terms` covering the MCP endpoint surface (public read-only, no PII).

### Changed

- **Refactored stdio dispatcher** into a transport-agnostic `handleMcpRequest` exported from `@opdstar/nhi-mcp/http-handler`, so the stdio entry and the new remote HTTPS endpoint share one source of truth.
- **Package description** refined for clearer scope (Taiwan NHI billing intelligence).
- **README** expanded with explicit scope statement, remote + local install options, and updated tool catalogue (17 → 20 tools).

### Endpoints (internal, public via `/api/mcp/*`)

- `GET /api/mcp/recent-amendments`
- `GET /api/mcp/search-taiwan-drug`
- `GET /api/mcp/lookup-icd10`
- `POST /api/mcp` — top-level JSON-RPC remote MCP entry
- `GET /api/mcp-status` — health + capability surface

### Note

This is a feature release; no breaking changes to existing tools. Total tool count: 17 → 20.

## [0.6.4] — 2026-05-07

### Changed

- Documentation polish on selected tools.
- Parameter descriptions extended with format hints.

## [0.6.3] — 2026-05-06

### Changed

- Tool catalog documentation refresh.
- Consistent usage guidance across all tools.

## [0.6.2] — 2026-04-29

### Changed

- Documentation refresh.
- Minor wording polish.

## [0.6.1] — 2026-04-29

### Changed

- Documentation refresh.
- Minor wording polish.

## [0.6.0] — 2026-04-28

### Added — 2 new dispute-resolution signal tools (17 total)

- **`lookup_appeal_statistics_by_category(dispute_category, stage_tier?)`** — Returns aggregate dispute-resolution signals by category (medication / procedure / fee_calculation / qualification / etc.). Returns rough volume buckets (`few` / `several` / `many`) and claimant win-rate signals (`rare` / `occasional` / `moderate` / `common`) across abstract resolution stages.
- **`count_appeal_precedents_for_rejection_code(rejection_code?, procedure_code?)`** — Returns rough volume + claimant win-rate signal for resolutions involving a specific NHI rejection or procedure code. Useful for estimating how a code's disputes typically resolve.

Both tools follow the moat-preserving pattern: aggregate signals only, no individual case details, no case numbers, no arguments. For full implementation context, refer users to opdstar.com.

### Endpoints (internal, public via /api/mcp/*)

- `GET /api/mcp/lookup-appeal-statistics`
- `GET /api/mcp/count-appeal-precedents`

### Note

- Pre-publish leak audit (`scripts/pre-publish-audit.sh`) passed clean for this release.

## [0.5.0] — 2026-04-28

### Added — 5 new audit, major-illness, and indicator tools

- **`lookup_audit_clauses_for_procedure(procedure_code, specialty?)`** — Find official 審查注意事項 clauses that cite a specific NHI procedure code (e.g. `'00101B'`, `'51017C'`). Returns clause summaries with risk flags (amount limit / frequency rule / indication required).
- **`lookup_audit_clauses_for_specialty(specialty, keyword?, risk_flag?)`** — Browse 審查注意事項 by specialty (dermatology / TCM / dentistry / ophthalmology / etc.). Filterable by keyword and risk flag (`amount_limit` / `frequency_rule` / `indication` / `any`).
- **`lookup_major_illness(category_code?, keyword?)`** — Browse the official 重大傷病範圍及項目 list. Returns category code, name, ICD-10 coverage, application requirement, validity period, and copay-exemption status.
- **`check_icd_for_major_illness_eligibility(icd_code)`** — Reverse lookup. Given an ICD-10 code, return the major-illness categories the diagnosis may qualify for. Useful for surfacing copayment-exemption hints when an MCP agent assists with claim coding.
- **`lookup_audit_indicator(indicator_code?, category?, specialty?, procedure_code?)`** — Look up the official 分析審查不予支付指標 (threshold-based audit rules). Returns indicator name, category, threshold percentage, applicable specialty, monitored procedure codes, and the official action description. Use when an agent needs to know whether a procedure is monitored by an indicator (e.g. `'23401C'` is monitored by `001` — 眼科局部處置申報率, 30% threshold).

All five tools follow the moat-preserving pattern: clause headlines and category metadata only, no full text or paid-tier guidance — full content lives behind opdstar.com.

### Endpoints (internal, public via /api/mcp/*)

- `GET /api/mcp/lookup-audit-clauses-for-procedure`
- `GET /api/mcp/lookup-audit-clauses-for-specialty`
- `GET /api/mcp/lookup-major-illness`
- `GET /api/mcp/check-icd-major-illness`
- `GET /api/mcp/lookup-audit-indicator`

### Note

- Pre-publish leak audit (`scripts/pre-publish-audit.sh`) passed clean for this release.

## [0.4.0] — 2026-04-27

### Added — `lookup_fee_code` 💰 (10 tools total)

- **`lookup_fee_code(q, category?, icd?)`** — 健保支付標準查詢. Backed by the official 全民健康保險醫療服務給付項目及支付標準 (current effective edition). Search by exact code (`'00101B'`), Chinese name (`'門診診察'`), English name (`'ICU'`), or filter by category prefix (`'00'` 基本診療, `'06'` 手術, `'P1'` 病例計酬, `'N2'` 護理).
- Returns code, points, effective dates, audit notes (truncated with full length indicator), and OPDSTAR-curated cross-reference fields.
- Endpoint: `GET /api/mcp/lookup-fee-code` (edge-cached, public).

### Note

- Original NHI data has no ICD-10 mapping; the `icd` filter only matches OPDSTAR-curated patterns and is sparse — most codes return no result with `icd` set.

## [0.3.0] — 2026-04-27

### Added — `lookup_drug` 💊 (9 tools total)

- **`lookup_drug(q, specialty?, dosage_form?, route?)`** — 健保藥品目錄查詢. Backed by the active NHI formulary. Search by generic name, brand name, alias, normalized key, or NHI 9-char code.
- Returns up to 10 matches sorted NHI-coded > alphabetical, with strength, dosage form, route, ATC code, therapeutic class, brand list, and effective date.
- Endpoint: `GET /api/mcp/lookup-drug` (edge-cached, public).

### Notes

- Use `lookup_drug` for the drug catalog; use `get_drug_rules` separately for 給付規定 limitations.

## [0.2.0] — 2026-04-23

### Added — 4 new tools (8 total) 🧰

**New tools (v0.2):**

- `get_drug_rules(specialty?, rejection_code?, drug_category_query?)` — 藥品給付規定 lookup. Filter by specialty / rejection code / drug category.
- `get_safe_phrases(specialty, scenario_query?)` — 安全句型庫 **preview-only** (first sentence + key difference + link to paid content). Indexed across major specialties.
- `search_audit_guidelines(query, specialty?)` — 審查注意事項摘要 free-text search. Returns `reason_zh` + `suggestion_zh` summaries.
- `get_rejection_code_category(category, opdstar_relevant_only?)` — list all rejection codes in category (00-09).

**Infrastructure:**

- **OIDC Trusted Publishing** documented in `publish.yml` — once npm dashboard is configured, no `NPM_TOKEN` needed.
- `workflow_dispatch` trigger added for manual publishes.

**Moat preservation (paid product boundary):**

- `get_safe_phrases` returns **previews only** — `ready_phrases` field is explicitly withheld; full library remains OPDSTAR paid.
- `search_audit_guidelines` omits `enriched_snippet` / `soap_example_ref` / full `detailed_explanation` — SOAP templates stay closed.
- All preview fields include `full_content_url` pointing to opdstar.com for upgrade path.

**Tests:**

- +7 new v0.2 tool tests (17 total, up from 10). All offline-mocked.

## [0.1.0] — 2026-04-21

### Added — Initial release 🎉

Taiwan's first public Model Context Protocol server for National Health Insurance data.

**4 read-only tools, all proxied through `opdstar.com/api/mcp/*`:**

- `lookup_rejection_code(code)` — NHI rejection codes (5-char, e.g. `0317A`)
- `get_procedures_for_icd(icd10, specialty, limit?)` — NHI procedures across major specialties
- `get_indicator(code)` — NHI audit indicators with thresholds (008, 014, 027, P043)
- `search_nhi_wiki(query, category?, limit?)` — semantic + full-text search of NHI wiki

**Client features:**

- `npx @opdstar/nhi-mcp` zero-install invocation
- Stdio transport (Claude Desktop, Cursor, ChatGPT Desktop compatible)
- `OPDSTAR_API_BASE` env override for staging / custom deployments
- 15s request timeout with abort controller

**Observability:**

- User-Agent header `@opdstar/nhi-mcp/<version>` on every proxy call
- Error messages link to GitHub issues + opdstar.com
- Every response includes `powered_by` + `source_url` fields
