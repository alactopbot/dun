---
name: factory-implement
description: Recover or atomically claim one executable GitHub Issue, implement the complete product outcome, run fail-closed gates, obtain independent verification, and deliver one verified pull request. Use after an ordinary Spec is Ready or when an explicitly enabled Pattern is selected.
---

# Factory implementation

Implement exactly one complete requirement per run. Finishing an internal step does not justify another Issue, branch,
pull request, or approval gate.

## Establish authority

Read `AGENTS.md`, the contract, charter, complete Issue discussion, trusted handoff, current labels, linked pull
requests, Checks, and either the approved `design.md` or the explicitly selected Pattern.

- Ordinary path: require a trusted Ready transition. Ready authorizes continuation but is not bound to event commit
  metadata; the current Spec and complete diff remain the implementation authority. A later change requires a new Draft
  cycle only when it changes the authorized product outcome or expands scope.
- Pattern path: require one activation label, an enabled matching Pattern on the default branch, complete semantic match,
  and no expected governance-file changes.

When a trusted Ready transition authorizes an ordinary requirement, replace the Issue's previous Factory state label with
`factory:in-progress` when implementation starts by running:

```bash
./.factory/scripts/set-issue-state.sh <issue-number> in-progress
```

This transition is mechanical state normalization, not another approval decision. Finish all authority and missing-decision
checks first; do not create a transient `in-progress` state when the correct destination is already `needs-info`.

Recover an existing deterministic branch or unique pull request. If neither exists, claim before writing:

```bash
./.factory/scripts/claim.sh <issue-number> <unique-run-id>
```

Only `CLAIMED` may create new work. `EXISTS` or `LOST` means another run owns the same Issue; recover its branch/PR or
stop. After a successful claim and completed preflight, use the state script above to replace the previous Factory state
label with `factory:in-progress`. Never add or remove Factory state labels directly.

Before implementation starts, resumes, or requests re-verification, check whether GitHub's actual default branch has
advanced:

```bash
./.factory/scripts/sync-default-branch.sh --check <issue-number>
```

`UP_TO_DATE` needs no action. `BEHIND` must be followed by the same command without `--check`; this is the only permitted
path for merging a branch into an Issue branch. The script verifies the exact `issue/<number>` branch, a clean worktree,
the `origin` remote, and the default branch reported by GitHub before fetching and merging only
`origin/<default-branch>`. After `SYNCED`, rerun the selected Gate. A `CONFLICT` is recoverable: resolve ordinary code
conflicts, use `git merge --continue`, and rerun the Gate. Use `git merge --abort` or `--quit` when recovery requires
returning to the pre-sync state. Ask for product input only when the conflict makes approved scope, behavior, or a
historical product decision ambiguous. Dirty worktrees, fetch failures, hook diagnostics, and ordinary conflicts do not
by themselves authorize `factory:needs-info`.

## Implement the outcome

Re-read `done_when` as the stopping condition. Establish a test or equivalent artifact that fails on the old behavior,
then make the smallest complete change that satisfies the approved outcome. Avoid unrelated cleanup and abstractions.

Stay within the ordinary Spec or Pattern authorization. A new dependency, changed existing-test semantics, new
load-bearing path, product decision, or scope expansion returns an ordinary requirement to the same Draft PR. A Pattern
that does not fit must stop and enter the ordinary Spec path; it cannot authorize Factory governance changes.

## Gates and evidence

Run the gate level selected by the Pattern and charter:

```bash
./.factory/scripts/gates.sh <fast|full|deep>
```

A required skip, red result, or `MISCONFIGURED` result blocks delivery. Keep the pull request body current with the
completed result, material risk, exact Gate verdict, and links to verification evidence.

## Independent verification

Hand the Issue, authority source, base revision, current head, and complete diff to a fresh independent Agent context.
Do not provide the implementer's persuasive summary. The verifier follows `factory-verify` and reaches its own verdict.

Every verdict is bound to its `verified_sha`. Fix a substantive rejection on the same branch and PR, rerun Gates, and
request a fresh independent verification. Once the fix produces a new head, the old rejection is stale: keep the existing
trusted Ready authorization, normalize the Issue to `factory:in-progress`, and route the new SHA to a fresh verifier. Do
not leave the new head blocked by `factory:rejected` and do not ask the user to repeat Ready. Stop after the same problem
rejects the same current head twice and cannot be repaired without changing the Spec. Validator metadata incompatibility,
unavailable optional platform capabilities, stale-label cleanup, default-branch synchronization, and other workflow
recovery diagnostics do not consume this limit. Any commit after acceptance likewise makes the verification stale and
requires a new independent verdict.

## Complete the run

When the current full SHA has accepted verification with a green Gate verdict, `factory:verified` is present,
`factory:rejected` is absent, and the external PR state validator is green, set the Issue to `factory:awaiting-review`.
Project CI must also be green when the repository configures it. The pull request explains the result, risk, tests, and
evidence. Stop without merging or publishing; merge is the human product-acceptance decision.
