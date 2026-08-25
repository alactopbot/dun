#!/usr/bin/env bash
# Safely synchronize the GitHub default branch into one deterministic Issue branch.

set -euo pipefail

CHECK_ONLY=0
if [ "${1:-}" = "--check" ]; then
  CHECK_ONLY=1
  shift
fi
EXPECTED_ISSUE="${1:-}"

if [ "$#" -ne 1 ] || ! [[ "$EXPECTED_ISSUE" =~ ^[1-9][0-9]*$ ]]; then
  echo "usage: $0 [--check] <issue-number>" >&2
  exit 2
fi

result() {
  local status="$1" reason="$2" code="$3"
  shift 3
  printf 'FACTORY_SYNC: status=%s reason=%s' "$status" "$reason"
  while [ "$#" -gt 0 ]; do
    printf ' %s' "$1"
    shift
  done
  printf '\n'
  exit "$code"
}

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || \
  result MISCONFIGURED not-a-git-repository 2
cd "$ROOT"

CURRENT_BRANCH="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
case "$CURRENT_BRANCH" in
  issue/[1-9][0-9]*) ;;
  *) result MISCONFIGURED not-deterministic-issue-branch 2 "branch=${CURRENT_BRANCH:-detached}" ;;
esac
ISSUE="${CURRENT_BRANCH#issue/}"
if ! [[ "$ISSUE" =~ ^[1-9][0-9]*$ ]]; then
  result MISCONFIGURED not-deterministic-issue-branch 2 "branch=$CURRENT_BRANCH"
fi
if [ -n "$EXPECTED_ISSUE" ] && [ "$EXPECTED_ISSUE" != "$ISSUE" ]; then
  result MISCONFIGURED issue-branch-mismatch 2 "issue=$EXPECTED_ISSUE" "branch=$CURRENT_BRANCH"
fi

git remote get-url origin >/dev/null 2>&1 || \
  result MISCONFIGURED missing-origin 2 "issue=$ISSUE" "branch=$CURRENT_BRANCH"
command -v gh >/dev/null 2>&1 || \
  result MISCONFIGURED gh-unavailable 2 "issue=$ISSUE" "branch=$CURRENT_BRANCH"

DEFAULT_BRANCH="$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name' 2>/dev/null || true)"
if [ -z "$DEFAULT_BRANCH" ] || ! git check-ref-format --branch "$DEFAULT_BRANCH" >/dev/null 2>&1; then
  result MISCONFIGURED default-branch-undetermined 2 "issue=$ISSUE" "branch=$CURRENT_BRANCH"
fi
if [ "$CURRENT_BRANCH" = "$DEFAULT_BRANCH" ]; then
  result MISCONFIGURED issue-branch-is-default 2 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH"
fi

if git rev-parse --verify -q MERGE_HEAD >/dev/null 2>&1; then
  result RECOVERABLE merge-in-progress 3 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH"
fi
for operation in rebase-merge rebase-apply CHERRY_PICK_HEAD REVERT_HEAD; do
  operation_path="$(git rev-parse --git-path "$operation")"
  if [ -e "$operation_path" ]; then
    result RECOVERABLE git-operation-in-progress 3 "operation=$operation" "issue=$ISSUE" "branch=$CURRENT_BRANCH"
  fi
done
if [ -n "$(git status --porcelain --untracked-files=normal)" ]; then
  result RECOVERABLE working-tree-not-clean 3 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH"
fi

if ! git fetch --quiet origin "refs/heads/$DEFAULT_BRANCH:refs/remotes/origin/$DEFAULT_BRANCH"; then
  result RECOVERABLE fetch-failed 3 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH"
fi
REMOTE_REF="refs/remotes/origin/$DEFAULT_BRANCH"
DEFAULT_SHA="$(git rev-parse --verify "$REMOTE_REF^{commit}" 2>/dev/null || true)"
[ -n "$DEFAULT_SHA" ] || \
  result MISCONFIGURED default-ref-missing-after-fetch 2 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH"
HEAD_SHA="$(git rev-parse HEAD)"

if git merge-base --is-ancestor "$REMOTE_REF" HEAD; then
  result UP_TO_DATE none 0 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH" \
    "head_sha=$HEAD_SHA" "default_sha=$DEFAULT_SHA" "gate_required=false"
fi
if [ "$CHECK_ONLY" -eq 1 ]; then
  result BEHIND default-branch-ahead 3 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH" \
    "head_sha=$HEAD_SHA" "default_sha=$DEFAULT_SHA" "gate_required=true"
fi

set +e
git merge --no-edit "$REMOTE_REF"
MERGE_STATUS=$?
set -e
if [ "$MERGE_STATUS" -ne 0 ]; then
  if git rev-parse --verify -q MERGE_HEAD >/dev/null 2>&1; then
    result CONFLICT merge-conflict 3 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH" \
      "default_sha=$DEFAULT_SHA" "gate_required=true"
  fi
  result RECOVERABLE merge-failed 3 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH"
fi

NEW_HEAD_SHA="$(git rev-parse HEAD)"
result SYNCED none 0 "issue=$ISSUE" "branch=$CURRENT_BRANCH" "default=$DEFAULT_BRANCH" \
  "head_sha=$NEW_HEAD_SHA" "default_sha=$DEFAULT_SHA" "gate_required=true"
