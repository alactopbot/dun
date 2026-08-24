# Factory queue snapshot

The operational queue lives in GitHub issue labels. This file is a reviewable snapshot
written by `factory-triage` and reported by `/factory`; implementation routines query
GitHub directly.

An unmerged update to this file must never block a later routine from seeing work. Durable
run evidence lives in one file per run under `docs/factory/runs/`.

**Dispositions**

| Disposition | Next stage |
|---|---|
| `ready-to-implement` | factory-implement picks it up |
| `ready-to-spec` | human runs factory-spec |
| `needs-info` | parked, question is on the issue |
| `wait-to-implement` | parked, blocker named below |
| `awaiting-review` | PR open, human owns it |
| `done` | merged by a human |

The corresponding live labels use the `factory:` prefix, for example
`factory:ready-to-implement` and `factory:awaiting-review`. The live issue also carries a
`factory-handoff:v1` comment with the fields needed by implementation.

---

## FQ-3: Make npm test discover future test files

- disposition: done
- source: https://github.com/alactopbot/dun/issues/3
- last_triaged: 2026-08-24
- files_expected: package.json
- load_bearing: true
- gate_level: deep
- done_when: `scripts.test` builds first and uses standard `node --test` discovery; unrelated package metadata and existing tests stay unchanged; the package assertion proves the change; `npm test` discovers the entrance test; Deep gates are green
- confidence: high
- notes: Completed by human merge of PR #8 on 2026-08-24.

## FQ-4: Link a Triceratops tracer exhibit

- disposition: ready-to-implement
- source: https://github.com/alactopbot/dun/issues/4
- last_triaged: 2026-08-24
- files_expected: app/page.tsx, app/exhibits/triceratops/page.tsx, tests/triceratops-route.test.mjs
- load_bearing: false
- gate_level: full
- done_when: The entrance links to a server-rendered Triceratops route with the approved semantic placeholder structure; the new route test and original entrance test run; Full gates are green
- confidence: high
- notes: This is the only ready item.

## FQ-5: Add verified bilingual Triceratops content and original media

- disposition: wait-to-implement
- source: https://github.com/alactopbot/dun/issues/5
- last_triaged: 2026-08-24
- files_expected: content/exhibits/triceratops.ts, app/exhibits/triceratops/page.tsx, public/media/triceratops/exhibit.webp, tests/triceratops-content.test.mjs
- load_bearing: true
- gate_level: deep
- done_when: The approved three sourced propositions, bilingual prompts, source records, invariants, and original credited reconstruction replace every content and media placeholder; the content test proves the replacement; Deep gates are green
- confidence: medium
- blocker: FQ-4 must be merged before this item becomes ready.
- notes: Content and media are load-bearing, so implementation requires an explicitly authorized interactive run and a human-read draft PR.

## FQ-6: Apply the calm responsive Triceratops exhibit presentation

- disposition: wait-to-implement
- source: https://github.com/alactopbot/dun/issues/6
- last_triaged: 2026-08-24
- files_expected: app/exhibits/triceratops/page.module.css, app/exhibits/triceratops/page.tsx, tests/triceratops-style.test.mjs
- load_bearing: false
- gate_level: full
- done_when: The page applies the approved calm responsive visual contract without altering facts, sources, media, or behavior; the style contract test proves the change; existing route and content tests remain green; Full gates are green
- confidence: medium
- blocker: FQ-5 must be merged before this item becomes ready.

---
