#!/usr/bin/env bash
# Check whether the installed factory has enough configuration to run safely.

set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT" || exit 2

failures=0
warnings=0

pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; warnings=$((warnings + 1)); }
fail() { printf 'FAIL  %s\n' "$1"; failures=$((failures + 1)); }

required_files=(
  CLAUDE.md
  AGENTS.md
  docs/factory/CONTRACT.md
  docs/factory/CHARTER.md
  .factory/project.json
  .factory/project.schema.json
  .factory/patterns/animal-exhibit-v1.json
  .factory/gates.conf
  .factory/scripts/prove-test.sh
  .factory/scripts/validate-pr-gates.mjs
  .claude/scripts/gates.sh
  .claude/settings.json
  .claude/hooks/block-merge.sh
)

for path in "${required_files[@]}"; do
  [ -f "$path" ] && pass "$path exists" || fail "$path is missing"
done

if command -v node >/dev/null 2>&1 \
  && node -e 'for (const path of process.argv.slice(1)) JSON.parse(require("node:fs").readFileSync(path, "utf8"))' \
    .factory/project.json .factory/project.schema.json .factory/patterns/animal-exhibit-v1.json; then
  pass "Factory V2 JSON 配置可解析"
else
  fail "Factory V2 JSON 配置无法解析"
fi

# install.sh never overwrites, so on a repo that already had .claude/settings.json
# the deny rules and the hook wiring can be absent while every file is present.
if [ -f .claude/settings.json ] && grep -q 'block-merge.sh' .claude/settings.json; then
  pass "block-merge hook is wired into .claude/settings.json"
else
  fail "block-merge.sh is not wired as a PreToolUse hook in .claude/settings.json"
fi

if [ -f .claude/hooks/block-merge.sh ] && [ ! -x .claude/hooks/block-merge.sh ]; then
  fail ".claude/hooks/block-merge.sh is not executable"
fi

missing_deny=0
for rule in 'docs/factory/CHARTER.md' '.factory/project.json' '.factory/patterns' '.factory/gates.conf' '.claude/scripts/gates.sh'; do
  grep -Fq "Edit($rule" .claude/settings.json 2>/dev/null || missing_deny=$((missing_deny + 1))
done
[ "$missing_deny" -eq 0 ] && pass "Factory 策略文件位于 Edit 拒绝列表" \
  || fail "$missing_deny 个 Factory 策略路径未加入 .claude/settings.json 的 Edit 拒绝列表"

if [ -f CLAUDE.md ] && grep -q '<PROJECT NAME>\|<install>\|<One paragraph:' CLAUDE.md; then
  fail "CLAUDE.md still contains setup placeholders"
else
  pass "CLAUDE.md placeholders replaced"
fi

if [ -f docs/factory/CHARTER.md ] && grep -q '^CHARTER_STATUS: ready$' docs/factory/CHARTER.md; then
  pass "charter is marked ready"
else
  fail "charter is not marked ready"
fi

if [ -f docs/factory/CHARTER.md ] && grep -q '^TIER: \(revival\|greenfield\|oss\|client-production\)$' docs/factory/CHARTER.md; then
  pass "charter tier is valid"
else
  fail "charter tier is missing or invalid"
fi

if git rev-parse --git-dir >/dev/null 2>&1; then
  pass "Git repository detected"
  if git remote get-url origin >/dev/null 2>&1; then pass "origin remote detected"; else warn "no origin remote"; fi
else
  fail "not a Git repository"
fi

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  pass "GitHub CLI authenticated"
  missing_labels=0
  factory_label_names="$(gh label list --repo alactopbot/dun --limit 100 --json name --jq '.[].name' 2>/dev/null)"
  for label in factory:ready-to-implement factory:ready-to-spec factory:needs-info factory:wait-to-implement factory:in-progress factory:awaiting-review factory:plan-review factory:product-review; do
    grep -Fxq "$label" <<<"$factory_label_names" || missing_labels=$((missing_labels + 1))
  done
  [ "$missing_labels" -eq 0 ] && pass "Factory Issue 与 PR 状态标签存在" || warn "$missing_labels 个 Factory 状态标签缺失；运行 ./.factory/scripts/bootstrap-github.sh --apply"
else
  warn "gh is unavailable or unauthenticated; live queue checks skipped"
fi

if [ -f .codex/hooks.json ]; then
  warn "Codex users must review and trust repo hooks with /hooks"
fi
warn "verify GitHub branch protection or a ruleset manually; see docs/factory/GITHUB.md"

printf '\nFACTORY_DOCTOR: failures=%d warnings=%d\n' "$failures" "$warnings"
[ "$failures" -eq 0 ]
