# Gate 4 · Delivery slices

## Queue strategy

One small foundation item makes future tests visible to the gate. It is not counted as a
product slice. Three vertical product slices then replace one kind of mock at a time:

```text
Foundation F0: test discovery
  -> Slice 0: linked server-rendered tracer route
    -> Slice 1: verified bilingual facts + original media
      -> Slice 2: calm responsive presentation
```

Only the first unblocked item may carry `factory:ready-to-implement`; later items remain
`factory:wait-to-implement` with the preceding merged PR named as their dependency. This
prevents parallel runs from modifying the same route and keeps the human review queue
below the charter limit.

The specification itself is committed on `spec/fq-1-triceratops` and opened as a draft PR
first. No implementation item becomes ready until a human merges that spec PR into `main`.

## Foundation F0 · Discover every project test

**Queue title:** `[Foundation] Make npm test discover future test files`

**Purpose:** Remove the hard-coded single test filename so later slices cannot add a green
test file that the gate silently ignores. This is repository infrastructure, not Slice 0.

```text
files_expected: package.json
load_bearing: true
gate_level: deep
confidence: high
changed_line_budget: 10
execution: interactive human-authorized run only
```

**Done when:** `scripts.test` still builds first and then invokes `node --test` standard
discovery; `package-lock.json`, dependencies, versions, existing tests, and all other
scripts are unchanged; a direct assertion against `package.json` fails on the pre-change
commit and passes after the change; `npm test` visibly discovers the existing entrance
test; Deep gates are green.

**Independent value:** The repository becomes safe for any later test file, even if the
Triceratops feature stops here.

**Human boundary:** `package.json` is load-bearing. An unattended implementation routine
must stop; a maintainer must explicitly start and read this one-line change.

## Slice 0 · End-to-end tracer

**Queue title:** `[Slice 0] Link a Triceratops tracer exhibit`

**Purpose:** Prove the entire navigation, route, server-rendering, semantic page shape, and
new-test path with honest placeholders and no scientific claims.

```text
files_expected: app/page.tsx, app/exhibits/triceratops/page.tsx, tests/triceratops-route.test.mjs
load_bearing: false
gate_level: full
confidence: high
changed_line_budget: 230
depends_on: Foundation F0 merged
```

**Done when:** The existing entrance has a normal Triceratops link; the new route returns
`200` server-rendered HTML with its own title, heading, return link, figure placeholder,
three observation prompts, three closed fact placeholders, a closed source/credit
placeholder, and a closing section; placeholder copy clearly says facts and artwork are
still being reviewed and asserts no dinosaur fact; the stable route test fails when the
route/link is absent and passes after the change; the original entrance test still runs;
Full gates are green.

**Independent value:** A deployable visitor journey exists end to end. It is modest but
truthful, accessible without JavaScript, and proves that Factory-created tests are part of
the real gate.

**Explicit mock:** Scientific facts, source records, and exhibit artwork remain labeled
placeholders.

## Slice 1 · Replace content and media mocks

**Queue title:** `[Slice 1] Add verified bilingual Triceratops content and original media`

**Purpose:** Replace every scientific/source/media placeholder with the approved content
contract and one original reviewed illustration. Layout remains intentionally plain.

```text
files_expected: content/exhibits/triceratops.ts, app/exhibits/triceratops/page.tsx, public/media/triceratops/exhibit.webp, tests/triceratops-content.test.mjs
load_bearing: true
gate_level: deep
confidence: medium
changed_line_budget: 295 (binary image excluded)
depends_on: Slice 0 merged
execution: interactive human-authorized run only
```

**Done when:** The typed exhibit module contains exactly the three approved propositions,
three prompts, closing prompt, exact institutional locators/support notes, literal-derived
source IDs, synchronous invariants, and CC BY-SA media credit; the page renders matching
Chinese-primary/English-secondary content and safe explicit source links; the illustration
passes the approved anatomy checklist and is visibly labeled as a reconstruction; the
content test fails against Slice 0 placeholders and passes after replacement; no
hypothesis, copied museum text/image, extra claim, remote runtime request, or new dependency
is introduced; Deep gates are green.

**Independent value:** The exhibit is factually useful and licensable even before visual
polish. Visitors receive the complete calm conversation flow with an original local image.

**Mock replaced:** Placeholder facts, source panel, and figure become validated content and
media.

**Stop rule:** If text changes reach 295 lines, the run stops before editing further. It
does not compress provenance, validation, tests, or bilingual content to fit the budget.

## Slice 2 · Replace presentation mock

**Queue title:** `[Slice 2] Apply the calm responsive Triceratops exhibit presentation`

**Purpose:** Turn the accurate but plain exhibit into the approved child-and-grown-up visual
experience without changing facts, sources, media, or behavior.

```text
files_expected: app/exhibits/triceratops/page.module.css, app/exhibits/triceratops/page.tsx, tests/triceratops-style.test.mjs
load_bearing: false
gate_level: full
confidence: medium
changed_line_budget: 260
depends_on: Slice 1 merged
```

**Done when:** The page uses the DUN cream/forest/clay visual language, clear Chinese-first
bilingual hierarchy, large targets, visible keyboard focus, readable disclosure states,
responsive narrow-screen layout, and reduced-motion behavior; the route component changes
only to apply scoped classes/imports; the style contract test fails before the stylesheet
and passes after it; route and content tests remain unchanged and green; no remote URL,
autoplay, animation loop, viewport lock, or new dependency is added; Full gates are green;
a human touch/keyboard review keeps the PR in draft until accepted.

**Independent value:** The complete exhibit becomes comfortable and legible on phone,
desktop, touch, and keyboard while preserving the already verified content.

**Mock replaced:** Browser-default presentation becomes the final route-scoped visual
system.

## Handoff rules after Gate 4 approval

1. Finish the spec branch, run docs-only gates, and open a draft spec PR that closes FQ-1.
2. A human reads and merges the spec PR. Factory never merges it.
3. Create one GitHub issue for F0 and each of S0–S2. F0 receives
   `factory:ready-to-implement`; all dependent items receive
   `factory:wait-to-implement` and name their blocker.
4. Write a `factory-handoff:v1` comment only when an item becomes ready. Its `done_when`,
   `files_expected`, `load_bearing`, `gate_level`, and confidence are copied from this file.
5. After a human merges an item's draft PR, advance exactly the next issue from wait to
   ready and write its handoff. Never expose two dependent items as ready simultaneously.
6. F0 and Slice 1 require interactive human authorization because they touch load-bearing
   paths. Slice 0 and Slice 2 are eligible for the normal bounded implementation workflow.
7. Every implementation opens a draft PR and stops. A human owns every merge.

## Gate 4 approval means

Approval authorizes creation of these four queue items and their dependency states after
the spec PR is merged. It does not approve an implementation, merge, publication, or
scheduled unattended run. Those remain separate, visible actions.
