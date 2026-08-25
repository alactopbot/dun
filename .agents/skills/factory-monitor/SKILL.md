---
name: factory-monitor
description: Recover and inspect the live Factory workflow across GitHub Issues, deterministic branches, pull requests, review transitions, Patterns, Checks, and verification evidence. Use for scheduled health sweeps or stalled work; do not implement product changes or alter Pattern authority.
---

# Factory monitor

Monitoring makes an interrupted run recoverable without treating chat history or repository journals as state.

## Inspect live state

Read open Factory-labelled Issues, trusted handoffs, deterministic `issue/<number>` branches, unique linked
pull requests, Draft/Ready transitions, review comments, Checks, verification markers, ordinary Specs, and selected
Patterns. For each active Issue branch, run `./.factory/scripts/sync-default-branch.sh --check <issue-number>` from a clean
checkout. For each linked PR, run `node .factory/scripts/validate-pr-state.mjs --pr <number>` and route its stable
`route=` value instead of treating every red result as an authorization failure.

Report or route these conditions:

- Draft plan with new feedback → `factory-spec`;
- trusted Ready with no later drift → `factory-implement`;
- valid explicit Pattern waiting to run → `factory-implement` without fabricating a Ready event;
- `FACTORY_SYNC status=BEHIND` → `factory-implement` to perform the controlled default-branch sync, resolve ordinary
  conflicts, rerun Gates, and continue;
- `route=IMPLEMENTATION_REPAIR` → `factory-implement` on the same Issue branch and PR;
- `route=REVERIFY_REQUIRED` → treat the old verdict and its PR label as stale, keep the Issue in `factory:in-progress`,
  and dispatch a fresh independent `factory-verify` run for the current head without requesting another Ready event;
- `route=VERIFICATION_PENDING` → dispatch independent verification for the current head;
- `in-progress` with no branch or pull request → inconsistent state;
- claim branch without a pull request or recent activity → possible stale claim requiring human recovery;
- `awaiting-review` without current-SHA green Gate evidence, green PR state validation, or configured project CI →
  incomplete delivery;
- waiting work beyond the charter's back-pressure threshold → human bottleneck.

Repair only unambiguous state-label drift that does not change product or authorization decisions. A rejected or verified
label whose trusted verdict SHA differs from the current head is stale workflow state, not a current product verdict.
An orphan verdict label without trusted SHA-bound evidence is also recoverable label drift. Remove stale or orphan PR
verdict labels before dispatching the new verifier, preserve the trusted Ready transition, and run
`./.factory/scripts/set-issue-state.sh <issue-number> in-progress` if the Issue still displays an older delivery state. Never
delete or take over a claim branch, create or widen a Pattern, implement a finding, merge, or publish.

Use `factory:needs-info` only for a decision that can change the approved result: unclear trusted authorization, a Spec
change, a product tradeoff in a merge conflict, or an unrecoverable ambiguity about the default or Issue branch. Ordinary
conflicts, a dirty checkout, fetch or hook failures, a stale verdict SHA, and missing optional platform metadata are
recoverable workflow findings; route them to the responsible skill with their stable reason instead of asking the user.

A trusted Ready transition makes replacing `factory:wait-to-implement` with `factory:ready-to-implement` on the Issue an
unambiguous repair. Do not perform it without a current, trusted Ready transition. For this or any other unambiguous state
repair, run `./.factory/scripts/set-issue-state.sh <issue-number> <state>`; never add or remove Factory state labels directly.
