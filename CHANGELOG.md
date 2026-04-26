# Changelog

All notable changes to `@opdstar/nhi-mcp` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
