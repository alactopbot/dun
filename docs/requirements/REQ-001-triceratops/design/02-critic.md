# Gate 2 · Independent critic

## Original verdict

```text
position: concerns
strongest_objection: The provenance model records only a source title, publisher, URL, and access date, yet the proposed institutional pages are broad and mutable; sourceIds can show that a fact points somewhere without showing which passage or evidence actually supports the exact bilingual claim, so later scientific review cannot reliably distinguish supported wording from an overstatement.
assumptions_introduced:
  - The proposed institutional pages directly support every eventual Triceratops claim; if a page is generic, changes, or supports only part of a sentence, the per-fact citation appears valid while the educational claim is not auditable.
  - TypeScript data will guarantee that every sourceId resolves to an exhibit source, but the conceptual types do not specify a literal-key relationship, constructor, or validation test; plain string identifiers allow dangling references while type checking remains green.
  - The implementation will remain below the charter's 300-line stop limit, although it plans a route, scoped stylesheet, typed content, illustration and credit, new test, and entrance changes; if ordinary CSS and bilingual content exceed that budget, implementation must stop after the architecture has already been approved.
  - A human can perform an adequate anatomy review from the three named web references; if they do not provide clear views or current reconstruction guidance for horns, frill, limbs, posture, and environment, the required media review has no defined evidence base.
maintainability_cost: Future reviewers must reopen changing external pages and reconstruct why each Chinese and English sentence was considered supported; they also need to remember an unwritten identifier-validation convention and may have to rescope the slice when the charter line limit is encountered.
simpler_alternative: Add a short per-source locator/support note and a build-time referential-integrity assertion, then state an explicit file and changed-line budget before Gate 2 approval.
would_a_stranger_understand: no (the architecture does not preserve the exact evidence-to-claim reasoning, define how source references are validated, or show that the planned slice fits the charter's implementation-size limit)
```

## Resolution in the revised architecture

- Each source now records an exact heading locator and a claim-to-evidence support note.
- Valid source IDs are derived from the literal source collection and checked again by a
  build-time referential-integrity assertion.
- Gate 4 must create multiple implementation slices, each capped at five files and 300
  changed lines; evidence and accessibility cannot be cut to meet the cap.
- The illustration uses an abstract backdrop and a bounded anatomy checklist. Unsupported
  visual detail is simplified or rejected rather than inferred.

## Re-review verdict

```text
position: concerns
strongest_objection: The four original concerns are materially resolved, but the architecture still defines bilingual LocalizedText without defining how a visitor receives it. Rendering both languages together may undermine the calm, short visit; rendering only one leaves the selection rule unspecified; adding a language control may introduce client state, URL behavior, or accessibility requirements that the architecture currently excludes.
assumptions_introduced:
  - The exact source locator and support note will remain sufficient for later claim review; this is now a reasonable, explicit assumption, and source changes correctly return the claim to human review.
  - Literal-derived source IDs plus the build-time assertion will enforce referential integrity; the original dangling-reference concern is materially resolved.
  - Gate 4 can split delivery without forcing a later unattended slice to modify a test created by an earlier slice; if the tracer test encodes temporary content rather than stable route behavior, the test-file rule will block replacement.
  - The bounded anatomy checklist and rejection rule provide enough evidence for visual review; the original unsupported-anatomy concern is materially resolved.
maintainability_cost: Until language presentation is decided, route markup, metadata, tests, content usage, and accessibility behavior cannot be specified consistently; an implementation choice made implicitly will become the convention for every later exhibit.
simpler_alternative: Specify now that the first route presents Chinese as the primary interface with concise English paired in explicitly identified secondary text, requiring no toggle or client state, and make the tracer test assert only stable route semantics.
would_a_stranger_understand: no (the provenance, validation, delivery-budget, and anatomy-review decisions are now clear, but the architecture still does not explain how its bilingual content is rendered or how multi-slice testing remains compatible with the load-bearing test rule)
```

## Re-review resolution

- Chinese is now explicitly primary, with concise English always visible as marked
  secondary text; there is no language state or toggle.
- The tracer test is restricted to permanent route semantics. Later content slices add new
  tests and do not modify the tracer test.

## Final verdict after revisions

```text
position: no-objection
strongest_objection: none
assumptions_introduced: []
maintainability_cost: none material
simpler_alternative: none
would_a_stranger_understand: yes
```

## Gate 3 discovery and proposed amendment

Exact file inspection found that `npm test` names only `tests/rendered-html.test.mjs`.
Therefore the approved plan to add tests without editing the existing test would create
files that the Factory gate never runs. The architecture now proposes one load-bearing,
script-only `package.json` change: preserve the build step and invoke `node --test` with
standard discovery. No dependency or lockfile changes are allowed. Local proof confirmed
that discovery executes the existing entrance test successfully.

### Independent amendment verdict

```text
position: no-objection
strongest_objection: none
assumptions_introduced:
  - Project tests continue using Node's standard discoverable test naming; if a future test uses a nonstandard filename, node --test will not execute it.
maintainability_cost: none material
simpler_alternative: none
would_a_stranger_understand: yes
```
