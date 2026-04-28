#!/usr/bin/env bash
# Pre-publish leak audit for @opdstar/nhi-mcp.
#
# Runs before npm publish (in GitHub Actions) AND optionally locally
# before tagging. Exits non-zero on any detected leak so CI blocks
# the publish — preventing competitive-intel from sneaking out.
#
# Patterns checked:
#   1. Specific row counts (\d,?\d{3} not in safe-list)
#   2. Data acquisition methods (crawl/scrape/markitdown/firecrawl/
#      TXT export/PDF download/Dataset IDs/post-extraction language)
#   3. Tech stack specifics (Supabase/PostgREST/pgvector/Vercel Edge/Gemini)
#
# Allowed exceptions (fingerprinted in SAFE_PATTERNS):
#   - Example codes (0317A, 00101B, etc. — required for tool docs)
#   - HTTP URLs (require numbers in domain/path)
#   - Year numbers, version strings
#   - BLOG_POST Vercel-Edge developer-lesson content (waitUntil bug story)
#
# Usage:
#   bash scripts/pre-publish-audit.sh           # exit 0 = clean, 1 = leaks
#   bash scripts/pre-publish-audit.sh --verbose # show every match line

set -uo pipefail

VERBOSE=0
if [[ "${1:-}" == "--verbose" ]]; then VERBOSE=1; fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LEAKS=0
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "════════════════════════════════════════════════"
echo "  @opdstar/nhi-mcp — pre-publish leak audit"
echo "════════════════════════════════════════════════"

# Files in scope: anything in the public-bound tree that isn't a lockfile,
# build output, or node_modules. We deliberately scan dist/ too, since the
# tool descriptions get bundled there and ship to every MCP client.
SCAN_GLOBS=(
  "*.md"
  "src/index.ts"
  "src/tools/*.ts"
  "src/types.ts"
  "src/version.ts"
  "src/client.ts"
  ".github/workflows/*.yml"
  "docs/*.html"
  "docs/zh/*.html"
  "docs/_config.yml"
  "examples/*.json"
  "package.json"
  "smithery.yaml"
  "glama.json"
)

# Exclusion regexp: lines we know are safe (legitimate uses of numbers/keywords)
SAFE_LINE_RE='(0317A|0338A|0301[12]|0302C|0311A|0314A|0320A|0349A|0401A|36005C|27002C|27018C|48010C|0p|http|https|2026|2025|2024|2023|2022|2021|2020|3000|9KB|8KB|1280|640|99\.9|2009|JS01|J01CR02|N20|J06|K70|L30|H66|B25|tatsuju|<sub>|sigstore|sha512|SHA256|node18|node24|nodejs|Node\.js [0-9]|MIT |claude-3|claude-4|^\.|^---|opdstar\.com|opdstar/nhi-mcp|@modelcontextprotocol|model-context-protocol)'
# BLOG_POST tech-lesson context exclusions (waitUntil bug discussion is OK)
BLOG_POST_LESSON_RE='(BLOG_POST.*Vercel Edge|BLOG_POST.*Edge runtime|waitUntil|fire-and-forget|V8 isolate)'

run_audit () {
  local name="$1"
  local pattern="$2"
  local extra_filter="${3:-}"

  echo ""
  echo "── ${name} ──"

  local hits=0
  local matches=""
  for glob in "${SCAN_GLOBS[@]}"; do
    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      # Apply safe-line exclusion
      if echo "$line" | grep -qE "$SAFE_LINE_RE"; then continue; fi
      if echo "$line" | grep -qE "$BLOG_POST_LESSON_RE"; then continue; fi
      if [[ -n "$extra_filter" ]] && echo "$line" | grep -qE "$extra_filter"; then continue; fi
      matches+="$line"$'\n'
      hits=$((hits + 1))
    done < <(grep -rnE "$pattern" $glob 2>/dev/null || true)
  done

  if [[ $hits -eq 0 ]]; then
    echo -e "  ${GREEN}✓${NC} clean"
  else
    echo -e "  ${RED}✗ ${hits} potential leak(s)${NC}"
    if [[ $VERBOSE -eq 1 ]]; then
      echo "$matches" | head -20 | sed 's/^/    /'
    else
      echo "    (run with --verbose to see matches)"
    fi
    LEAKS=$((LEAKS + hits))
  fi
}

# ─── Audit 1: row counts ────────────────────────────────────────
# Comma-formatted thousands (e.g. 5,994 / 8,232 / 1,497) — this is how
# every real leak in past releases was formatted. Using the comma as the
# anchor virtually eliminates false positives from example codes (00101B),
# years, NHI 9-char drug codes, etc.
run_audit "Audit 1 — Row counts" \
  '[0-9]+,[0-9]{3}' \
  '(package-lock|node_modules|favicon|sigstore|^[0-9a-f]{6,})'

# ─── Audit 2: methods + sources ─────────────────────────────────
run_audit "Audit 2 — Methods + sources" \
  '(crawl|scrape|markitdown|firecrawl|TXT export|PDF download|/dl-[0-9]|Dataset A21|OpenData|post-extraction|bulk import|structured-data curation|months of curation|six months of)' \
  ''

# ─── Audit 3: tech stack ────────────────────────────────────────
# 'edge-cached' is generic CDN terminology and is allowed.
# 'Vercel Edge' / 'Supabase' / etc. reveal stack and are blocked.
# '5 engines' / 'five engines' reveals OPDSTAR internal architecture.
# 'vector + keyword index' / 'vector index' is a pgvector implementation hint.
run_audit "Audit 3 — Tech stack specifics" \
  '(Supabase|PostgREST|pgvector|Vercel Edge|Gemini 768d|iad1|5 engines|five engines|vector \+ keyword|vector index)' \
  ''

# ─── Audit 4: row counts in NHI context (plain, no comma) ─────
# Catches '234 rejection codes' / '234 個核刪代碼' / '930 函釋' / etc.
# The existing Audit 1 pattern catches comma-formatted counts (1,497 / 8,232).
# This pattern catches 2-4 digit counts adjacent to NHI-specific subjects.
run_audit "Audit 4 — Plain row counts in NHI context" \
  '\b[0-9]{2,4}\s+(rejection codes?|NHI rejection|個核刪|核刪代碼|procedure codes?|處置碼|wiki chunks?|Wiki 片段|chunks of|筆處置|筆函釋|個函釋|specialties|大專科)' \
  ''

# ─── Audit 5: dist bundle (built artifact ships to every MCP client) ─
echo ""
echo "── Audit 5 — dist bundle ──"
if [[ -f dist/index.js ]]; then
  bundle_leaks=$(grep -oE '(crawl|scrape|markitdown|firecrawl|Dataset A21|OpenData|Supabase|PostgREST|pgvector|Gemini 768d)' dist/index.js | sort -u || true)
  if [[ -z "$bundle_leaks" ]]; then
    echo -e "  ${GREEN}✓${NC} bundle clean"
  else
    echo -e "  ${RED}✗ bundle contains:${NC}"
    echo "$bundle_leaks" | sed 's/^/    /'
    LEAKS=$((LEAKS + 1))
  fi
else
  echo -e "  ${YELLOW}⚠${NC} dist/index.js missing — run 'npm run build' first"
fi

# ─── Verdict ───────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
if [[ $LEAKS -eq 0 ]]; then
  echo -e "  ${GREEN}🟢 GREEN-LIGHT${NC} — safe to publish"
  echo "════════════════════════════════════════════════"
  exit 0
else
  echo -e "  ${RED}🔴 BLOCKED${NC} — ${LEAKS} potential leak(s) found"
  echo "════════════════════════════════════════════════"
  echo ""
  echo "Next steps:"
  echo "  1. Re-run with --verbose to see exact matches"
  echo "  2. Sanitize each leak in the source"
  echo "  3. Re-run this script until clean"
  echo "  4. Then push the tag"
  echo ""
  echo "Reference: .claude/memory/feedback_public_moat_preservation.md"
  exit 1
fi
