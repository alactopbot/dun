# Gate 3 · Program design

No implementation code belongs in this document. Signatures define contracts; values and
rendering remain for approved implementation slices.

## Exact file map

### Modified

- `package.json`
  - Change only `scripts.test` from the hard-coded entrance test to build followed by
    `node --test` standard discovery.
  - Do not change dependencies, versions, or any other script.
- `app/page.tsx`
  - Add a normal link from the existing Triceratops specimen/land-room experience to
    `/exhibits/triceratops`.
  - Preserve the current sections, copy, CSS illustration, and navigation IDs.

### New

- `app/exhibits/triceratops/page.tsx`
  - Route metadata and the concrete server-rendered exhibit page.
  - No client directive, state, effect, event handler, fetch, cookie, or storage call.
- `app/exhibits/triceratops/page.module.css`
  - Route-scoped desktop/mobile layout, bilingual hierarchy, disclosure styling, focus
    states, large touch targets, print-safe basics, and reduced-motion behavior.
- `content/exhibits/triceratops.ts`
  - All types, source records, bilingual prompts/facts, media credit, the single exhibit
    value, and its synchronous invariant check. Do not create a generic content framework.
- `public/media/triceratops/exhibit.webp`
  - One original, human-reviewed Triceratops reconstruction with an abstract museum
    backdrop; no embedded text, logos, watermark, combat, or habitat claim.
- `tests/triceratops-route.test.mjs`
  - Stable navigation and route contract established by the tracer slice.
- `tests/triceratops-content.test.mjs`
  - Final rendered content, provenance, media, bilingual, privacy, and safety contract.
- `tests/triceratops-style.test.mjs`
  - Route-scoped accessibility/responsiveness style contract for the final visual slice.

### Explicitly unchanged

- `tests/rendered-html.test.mjs`
- `app/layout.tsx`, `app/globals.css`
- `package-lock.json`
- `worker/**`, `.openai/**`
- All Factory policy, scripts, skills, and hooks
- `LICENSE`, `CONTENT-LICENSE.md`, and the existing social card

Any implementation that needs an unlisted file stops and returns to specification.

## Type and data contracts

All declarations below live in `content/exhibits/triceratops.ts`. They describe the public
shape without prescribing implementation.

```ts
export type LocalizedText = Readonly<{
  zh: string;
  en: string;
}>;

export type EvidenceLevel =
  | "fossil-evidence"
  | "scientific-consensus"
  | "hypothesis";

export type SourceReference<Id extends string = string> = Readonly<{
  id: Id;
  title: string;
  publisher: string;
  url: `https://${string}`;
  accessedOn: `${number}-${number}-${number}`;
  locator: string;
  supports: string;
}>;

export declare const triceratopsSources: readonly [
  SourceReference<"nhm-triceratops">,
  SourceReference<"amnh-dinosaur-facts">,
  SourceReference<"smithsonian-last-american-dinosaurs">,
];

export type TriceratopsSourceId =
  (typeof triceratopsSources)[number]["id"];

export type ExhibitFact = Readonly<{
  id: string;
  text: LocalizedText;
  sourceIds: readonly TriceratopsSourceId[];
  evidence: EvidenceLevel;
}>;

export type ObservationPrompt = Readonly<{
  id: string;
  prompt: LocalizedText;
  adultNote?: LocalizedText;
}>;

export type MediaCredit = Readonly<{
  path: `/media/${string}`;
  width: number;
  height: number;
  alt: LocalizedText;
  creator: string;
  license: "CC-BY-SA-4.0";
  source?: `https://${string}`;
}>;

export type TriceratopsExhibit = Readonly<{
  slug: "triceratops";
  name: LocalizedText;
  scientificName: "Triceratops";
  introduction: LocalizedText;
  prompts: readonly [ObservationPrompt, ObservationPrompt, ObservationPrompt];
  facts: readonly [ExhibitFact, ExhibitFact, ExhibitFact];
  closingPrompt: ObservationPrompt;
  sources: typeof triceratopsSources;
  media: readonly [MediaCredit];
}>;

export declare function validateTriceratopsExhibit(
  exhibit: TriceratopsExhibit,
): readonly string[];

export declare const triceratopsExhibit: TriceratopsExhibit;
```

The module validates `triceratopsExhibit` synchronously when imported. Any returned error
causes module evaluation—and therefore typecheck/build/test—to fail with one joined,
readable message. Validation covers:

- non-empty Chinese and English fields
- unique source, fact, prompt, and media IDs/paths
- HTTPS sources with access date, locator, and support note
- at least one valid source per fact and no dangling source ID
- exactly three prompts, three facts, and one media item
- positive intrinsic media dimensions and CC BY-SA 4.0 credit
- no fact labeled `hypothesis` in this first release

## Approved content contract

Exact editorial punctuation may change during human copy review, but an implementation may
not add claims beyond these propositions.

| ID | Chinese proposition | Concise English proposition | Evidence and sources |
|---|---|---|---|
| `three-horned-face` | “三角龙”的名字意为“三只角的脸”；头上有三只角和一圈大颈盾。 | The name means “three-horned face”; it had three facial horns and a large frill. | fossil-evidence; NHM `Name meaning` and introductory anatomy |
| `plant-eater` | 三角龙吃植物；喙和后排牙齿帮助剪下、切碎植物。 | Triceratops ate plants; its beak and back teeth helped cut plant material. | fossil-evidence; NHM `What did Triceratops eat?`, AMNH `Teeth, Footprints, and Feathers` |
| `four-legs-late-cretaceous` | 它用四条腿行走，生活在约 6800 万至 6600 万年前的晚白垩世。 | It walked on four legs and lived about 68–66 million years ago in the Late Cretaceous. | scientific-consensus; NHM directory summary, Smithsonian `A Glimpse Back in Time` |

Each `supports` note names only the proposition the located source supports. Chinese and
English express the same information; neither translation may introduce a stronger claim.

The three observation prompts are non-factual and unscored:

1. “你看到了哪些形状？” / “What shapes can you see?”
2. “它的身体哪里最特别？为什么？” / “Which part looks most special to you? Why?”
3. “如果能问它一个问题，你会问什么？” / “If you could ask it one question, what would you ask?”

The shared adult note is: “不用立刻告诉孩子答案。先听听孩子怎么说。” / “You do not
need to give the answer yet. Listen to what your child notices first.”

The closing prompt is: “离开屏幕后，找一找身边的圆形、尖角和扇形。” / “Away from
the screen, look for circles, points, and fan shapes around you.”

## Page contract

`app/exhibits/triceratops/page.tsx` exports:

```ts
export declare const metadata: Metadata;
export default function TriceratopsPage(): React.ReactElement;
```

The component renders one concrete page, in this order:

1. Skip link and museum header with a normal return link to `/`.
2. Exhibit heading: Chinese name first, scientific name in an English-language element.
3. Figure using the same-origin media record, Chinese alt text, intrinsic dimensions, and
   a visible “复原想象 / artist's reconstruction” caption.
4. Introduction inviting observation before reading.
5. Three prompt cards, followed by the adult note.
6. Three closed native `<details>` elements, one per sourced fact. Summaries are invitations,
   not quiz questions; opening one never changes another.
7. One closed source-and-credit `<details>` section listing all institutions, exact source
   titles, access dates, and the DUN media license/credit.
8. Closing off-screen prompt and a normal return link to `/`.

Every English content fragment has `lang="en"`; visual hierarchy makes it secondary.
External source links use `target="_blank"` and `rel="noreferrer"`. Essential content is
not communicated through animation, color, hover, or the generated illustration alone.

## Main call stack

### Navigation and render

```text
visitor activates the Triceratops link on GET /
  -> browser requests GET /exhibits/triceratops
  -> worker passes the request to the vinext app router
  -> TriceratopsPage module imports content/exhibits/triceratops.ts
  -> content module constructs and synchronously validates triceratopsExhibit
  -> validation failure throws during build/server render and blocks the gate
  -> TriceratopsPage maps the validated value to semantic server-rendered HTML
  -> same-origin stylesheet and exhibit.webp are loaded
```

### Fact reveal

```text
visitor activates a native details summary
  -> browser toggles that one details element
  -> no React hydration, network request, persistence, telemetry, or audio occurs
```

### Source visit

```text
grown-up opens the source-and-credit disclosure
  -> activates one explicit external source link
  -> browser opens the institutional page in a new tab without referrer information
```

## Test list and proof

### Existing entrance test

`tests/rendered-html.test.mjs` remains byte-for-byte unchanged. Running `node --test`
must still discover and pass it, proving the test-script amendment did not drop the
original safety net.

### Stable route test

`tests/triceratops-route.test.mjs` builds/imports the worker and requests both `/` and
`/exhibits/triceratops`. It proves:

- the entrance contains a real link to the exhibit
- the exhibit responds `200` with HTML and its own title and primary heading
- the exhibit has a return link, one figure, three prompt items, three fact disclosures,
  one source/credit disclosure, and a closing section
- English fragments are explicitly language-marked
- no audio, video, autoplay, form, account prompt, score/reward terms, or tracking marker
  appears in rendered HTML

This test fails before the tracer route and link exist. It intentionally does not assert
temporary wording, placeholder imagery, or final facts, so later slices never need to edit
it.

### Final content test

`tests/triceratops-content.test.mjs` requests the final route and proves:

- all three approved Chinese and English propositions render
- every fact renders at least one link to its declared institutional source
- source titles, publishers, locators/access dates, and DUN media credit render
- the illustration is same-origin, has non-empty Chinese alt text and intrinsic dimensions,
  and is labeled as a reconstruction
- all source links use the required safe external-link attributes
- the final off-screen prompt renders and contains no screen-retention instruction
- the build-time content validator has not rejected the data

This test fails before real content and provenance replace the tracer placeholders. It is
added once and is not edited by later unattended work.

### Gate expectations

- Setup and tracer work run `full`; anything touching `content/**`, `public/media/**`, or
  `package.json` runs `deep` and requires a human read.
- Deep architecture rules continue to reject autoplay and known tracking integrations.
- The verifier proves the new test fails when its corresponding implementation is removed,
  without editing an existing test.

### Final style contract test

`tests/triceratops-style.test.mjs` reads only the route-scoped stylesheet and proves it
contains the approved non-visual safety invariants:

- a visible `:focus-visible` treatment
- a minimum 44px target dimension for links and disclosure summaries
- a narrow-screen responsive rule
- a `prefers-reduced-motion: reduce` rule that removes non-essential transitions/motion
- a distinct secondary treatment for English text that does not hide it
- no remote URL, animation loop, or viewport-locking rule

This is not a screenshot or pixel-perfect test. It exists so the final styling slice has a
negative proof: reverting the accessibility/responsiveness stylesheet makes this test fail,
while harmless visual refinements remain reviewable by a human.

## Three decisions with the least confidence

1. **Always-visible bilingual text may still be too dense.** It avoids state and makes both
   languages available, but only observation with real parent-child pairs can show whether
   the smaller English line distracts a 2–6-year-old. The first usability check must ask
   specifically about this.
2. **Native disclosure controls may vary visually across browsers.** `<details>` is the
   simplest accessible no-JavaScript behavior, but target size, marker appearance, and
   discoverability need a human touch/keyboard check before the PR leaves draft state.
3. **The illustration review is informed, not expert certification.** The bounded anatomy
   checklist catches obvious errors, but no paleontologist is currently named as reviewer.
   The page must label the image as a reconstruction and avoid behavioral or habitat claims;
   any disputed detail returns the media slice to human review.
