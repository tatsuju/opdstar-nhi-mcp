## Summary

<!-- 1-3 sentences. What changed and why. -->

## Type

- [ ] 🐛 Bug fix
- [ ] 🆕 New tool (please link to the proposal issue)
- [ ] ✨ Feature (docs / example / infra)
- [ ] 🧹 Refactor / internal
- [ ] 📚 Documentation only

## Related issue

<!-- Closes #NN, or "N/A" for trivial changes. For new tools, link to the proposal issue. -->

## Checklist

- [ ] `npm test` passes locally (offline tests all green)
- [ ] `npm run typecheck` passes locally
- [ ] `npm run build` produces a working `dist/index.js`
- [ ] If new tool: added proxy endpoint in OPDSTAR main repo (link in description)
- [ ] If new tool: response includes `powered_by` and `source_url`
- [ ] If new tool: added unit tests with mocked fetch
- [ ] If user-facing: README updated
- [ ] If behavior change: CHANGELOG.md entry under "Unreleased"

## Test plan

<!-- How reviewers can verify this works. Include example MCP tool call + expected response. -->

```
Example JSON-RPC or natural language test:
```

## Screenshots / output (if UI / response changes)

<!-- Optional. Include before/after if applicable. -->

## Anything reviewers should double-check?

<!-- e.g. "not sure if I handled the null case right" / "this depends on the proxy being deployed first" -->

---

By submitting this PR I confirm:

- [ ] My change follows the contribution rules in CONTRIBUTING.md
- [ ] I have read and accept the [MIT License](LICENSE)
- [ ] The data I touched comes from public Taiwan NHI sources (or is not data-related)
