---
name: 💡 New tool proposal
about: Suggest a new tool to add to the MCP server
title: "[TOOL] "
labels: enhancement, new-tool
assignees: ''
---

## Tool name

<!-- Proposed tool name, snake_case. e.g. `get_drug_rules` -->

## What would it do?

<!-- One sentence. Input → Output. -->

## Why does this belong in the public MCP (not the OPDSTAR private app)?

Required criteria (check all that apply):

- [ ] Data source is **publicly available** on 健保署 website or other public Taiwan gov resource
- [ ] Tool is **read-only** (no writes, no personal data)
- [ ] Tool does **not** overlap with OPDSTAR's private features (5-engine audit, AI optimization, safe phrases)
- [ ] Response shape is **small and structured** (fits in a single MCP tool response)

## Proposed interface

Arguments:
```typescript
{
  foo: string;         // description
  bar?: number;        // optional, default 10
}
```

Response shape:
```json
{
  "field1": "...",
  "field2": [...]
}
```

## Data source

<!-- URL to 健保署 page(s) or other public resource where the data lives -->

## Use case / example question

<!-- A real-world question a doctor would ask where this tool would help AI answer -->

> "..."

## Alternatives considered

<!-- Any existing tool that partially covers this? Why isn't it sufficient? -->

## Willing to implement?

- [ ] Yes, I can send a PR with data + code + tests
- [ ] Partial — I can provide data / research but not code
- [ ] Just suggesting, please implement
