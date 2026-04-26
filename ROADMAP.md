# Roadmap

> Public-facing roadmap. Open an issue if you want to see something specific earlier.

## Current

`@opdstar/nhi-mcp` provides read-only MCP tools for Taiwan NHI reference data:
rejection codes, procedure mappings, audit indicators, drug catalog, fee
schedule, drug rules, safe-phrase previews, audit guideline excerpts, and
semantic + full-text wiki search. All tools proxy through `opdstar.com`
(edge-cached, no API keys needed).

See **CHANGELOG.md** for the per-version history.

## Future direction

Areas under consideration. Concrete tool names + signatures will land in
the CHANGELOG when shipped — not pre-announced here.

- Better error messages with structured codes
- Response schema versioning
- More client config examples (Continue.dev, Zed, etc.)
- Demo video / GIF in README
- Optional power-user tier (higher rate limits)

## Out of scope

The OPDSTAR clinical product (chart workflow, audit risk prevention,
personalization features) remains closed and exclusive to
[opdstar.com](https://opdstar.com). This MCP server is the **public
reference layer** only.

---

## How to propose

- **Small tools / fixes**: open an issue with the proposal template
- **Bigger ideas**: start a GitHub Discussion
- **Sensitive / partnerships**: email `support@opdstar.com`

We prioritize by: clinical utility × public-data-scope × community demand.
