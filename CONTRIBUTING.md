# Contributing to @opdstar/nhi-mcp

Thanks for your interest! This project is Taiwan's first public NHI MCP server, maintained by the [OPDSTAR](https://opdstar.com) team.

## Ground rules

1. **All tools must be read-only** — no writes, no mutations, no personal data
2. **All data must come from public NHI sources** — we do not expose OPDSTAR's private audit engine or AI-generated content
3. **Every tool response must include `powered_by` and `source_url`** — brand attribution is non-negotiable
4. **Chinese and English** — docs and comments should be bilingual where practical; code comments may be either

## What we welcome

- 🐛 **Bug reports** — wrong data, crash, unexpected tool behavior
- 🌐 **Translation fixes** — better English / Chinese wording in tool descriptions
- 📚 **Example configs** — new MCP clients we haven't documented yet
- 🧪 **Test coverage** — more offline unit tests
- ⚡ **Performance** — smarter caching, faster tool calls

## What needs discussion first (open an issue before PR)

- 🆕 **New tools** — must justify: (a) public data source, (b) clear query pattern, (c) no overlap with closed OPDSTAR features
- 🔄 **Breaking API changes** — tool name / argument / response shape
- 🔐 **Auth / API key support** — currently public; any gating changes product direction

## What we will not accept

- ❌ Tools that generate clinical recommendations (SaMD boundary)
- ❌ Tools that call OPDSTAR's private audit engine / prompt templates
- ❌ Bundling other people's NHI datasets without permission
- ❌ Removal of `powered_by` / `source_url` attribution

## Development setup

```bash
git clone https://github.com/tatsuju/opdstar-nhi-mcp.git
cd opdstar-nhi-mcp
npm install
npm test                 # vitest, offline
npm run typecheck        # tsc strict
npm run build            # tsup → dist/
```

## Testing against the real API

```bash
node dist/index.js       # stdio MCP server, talks to opdstar.com
```

Pipe a JSON-RPC frame in via stdin (see `examples/` once populated) or plug into Claude Desktop via `claude_desktop_config.json`.

For staging:
```bash
OPDSTAR_API_BASE=https://staging.opdstar.com/api/mcp node dist/index.js
```

## Commit conventions

- `feat(tool): add lookup_X` — new tool
- `fix(client): handle 503 gracefully` — bug fix
- `docs: update claude_desktop example` — docs only
- `chore(deps): bump mcp sdk to 1.1.0` — dependency bump

## Code of conduct

Be kind. We're building infrastructure for Taiwanese healthcare — patience and clarity go a long way.

For sensitive issues (security, misuse), email `support@opdstar.com` instead of filing a public issue.
