<h1 align="center">@opdstar/nhi-mcp</h1>

<p align="center">
  <b>Taiwan's first public Model Context Protocol server for National Health Insurance data</b><br/>
  <sub>台灣第一個公開的健保 MCP Server</sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@opdstar/nhi-mcp"><img alt="npm" src="https://img.shields.io/npm/v/@opdstar/nhi-mcp.svg?color=0ea5e9"></a>
  <a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <a href="https://opdstar.com"><img alt="Powered by OPDSTAR" src="https://img.shields.io/badge/Powered%20by-OPDSTAR-14b8a6.svg"></a>
  <a href="https://modelcontextprotocol.io"><img alt="MCP" src="https://img.shields.io/badge/MCP-compatible-7c3aed.svg"></a>
</p>

<p align="center">
  <b>Powered by <a href="https://opdstar.com">OPDSTAR</a></b> — 台灣門診醫師病歷翻譯 + 核刪防護 Co-Pilot
</p>

<p align="center">
  <b>繁中總覽</b>：<a href="OVERVIEW_ZH.md">OVERVIEW_ZH.md</a> ·
  <b>Roadmap</b>：<a href="ROADMAP.md">ROADMAP.md</a> ·
  <b>Contributing</b>：<a href="CONTRIBUTING.md">CONTRIBUTING.md</a>
</p>

---

## Who is this for?

**Taiwan healthcare professionals** using AI assistants (Claude Desktop, Cursor, ChatGPT Desktop) who want to:

- 🩺 **Check NHI rejection risk** before submitting a claim, without leaving their AI chat
- 📋 **Look up procedure codes** applicable to a diagnosis in seconds
- 📖 **Ask questions in Chinese** about NHI rules and get grounded answers with source URLs
- 🏥 **Integrate NHI data** into their own clinic software / HIS without building from scratch

**Developers** building Taiwan-specific healthcare AI tools — hook into one well-curated data source instead of scraping 健保署 manually.

---

## Real-world examples

### 👩‍⚕️ Scenario 1 — Audit risk pre-check

You're writing a chart in Claude Desktop:

> **You:** 我給 L30.9 慢性濕疹病人開了 prednisolone 30mg QD 5 天會不會被核刪？

> **Claude** (auto-calls `lookup_rejection_code` + `get_indicator`):
>
> 依健保審查 **008 指標**，口服類固醇 + 濕疹類診斷若 PE 描述不足，會觸發核刪代碼 **0320A**。建議：PE 補充病灶面積 ≥ 30% 全身，或加入更嚴重的 ICD-10 佐證。
>
> 資料來源：OPDSTAR

### 🔍 Scenario 2 — Procedure lookup

> **You:** 中耳炎 H66.9 耳鼻喉科能申報哪些處置？

> **Claude** (auto-calls `get_procedures_for_icd`):
>
> - `27002C` 耳鏡檢查（25 點）
> - `27018C` 耳膜穿刺（120 點）
> - `36005C` 鼓室通氣管置入
>
> Full list: NHI procedures across major specialties.

### 📚 Scenario 3 — Wiki Q&A

> **You:** 慢性病連續處方箋最長可以開多久？

> **Claude** (auto-calls `search_nhi_wiki`):
>
> 依健保署規定，慢性病連續處方箋每次調劑之藥品使用期間最長 3 個月。原文：nhi.gov.tw/ch/cp-XXX.html

---

## What is this?

`@opdstar/nhi-mcp` lets any [Model Context Protocol](https://modelcontextprotocol.io) client — Claude Desktop, Cursor, ChatGPT Desktop, custom agents — **directly query Taiwan's National Health Insurance dataset** curated and maintained by [OPDSTAR](https://opdstar.com).

Ask your AI in natural language:

> "慢性濕疹 L30.9 開 prednisolone 30mg 5 天會不會被核刪？"

It auto-calls the right tools and pulls real NHI data:

- **NHI rejection codes** (e.g. `0317A`, `0338A`) with severity + category, browsable by category (00–09)
- **NHI procedure codes** across major specialties, mapped to ICD-10
- **NHI audit indicators** (008 / 014 / 027 / P043 and others) with thresholds and applicable specialty
- **NHI 審查注意事項 (audit clauses)** by procedure code or specialty, with risk flags
- **NHI drug catalog and 藥品給付規定** — search formulary + look up payment rules
- **NHI fee schedule** — current effective 全民健康保險醫療服務給付項目及支付標準
- **NHI 重大傷病範圍** (major-illness coverage) lookup and ICD-10 reverse check
- **Semantic + full-text search** over the 健保署 official wiki
- **Aggregate dispute-resolution signals** by category or rejection code (no individual case details)

All served through the `opdstar.com` edge layer — zero configuration, cached globally, under 100ms response.

---

## Install

```bash
# Claude Desktop — one-line, no install
npx @opdstar/nhi-mcp

# Or persist as a dependency
npm install -g @opdstar/nhi-mcp
```

Requires **Node.js 18+**.

### Claude Desktop config

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "opdstar-nhi": {
      "command": "npx",
      "args": ["-y", "@opdstar/nhi-mcp"]
    }
  }
}
```

Restart Claude Desktop. You should see **17 tools** appear in the tools menu.

### Cursor config

Add to `.cursor/mcp.json` in your project root (or global `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "opdstar-nhi": {
      "command": "npx",
      "args": ["-y", "@opdstar/nhi-mcp"]
    }
  }
}
```

---

## Tools

### 1. `lookup_rejection_code`

Look up a Taiwan NHI rejection code (5-character, e.g. `0317A`).

**Arguments**: `{ code: string }`

**Example**:
```
> Claude, what does rejection code 0317A mean?
→ [tool call: lookup_rejection_code(code="0317A")]
→ {
    "code": "0317A",
    "description": "處方含抗生素，診斷碼未見感染性疾病",
    "severity": "critical",
    "category": "03",
    "category_name": "藥品特材",
    "opdstar_relevant": true,
    "source_url": "https://opdstar.com/faq?q=核刪代碼 0317A"
  }
```

### 2. `get_procedures_for_icd`

Given an ICD-10 code and specialty, return the NHI procedure codes applicable.

**Arguments**: `{ icd10: string, specialty: string, limit?: number }`

**Example**:
```
> What NHI procedures apply to L30.9 in dermatology?
→ [tool call: get_procedures_for_icd(icd10="L30.9", specialty="dermatology", limit=5)]
→ {
    "count": 4,
    "results": [
      {
        "code": "48010C",
        "name_zh": "傷口處置",
        "nhi_points": 125,
        "audit_notes": "需記錄傷口大小、深度、分泌物",
        "source_url": "https://opdstar.com/faq?q=處置碼 48010C"
      },
      ...
    ]
  }
```

### 3. `get_indicator`

Look up a Taiwan NHI audit indicator — threshold, applicable drugs/diagnoses.

**Arguments**: `{ code: string }`

**Example**:
```
> What's indicator 008 about?
→ [tool call: get_indicator(code="008")]
→ {
    "code": "008",
    "name": "急性上呼吸道感染抗生素使用率",
    "threshold_pct": 10,
    "applicable_drugs": ["antibiotic"],
    "applicable_icd_patterns": ["J00","J06","J11","J02","J03","J04"],
    "severity": "critical",
    "rejection_codes": ["0311A", "0349A"]
  }
```

### 4. `search_nhi_wiki`

Semantic + full-text search over Taiwan's official NHI wiki (9 categories).

**Arguments**: `{ query: string, category?: "audit"|"drugs"|..., limit?: number }`

**Example**:
```
> Search NHI wiki for chronic prescription rules
→ [tool call: search_nhi_wiki(query="慢性病連續處方箋天數上限", category="drugs")]
→ {
    "count": 3,
    "results": [
      {
        "title": "慢性病連續處方箋使用規定",
        "content": "慢性病連續處方箋每次調劑之藥品使用期間，最長以 3 個月為限...",
        "similarity": 0.87,
        "source_url_nhi": "https://www.nhi.gov.tw/ch/cp-XXX.html",
        "source_url_opdstar": "https://opdstar.com/ask?q=..."
      }
    ]
  }
```

---

### 5. `get_drug_rules` <sub>v0.2</sub>

Taiwan NHI 藥品給付規定 lookup. At least one filter required (to avoid unbounded returns).

**Arguments**: `{ specialty?: string, rejection_code?: string, drug_category_query?: string }`

**Example**:
```
> 兒科開抗生素有哪些給付規定？
→ [tool call: get_drug_rules(specialty="pediatrics", drug_category_query="antibiotic")]
→ {
    "count": 3,
    "results": [
      {
        "specialty": "all",
        "drug_category": "抗生素 (Antibiotics)",
        "diagnosis_pattern": "J00,J02,J03,J04,J05,J06,J11,J20,J21,J22,J40",
        "rejection_code": "0311A",
        "rule_description": "診斷為一般感冒/上呼吸道感染，不應使用抗生素。健保指標 008...",
        "severity": "critical"
      }
    ]
  }
```

### 6. `get_safe_phrases` <sub>v0.2 (preview only)</sub>

Discover which SOAP scenarios have known NHI-safe phrasing for a specialty. **Preview only** — returns scenario + high-risk wording + first sentence of safe example + link to opdstar.com for full library. Full ready-to-copy phrase library is part of the paid OPDSTAR product.

**Arguments**: `{ specialty: string, scenario_query?: string }`

**Example**:
```
> 皮膚科開抗生素有哪些安全寫法？
→ [tool call: get_safe_phrases(specialty="dermatology", scenario_query="抗生素")]
→ {
    "count": 1,
    "note": "這是精簡版。完整安全句型庫（含 ready_phrases 可直接複製貼上）為 OPDSTAR 付費功能...",
    "results": [
      {
        "scenario": "開立抗生素",
        "high_risk": "皮膚感染，開抗生素 7 天。",
        "safe_example_preview": "左小腿紅腫熱痛 2 天，查 erythematous plaque 約 8x6 cm… [… 完整範例請至 opdstar.com]",
        "key_difference": "關鍵不是寫「感染」，而是要寫出細菌性感染的臨床佐證…",
        "full_content_url": "https://opdstar.com/pricing"
      }
    ]
  }
```

### 7. `search_audit_guidelines` <sub>v0.2</sub>

Free-text search over 審查注意事項 rules. Returns reason + suggestion summaries for matched rules.

**Arguments**: `{ query: string (2+ chars), specialty?: string }`

**Example**:
```
> 中醫開藥有什麼注意事項？
→ [tool call: search_audit_guidelines(query="藥品", specialty="tcm")]
→ {
    "count": 4,
    "results": [
      {
        "rule_code": "TCM_DAILY_DRUG_COST",
        "specialty": "tcm",
        "severity": "warning",
        "related_rejection_codes": ["0302C"],
        "reason_zh": "中醫科每日藥費上限 38 點。一般 7 日約 266 點...",
        "suggestion_zh": "若需使用較高價藥材，於病歷詳述辨證配伍理由與必要性..."
      }
    ]
  }
```

### 8. `get_rejection_code_category` <sub>v0.2</sub>

List all NHI rejection codes in a given category (00-09). Useful for discovery — "show me all 手術處置 rejection codes".

**Arguments**: `{ category: "00"|"01"|...|"09", opdstar_relevant_only?: boolean }`

10 categories: `00` 診療品質 · `01` 病歷紀錄 · `02` 基本診療 · `03` 藥品特材 · `04` 手術處置 · `05` 檢查檢驗 · `06` 論病例計酬 · `07` 復健精神 · `08` 其他 · `09` 法令

**Example**:
```
> 列出所有手術處置類的核刪代碼
→ [tool call: get_rejection_code_category(category="04")]
→ {
    "category": "04",
    "category_name": "手術處置",
    "count": 32,
    "results": [
      { "code": "0401A", "description": "...", "severity": "critical", "opdstar_relevant": true },
      ...
    ]
  }
```

### 9. `lookup_drug` <sub>v0.3</sub>

Look up the Taiwan NHI drug catalog (active formulary). Search by generic name, brand name, alias, or NHI 9-char code. For 給付規定 limitations on a drug, use `get_drug_rules` separately.

**Arguments**: `{ q: string (≥2 chars), specialty?, dosage_form?, route? }`

**Example**:
```
> What drugs match 'augmentin'?
→ [tool call: lookup_drug(q="augmentin")]
→ {
    "query": "augmentin",
    "count": 4,
    "results": [
      { "generic_name": "amoxicillin/clavulanate", "brand_names": ["Augmentin", ...], "strength": "875/125 mg", "dosage_form": "tablet", "nhi_drug_code": "BC25551100", "atc_code": "J01CR02", ... },
      ...
    ]
  }
```

### 10. `lookup_fee_code` <sub>v0.4</sub>

Look up the Taiwan NHI fee schedule (全民健康保險醫療服務給付項目及支付標準, current effective edition). Search by exact code, Chinese name, or English name; filter by category prefix (`00`/`P1`/`N2`/...).

**Arguments**: `{ q: string (≥2 chars), category?, icd? }`

**Example**:
```
> 一般門診診察費的點數是多少？
→ [tool call: lookup_fee_code(q="00101B")]
→ {
    "query": "00101B",
    "count": 1,
    "results": [
      {
        "code": "00101B",
        "category_prefix": "00",
        "section": "第二部 西醫",
        "name_zh": "一般門診診察費－醫院門診診察費（不含牙科門診）...",
        "points": 286,
        "effective_start": "2021-03-01",
        "audit_notes": "1.處方交付特約藥局調劑或未開處方者，不得申報藥事服務費...",
        "audit_notes_full_length": 148
      }
    ]
  }
```

> Note: `applicable_icd_pattern` is OPDSTAR-curated and sparse — original NHI data has no ICD-10 mapping. The `icd` filter only matches codes already enriched.

### 11. `lookup_audit_clauses_for_procedure` <sub>v0.5</sub>

Find official 審查注意事項 clauses that cite a specific NHI procedure code. Returns clause summaries with risk flags (`amount_limit` / `frequency_rule` / `indication`).

**Arguments**: `{ procedure_code: string, specialty?: string }`

**Example**:
```
> 處置碼 51017C 有哪些審查注意事項？
→ [tool call: lookup_audit_clauses_for_procedure(procedure_code="51017C")]
→ {
    "count": 3,
    "results": [
      {
        "clause_headline": "...",
        "specialty": "...",
        "risk_flags": ["amount_limit"],
        "source_url": "https://opdstar.com/..."
      },
      ...
    ]
  }
```

### 12. `lookup_audit_clauses_for_specialty` <sub>v0.5</sub>

Browse 審查注意事項 by specialty (dermatology / TCM / dentistry / ophthalmology / etc.). Filterable by keyword and risk flag.

**Arguments**: `{ specialty: string, keyword?: string, risk_flag?: "amount_limit"|"frequency_rule"|"indication"|"any" }`

### 13. `lookup_major_illness` <sub>v0.5</sub>

Browse the official 重大傷病範圍及項目 list. Returns category code, name, ICD-10 coverage, application requirement, validity period, and copay-exemption status.

**Arguments**: `{ category_code?: string, keyword?: string }`

### 14. `check_icd_for_major_illness_eligibility` <sub>v0.5</sub>

Reverse lookup. Given an ICD-10 code, return major-illness categories the diagnosis may qualify for. Useful for surfacing copayment-exemption hints when an MCP agent assists with claim coding.

**Arguments**: `{ icd_code: string }`

### 15. `lookup_audit_indicator` <sub>v0.5</sub>

Look up the official 分析審查不予支付指標 (threshold-based audit rules). Returns indicator name, category, threshold percentage, applicable specialty, monitored procedure codes, and the official action description.

**Arguments**: `{ indicator_code?: string, category?: string, specialty?: string, procedure_code?: string }`

**Example**:
```
> '23401C' 是被哪個指標監控？
→ [tool call: lookup_audit_indicator(procedure_code="23401C")]
→ {
    "count": 1,
    "results": [{
      "indicator_code": "001",
      "name": "眼科局部處置申報率",
      "threshold_pct": 30,
      "applicable_specialty": "ophthalmology",
      ...
    }]
  }
```

### 16. `lookup_appeal_statistics_by_category` <sub>v0.6</sub>

Aggregate dispute-resolution signals by category (medication / procedure / fee_calculation / qualification / etc.). Returns abstract volume buckets (`few` / `several` / `many`) and claimant win-rate signals (`rare` / `occasional` / `moderate` / `common`) across resolution stages.

**Arguments**: `{ dispute_category: string, stage_tier?: string }`

> Aggregate signals only — no individual case details, no case numbers, no arguments. Full implementation context lives behind opdstar.com.

### 17. `count_appeal_precedents_for_rejection_code` <sub>v0.6</sub>

Returns rough volume + claimant win-rate signal for resolutions involving a specific NHI rejection or procedure code. Useful for estimating how a code's disputes typically resolve.

**Arguments**: `{ rejection_code?: string, procedure_code?: string }`

> Aggregate signals only — same moat-preserving pattern as #16.

---

## How it works

```
┌────────────────────┐
│  Claude Desktop    │
│  Cursor / ChatGPT  │   (any MCP client)
└──────────┬─────────┘
           │ MCP (stdio)
           ▼
┌────────────────────┐
│  @opdstar/nhi-mcp  │   (this package, ~9KB single-file bundle)
│ 10 read-only tools │
└──────────┬─────────┘
           │ HTTPS
           ▼
┌────────────────────┐
│  opdstar.com       │   Edge proxy, globally cached
│  /api/mcp/*        │
└──────────┬─────────┘
           │
           ▼
┌────────────────────┐
│  OPDSTAR backend   │   curated NHI knowledge base
└────────────────────┘
```

**Why proxy through opdstar.com?**

1. **Single source of truth** — data updates roll out instantly without republishing npm
2. **Rate-limited & cached** — edge proxy absorbs traffic spikes
3. **Zero config for you** — no API keys, no secrets, no setup

**Staging override**: set `OPDSTAR_API_BASE=https://staging.opdstar.com/api/mcp` in your MCP client env to point at a staging endpoint (for plugin authors / OPDSTAR team).

---

## Positioning & Disclaimer

`@opdstar/nhi-mcp` is a **reference / translation tool**. It:

- ✅ Looks up Taiwan NHI public data and official wiki content
- ✅ Returns structured JSON for AI reasoning
- ❌ Does NOT make diagnostic or prescribing recommendations
- ❌ Does NOT constitute clinical decision support (SaMD)

Final clinical judgment remains with the treating physician. For end-to-end audit with OPDSTAR's 5-engine risk prediction, use the full app at [opdstar.com](https://opdstar.com).

Data sourced from [健保署全球資訊網](https://www.nhi.gov.tw/) (public) and curated by the OPDSTAR team.

---

## Frequently Asked Questions

### What is Model Context Protocol (MCP)?

MCP is an open standard released by Anthropic in November 2024 that lets AI assistants call external tools through a standardized protocol. Think of it as "USB-C for AI agents" — write a server once, and any MCP-compatible client (Claude Desktop, Cursor, ChatGPT Desktop, Continue, Zed, custom agents) can talk to it without custom integration code. Official spec: [modelcontextprotocol.io](https://modelcontextprotocol.io).

### What is Taiwan's National Health Insurance (NHI)?

Taiwan's **全民健康保險 (National Health Insurance)** is a single-payer universal healthcare system covering 99.9% of Taiwan's population since 1995. It maintains an extensive set of audit rules for claim submissions — doctors who submit non-compliant claims face **rejection (核刪)** and lose real income. This MCP server exposes the rules, codes, and wiki content doctors need to navigate those rules.

### Who should install this?

Three audiences:

- **Taiwanese doctors** using AI assistants (Claude Desktop, Cursor) who want real-time NHI code lookup and audit risk insight while writing charts
- **HIS / clinic software vendors** integrating AI features — zero-cost access to a curated NHI dataset instead of scraping 健保署 manually
- **Researchers** studying Taiwan's healthcare system who need structured, queryable access to rejection codes, procedures, and audit indicators

### Do I need an OPDSTAR account or API key?

**No.** The MCP is fully public and free under MIT license. No account, no API key, no registration. The proxy layer at `opdstar.com` applies rate limiting based on IP, not identity.

### Is this an official NHI product?

**No.** It is independently developed by the OPDSTAR team. All data is sourced from publicly available 健保署 publications and websites. We are not affiliated with, endorsed by, or officially representing Taiwan's National Health Insurance Administration. For authoritative guidance, always consult official NHI publications.

### Is my patient data sent anywhere?

**No patient data is ever transmitted.** The tools are pure lookups over public NHI data (codes, procedures, wiki excerpts). When you ask "does 0317A apply to L30.9?", the MCP sends only the code and diagnosis name — never patient names, IDs, or clinical notes. The proxy at opdstar.com does not log query content (only aggregate counters for rate limiting).

### How often is the data updated?

Monthly. The OPDSTAR team syncs structured tables and wiki chunks when 健保署 publishes new rules or amendments. Follow [@opdstar on GitHub](https://github.com/tatsuju/opdstar-nhi-mcp) or watch [CHANGELOG.md](CHANGELOG.md) for changes.

### Can I use this commercially?

**Yes.** MIT license permits unrestricted commercial use. You may embed `@opdstar/nhi-mcp` in paid products without royalties. We only ask that `powered_by` attribution remains in tool responses (it's built in and should not be stripped).

### What about languages? Does it work in English?

Tool arguments and responses support both **Traditional Chinese (繁體中文)** and **English**. The underlying NHI data is primarily 繁中 — Chinese keys like `name_zh` are always populated; `name_en` is populated where 健保署 provides English translations. AI assistants handle the language switching seamlessly.

### Can this replace the full OPDSTAR SaaS product?

**No — different scope.** This MCP offers read-only lookups. The full [OPDSTAR](https://opdstar.com) product provides AI-powered chart translation, real-time audit risk detection with a 5-engine rule system, safe-phrase suggestion, and personalized prescription tracking — all requiring proprietary prompt engineering and clinical knowledge that remains closed-source.

### How do I report wrong data or propose new tools?

File a GitHub issue using our templates:

- [🐛 Bug report](https://github.com/tatsuju/opdstar-nhi-mcp/issues/new?template=bug_report.md) — data is wrong, tool crashes
- [💡 New tool proposal](https://github.com/tatsuju/opdstar-nhi-mcp/issues/new?template=new_tool_proposal.md) — you want a tool we don't have yet
- [💬 Discussions](https://github.com/tatsuju/opdstar-nhi-mcp/discussions) — general questions, show-and-tell

For sensitive issues: `support@opdstar.com`.

---

## Trusted data sources

All data is curated from publicly available Taiwan NHI resources:

- [健保署全球資訊網](https://www.nhi.gov.tw/) — official NHI website
- 專業審查注意事項 (audit guidelines)
- 不予支付理由代碼 (rejection codes)
- 藥品給付規定 (drug payment rules)
- 健保醫療費用申報與審查電腦作業手冊 (claims submission manual)
- 全民健康保險醫療服務給付項目及支付標準 (fee schedule)

Data is kept in sync with the latest official publications.

---

## Used by

- **[OPDSTAR](https://opdstar.com)** — Chart translation + audit-risk prevention SaaS for Taiwanese outpatient doctors. In production use since 2026-04.
- _Your organization here — send a PR to add to this list!_

---

## What's open vs. what's closed

**Open (this package)**: pure lookup tools over already-public NHI data.

**Closed (OPDSTAR's moat)**: the OPDSTAR clinical product (chart workflow, audit risk prevention, personalization features) is closed-source and exclusive to [opdstar.com](https://opdstar.com).

---

## Roadmap

See [CHANGELOG.md](CHANGELOG.md) for the per-version history. The high-level direction lives in [ROADMAP.md](ROADMAP.md). New tool proposals welcome via GitHub Issues using the `new_tool_proposal` template — see CONTRIBUTING.md.

---

## Development

```bash
git clone https://github.com/tatsuju/opdstar-nhi-mcp.git
cd opdstar-nhi-mcp
npm install
npm test         # vitest, 8 offline unit tests
npm run build    # tsup → dist/index.js
```

Point at your local dev server:

```bash
OPDSTAR_API_BASE=http://localhost:3000/api/mcp node dist/index.js
```

---

## Contributing — Pull Requests welcome 🙌

This is an **open-source, community-driven** project under MIT license. Anyone can contribute:

- 🐛 **Bug reports** — [file an issue](https://github.com/tatsuju/opdstar-nhi-mcp/issues/new/choose) with our bug template
- 💡 **New tool proposals** — [start a discussion](https://github.com/tatsuju/opdstar-nhi-mcp/issues/new/choose) with the tool proposal template; we'll review for fit before you invest in a PR
- 🌐 **Translation / docs** — improve English/繁中 clarity
- 📦 **MCP client configs** — add examples for Continue.dev, Zed, custom agents
- 🧪 **More tests** — edge cases, negative paths, integration harnesses

### How to send a PR

1. Fork `tatsuju/opdstar-nhi-mcp`
2. Create a feature branch: `git checkout -b add-something`
3. Make your change, run `npm test` + `npm run typecheck` + `npm run build`
4. Commit with a conventional message: `feat(tool): add get_drug_rules`
5. Push + open PR — GitHub's PR template will guide you through the checklist

### What we will NOT accept

Per [CONTRIBUTING.md](CONTRIBUTING.md):

- Tools that generate clinical diagnoses or recommendations (SaMD boundary)
- Tools that expose OPDSTAR's private audit engine or prompt templates
- Removal of `powered_by` / `source_url` attribution

Everything else — we're genuinely happy to hear from you. 📬 Sensitive stuff: `support@opdstar.com`.

---

## Related projects

- [mcp-taiwan-legal-db](https://github.com/lawchat-oss/mcp-taiwan-legal-db) — Taiwan legal data MCP
- [OPDSTAR](https://opdstar.com) — the full app this MCP links back to

---

## License

[MIT](LICENSE) © OPDSTAR Team

---

<p align="center">
  Built by the <a href="https://opdstar.com">OPDSTAR</a> team · Taipei, Taiwan
</p>
