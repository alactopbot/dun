# DUN · 史前动物博物馆

DUN is an open-source, calm prehistoric-animal museum for children ages 2–6 and
their grown-ups. It is greenfield software: no users depend on it yet, but its
educational claims, child-safety principles, accessibility, and asset licenses
require deliberate human review.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
./.claude/scripts/gates.sh fast
./.claude/scripts/gates.sh full   # the factory's deterministic verdict
```

## Conventions

- TypeScript, React 19, vinext, and CSS live under `app/`; the Cloudflare entry is `worker/`.
- Prefer semantic server-rendered HTML and CSS. Add client JavaScript only for a named interaction.
- Design for a child and grown-up together: calm pacing, large targets, plain language, and reduced motion.
- Never add autoplay, ads, engagement ranking, behavioral tracking, or child profiling.
- Do not invent scientific claims or reuse external text/media. Record sources and licenses before adding content.
- Keep each Issue to one vertical slice and avoid dependencies unless the approved spec requires one.

---

# Factory rules

This repository runs a software factory. Read `docs/factory/CONTRACT.md`, then
`docs/factory/CHARTER.md`, before acting. The contract is shared with Codex through
`AGENTS.md`; it is the source of truth for queue semantics and non-negotiable rules.
For first-time setup and the local dry run, follow `docs/factory/README.md`.

## Read first

The live queue is GitHub issue labels plus `factory-handoff:v1` comments.
`docs/factory/QUEUE.md` is a snapshot for humans and audit, so an unmerged snapshot must
never be used as the handoff between routines.

## Non-negotiable

1. **Never merge.** GitHub branch protection is the enforcement boundary; the local hook is
   a second layer.
2. **Never edit factory policy** unless the human explicitly asks in this session. Protected
   paths are listed in the contract.
3. **Never modify an existing test in an unattended run.** An interactive change needs
   explicit human approval and a human read.
4. **Gates fail closed.** Quote the `FACTORY_GATES:` line verbatim. `RED`,
   `MISCONFIGURED`, and required skips all block progress.
5. **Verification uses a fresh context.** Delegate to `factory-verifier`.
6. **Claim one live issue per run.** Win the deterministic remote-branch claim described in
   the contract, then replace `factory:ready-to-implement` with `factory:in-progress`.

## Stopping conditions

Stop and hand back to a human when any of these is true:

- gates went red twice on the same item
- the work turns out to touch a `LOAD_BEARING` path
- the diff would exceed the charter's line limit
- the item is still ambiguous after one clarification attempt
- the review queue is already at the charter's limit

The last one is the important one and the easiest to ignore. The constraint on this factory
is not how many agents can run in parallel. It is how many decisions are pending a human's
judgment at once. When that queue is full, producing more is not progress.

## State lives in files, not conversations

Write one immutable record under `docs/factory/runs/` using its documented format. Update
GitHub labels for operational state. Sessions end and transcripts are not the queue.

## Writing for the next reader

Commit messages and PR bodies are written for someone who was not in this session and
cannot ask you what you were thinking. On a `client-production` repo, assume that reader is
not the author and the time is six months from now.
