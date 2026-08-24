# Gate 2 · Architecture

## Decision summary

Build the first exhibit as a server-rendered, read-only route backed by typed content stored
in the repository. The browser receives complete HTML and one original local illustration.
There is no client state, runtime API, database, account, remote content fetch, audio, or new
dependency. Native disclosure controls reveal the optional facts.

Chinese is the primary interface language. Concise English appears directly beside its
matching Chinese name, prompt, or fact as visibly secondary text with an explicit language
attribute. Both are server-rendered; there is no language toggle, preference, cookie, URL
mode, or hidden duplicate experience in this release.

This is intentionally smaller than a reusable museum platform. We will learn from one
complete exhibit before generalizing page composition or content authoring.

## Existing systems and modules touched

- `app/page.tsx`: the existing museum entrance will link its Triceratops specimen and land
  room to the exhibit.
- `app/globals.css`: only shared link/focus behavior may be adjusted. Exhibit-specific
  styling remains scoped to the new route.
- `app/layout.tsx`: remains the root metadata and language declaration; no change is
  expected for this slice.
- `package.json`: the test command changes from one hard-coded test filename to Node's
  standard test discovery so every new `*.test.mjs` file is actually executed. No package,
  version, or lockfile changes.
- The vinext app router and `worker/index.ts` continue serving the route. The worker is not
  changed.
- The current rendered-HTML test remains unchanged because existing tests are load-bearing.

## New route and static assets

- `GET /exhibits/triceratops` is a normal server-rendered page route.
- One route-scoped stylesheet owns the exhibit layout and responsive behavior.
- One original illustration is stored below `public/media/triceratops/` in a web-ready
  raster format. It is checked visually by a human for age suitability and obvious anatomy
  errors before approval.
- A new rendered-HTML test exercises the exhibit route without changing the existing test.
  It asserts only stable route semantics—status, title, primary heading, return navigation,
  and absence of forbidden behavior—not temporary tracer copy or placeholder media.
- The test command remains build-first, then runs `node --test` without a filename. This
  uses Node's standard test-file discovery and was checked against the current suite before
  approval.

There are no API endpoints, redirects, cookies, local storage, service workers, or outbound
requests during a visit. Links to adult-readable sources are ordinary optional links and
use safe external-link attributes.

## Content structures

Repository content is TypeScript data so missing fields fail type checking. The conceptual
shape is:

```text
LocalizedText
  zh: string
  en: string

SourceReference
  id: stable local identifier
  title: source title
  publisher: responsible museum or institution
  url: canonical HTTPS URL
  accessedOn: YYYY-MM-DD
  locator: exact page heading or named section used
  supports: short paraphrase of the evidence this location supplies

ExhibitFact
  id: stable local identifier
  text: LocalizedText
  sourceIds: one or more SourceReference ids derived from the declared source collection
  evidence: fossil-evidence | scientific-consensus | hypothesis

ObservationPrompt
  id: stable local identifier
  prompt: LocalizedText
  adultNote: optional LocalizedText

MediaCredit
  path: repository-relative public asset path
  alt: LocalizedText
  creator: string
  license: SPDX-compatible identifier
  source: optional URL

Exhibit
  slug: string
  name: LocalizedText
  scientificName: string
  introduction: LocalizedText
  prompts: non-empty list of ObservationPrompt
  facts: non-empty list of ExhibitFact
  closingPrompt: ObservationPrompt
  sources: non-empty list of SourceReference
  media: non-empty list of MediaCredit
```

The source collection is declared as literal immutable data; the valid source-id type is
derived from that collection rather than written as an unconstrained string. A build-time
validation assertion also rejects duplicate source IDs, dangling fact references, empty
source lists, and facts whose cited source has no locator or support note.

Every fact must resolve to a declared source and retain a short claim-to-evidence note.
Claims about uncertain behavior must be marked as a hypothesis in data and in child-facing
language; this first release should prefer direct anatomical and time-period evidence
instead.

## Source and asset policy

The first content pass may use these independent institutional references:

1. Natural History Museum, London, `Triceratops` dinosaur directory:
   `https://www.nhm.ac.uk/discover/dino-directory/triceratops.html`
2. American Museum of Natural History, `Dinosaur Facts`:
   `https://www.amnh.org/dinosaurs/dinosaur-facts`
3. Smithsonian National Museum of Natural History, `The Last American Dinosaurs`:
   `https://naturalhistory.si.edu/exhibits/last-american-dinosaurs-discovering-lost-world`

They support a deliberately narrow candidate set: the name and visible anatomy, a
plant-eating diet, four-legged movement, and life near the end of the Late Cretaceous. Each
selected claim records the exact heading used and a short explanation of how that section
supports the wording. If the referenced section changes or disappears, the claim returns
to human review rather than silently inheriting support from the rest of the page. Gate 3
will select exact facts and wording. We paraphrase facts rather than copy museum text, and
do not reuse museum images.

The exhibit illustration is new DUN content under CC BY-SA 4.0. Its credit and license are
stored beside the exhibit data and included in the visible source/credit section. Generated
imagery is not treated as scientific evidence: source references govern the factual text.
The visual brief uses an abstract museum backdrop rather than asserting a precise habitat.
A human anatomy checklist is limited to features the selected references visibly support:
three facial horns, frill, beak, four limbs, non-upright tail, and plausible body balance.
If the references do not allow a reviewer to check a listed feature confidently, that
detail is simplified or the asset is rejected; the reviewer does not guess.

## End-to-end flow

1. A visitor selects Triceratops from the museum entrance.
2. The browser requests `/exhibits/triceratops`.
3. The server route imports the typed, repository-owned exhibit content and renders it to
   HTML.
4. The browser loads the local illustration and scoped stylesheet from the same origin.
5. The pair reads the first observation invitation. Optional fact panels open only after a
   person activates their native disclosure control.
   Chinese leads each content pair and concise English follows as identified secondary text;
   both remain visible without a language interaction.
6. The closing prompt points the pair off-screen; a normal link returns to the entrance.
7. If the grown-up opens the source panel, external institutional pages open explicitly;
   nothing is fetched in the background.

## External dependencies

No new package or hosted service is required. React, vinext, semantic HTML, scoped CSS, and
the existing Cloudflare-compatible worker are sufficient. Avoiding an interaction library,
CMS, database, analytics tool, and 3D engine keeps the first exhibit inspectable and avoids
collecting data from children.

## Load-bearing paths

- `content/**`: new educational claims, translations, source references, and media credit.
- `public/media/**`: new child-facing illustration.
- `package.json`: one script-only change makes new test files part of the real gate.
- A new test file is permitted, but educational content and media still require Deep gates
  and a human read.

No existing test, dependency version, lockfile, worker, factory policy, workflow, or license
file is planned to change. Any implementation that discovers it must touch one of those
paths stops and returns to the maintainer.

## Delivery budget imposed by the charter

This architecture must not be handed to implementation as one large issue. Gate 4 will
divide it into at least a tracer route and a real-content replacement so that every queue
item changes at most five files and no more than 300 lines. Each handoff states its expected
files and line budget. If a slice approaches either limit, the run stops and returns to
specification; it does not compress tests, provenance, accessibility, or CSS to stay under
the number.

The tracer slice's test covers only route behavior that all later slices must preserve.
Later slices do not edit that now-existing test; they add new content-integrity and
accessibility test files for their own behavior. If a later requirement proves the stable
route contract wrong, that is a human-approved spec change rather than an unattended test
rewrite.

## Failure and blast-radius analysis

- **Incorrect or overstated science:** constrained by explicit per-fact sources, section
  locators, claim-to-evidence support notes, an uncertainty field, a small fact set, and
  human review. A source becoming unavailable does not break the page because content is
  local, but it invalidates that fact's review status and creates a maintenance task.
- **Misleading illustration:** a generated animal may look friendly yet encode anatomical
  mistakes. A human must compare horns, frill, posture, limbs, and visible environment with
  the selected institutional sources before accepting the asset.
- **Translation drift:** Chinese and English live in the same object and are reviewed as one
  claim. Chinese is always primary and concise English is always visible as explicitly
  marked secondary text, so no preference state can drift. Neither version may introduce
  information absent from the other without its own source.
- **Lobby regression:** only links and focus behavior change; the existing entrance test
  stays intact and the new test verifies the route connection.
- **Test-discovery regression:** changing the command could accidentally omit the existing
  suite or discover unrelated files. The setup slice proves the original entrance test runs
  before and after the change, keeps all project tests under `tests/` with `*.test.mjs`
  names, and runs full gates.
- **CSS leakage:** exhibit styles are route-scoped; global changes are limited and require
  checks on the entrance build.
- **Accessibility regression:** the route uses headings, figure/alt text, native links and
  disclosure controls, visible focus, large targets, and reduced-motion rules. Essential
  information cannot depend on color, hover, animation, or sound.
- **Privacy regression:** there is no runtime third-party request, persistence, identity,
  telemetry, or embedded media. The existing architecture gate continues rejecting known
  tracking integrations and autoplay.
- **Premature abstraction:** only one exhibit exists. The typed shape captures provenance
  invariants, but layout remains concrete until a second exhibit supplies real reuse
  pressure.
