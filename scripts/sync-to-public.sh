#!/usr/bin/env bash
# Sync the monorepo's opdstar-nhi-mcp/ subtree to the public
# tatsuju/opdstar-nhi-mcp repo as a single clean commit.
#
# Why this exists
# ───────────────
# `git subtree push` carries monorepo commit subjects/bodies into the
# public history. Those messages are written for internal context and
# routinely include row counts, sources, methods, and tooling that the
# pre-publish-audit.sh deliberately scrubs from file content. The audit
# script's own header notes it does NOT cover commit messages.
#
# This wrapper replaces `git subtree push` with a deterministic flow:
#   1. run pre-publish-audit.sh against the monorepo subtree
#   2. validate the proposed commit MESSAGE against the same patterns
#   3. clone the public repo fresh
#   4. rsync the subtree into the clone (no .git, no node_modules)
#   5. show the diff + prompt
#   6. commit with the validated message + push
#
# All public history is rewritten one clean commit at a time. The
# monorepo retains full internal history; only the sanitized snapshot
# ships out.
#
# Usage
# ─────
#   bash opdstar-nhi-mcp/scripts/sync-to-public.sh "chore: docs refresh"
#   bash opdstar-nhi-mcp/scripts/sync-to-public.sh --dry-run "chore: docs refresh"
#   bash opdstar-nhi-mcp/scripts/sync-to-public.sh --yes "chore: bump v0.6.3"
#
# Flags
#   --dry-run   Stop after diff (do not commit / push)
#   --yes       Skip the interactive confirmation prompt
#
# The commit message is REQUIRED. There is no default — every release
# must have a deliberate, audit-passing message.

set -euo pipefail

# ─── Argument parsing ─────────────────────────────────────────────
DRY_RUN=0
ASSUME_YES=0
COMMIT_MSG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --yes|-y)  ASSUME_YES=1; shift ;;
    -h|--help)
      sed -n '2,40p' "$0"
      exit 0
      ;;
    -*)
      echo "Unknown flag: $1" >&2
      exit 2
      ;;
    *)
      if [[ -z "$COMMIT_MSG" ]]; then
        COMMIT_MSG="$1"
      else
        echo "Unexpected positional arg: $1 (commit message already set)" >&2
        exit 2
      fi
      shift
      ;;
  esac
done

if [[ -z "$COMMIT_MSG" ]]; then
  echo "ERROR: commit message is required as a positional argument." >&2
  echo "       Example: $0 \"chore: docs refresh\"" >&2
  exit 2
fi

# ─── Locate the monorepo root + subtree ───────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUBTREE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"  # opdstar-nhi-mcp/
MONOREPO_ROOT="$(cd "$SUBTREE_DIR/.." && pwd)"

if [[ ! -d "$MONOREPO_ROOT/.git" ]]; then
  echo "ERROR: $MONOREPO_ROOT does not look like a git repo root." >&2
  exit 1
fi

# ─── Constants ────────────────────────────────────────────────────
PUBLIC_REPO="git@github.com:tatsuju/opdstar-nhi-mcp.git"
PUBLIC_BRANCH="main"
TMP_CLONE="/tmp/opdstar-nhi-mcp-public-sync-$$"

# Same SAFE_LINE_RE pattern set as pre-publish-audit.sh, kept in sync
# manually. If audit script's regex evolves, mirror the change here.
SAFE_LINE_RE='(0317A|0338A|0301[12]|0302C|0311A|0314A|0320A|0349A|0401A|36005C|27002C|27018C|48010C|0p|http|https|2026|2025|2024|2023|2022|2021|2020|3000|9KB|8KB|1280|640|99\.9|2009|JS01|J01CR02|N20|J06|K70|L30|H66|B25|tatsuju|<sub>|sigstore|sha512|SHA256|node18|node24|nodejs|MIT |claude-3|claude-4|opdstar\.com|opdstar/nhi-mcp|@modelcontextprotocol|model-context-protocol)'

LEAK_PATTERNS=(
  '[0-9]+,[0-9]{3}'
  '(crawl|scrape|markitdown|firecrawl|TXT export|PDF download|/dl-[0-9]|Dataset A21|OpenData|post-extraction|bulk import|structured-data curation|months of curation|six months of)'
  '(Supabase|PostgREST|pgvector|Vercel Edge|Gemini 768d|iad1|5 engines|five engines|vector \+ keyword|vector index)'
  '\b[0-9]{2,4}\s+(rejection codes?|NHI rejection|個核刪|核刪代碼|procedure codes?|處置碼|wiki chunks?|Wiki 片段|chunks of|筆處置|筆函釋|個函釋|specialties|大專科)'
  '(scrub|moat|leak|內部|私有|monorepo|私有 repo)'
)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cleanup() {
  if [[ -d "$TMP_CLONE" ]]; then
    rm -rf "$TMP_CLONE"
  fi
}
trap cleanup EXIT

# ─── Step 1: file-level audit (existing script) ──────────────────
echo "════════════════════════════════════════════════"
echo "  Step 1/6 — file-level audit (pre-publish-audit.sh)"
echo "════════════════════════════════════════════════"
( cd "$SUBTREE_DIR" && bash scripts/pre-publish-audit.sh ) || {
  echo -e "${RED}File audit failed. Fix leaks in $SUBTREE_DIR before retrying.${NC}" >&2
  exit 1
}

# ─── Step 2: commit-message audit (new) ──────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  Step 2/6 — commit-message audit"
echo "════════════════════════════════════════════════"
echo "Proposed message: $COMMIT_MSG"

msg_leaks=0
for pat in "${LEAK_PATTERNS[@]}"; do
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    if echo "$line" | grep -qE "$SAFE_LINE_RE"; then continue; fi
    echo -e "  ${RED}✗${NC} message matches /$pat/: $line"
    msg_leaks=$((msg_leaks + 1))
  done < <(echo "$COMMIT_MSG" | grep -E "$pat" || true)
done

if [[ $msg_leaks -gt 0 ]]; then
  echo ""
  echo -e "${RED}Commit-message audit failed: ${msg_leaks} leak pattern hit(s).${NC}" >&2
  echo "Rewrite the message at capability level (see audit script header for guidance)." >&2
  exit 1
fi
echo -e "  ${GREEN}✓${NC} commit message clean"

# ─── Step 3: clone public repo fresh ─────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  Step 3/6 — clone public repo"
echo "════════════════════════════════════════════════"
git clone --depth 1 "$PUBLIC_REPO" "$TMP_CLONE"

# ─── Step 4: rsync subtree → clone ───────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  Step 4/6 — sync files"
echo "════════════════════════════════════════════════"
# rsync with --delete keeps the public tree as a true mirror of the
# monorepo subtree (minus build/dev artifacts). If something was
# removed from the subtree, it's removed from public too.
rsync -a --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='coverage' \
  --exclude='.vitest-cache' \
  "$SUBTREE_DIR/" "$TMP_CLONE/"

# ─── Step 5: show diff + confirm ─────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  Step 5/6 — diff preview"
echo "════════════════════════════════════════════════"
cd "$TMP_CLONE"
git add -A

if git diff --cached --quiet; then
  echo -e "${YELLOW}No changes vs. public repo. Nothing to push.${NC}"
  exit 0
fi

echo "Files changed:"
git diff --cached --stat
echo ""
echo "Use 'git -C $TMP_CLONE diff --cached' to see the full diff."

if [[ $DRY_RUN -eq 1 ]]; then
  echo ""
  echo -e "${YELLOW}--dry-run set; stopping before commit.${NC}"
  echo "Clone left at: $TMP_CLONE (will be cleaned on exit)"
  exit 0
fi

if [[ $ASSUME_YES -eq 0 ]]; then
  echo ""
  read -rp "Commit and push to $PUBLIC_REPO ($PUBLIC_BRANCH)? [y/N] " reply
  if [[ ! "$reply" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

# ─── Step 6: commit + push ───────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  Step 6/6 — commit + push"
echo "════════════════════════════════════════════════"
git commit -m "$COMMIT_MSG"
git push origin "$PUBLIC_BRANCH"

echo ""
echo -e "${GREEN}🟢 Done.${NC} Public repo updated with one clean commit."
echo "Monorepo subtree is unchanged — its internal history stays private."
