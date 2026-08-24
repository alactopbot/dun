#!/usr/bin/env bash
# Preview or create the labels used as the factory's live queue.

set -euo pipefail

APPLY=0
[ "${1:-}" = "--apply" ] && APPLY=1

command -v gh >/dev/null 2>&1 || {
  echo "error: gh is required to inspect or create factory labels" >&2
  exit 2
}
gh auth status >/dev/null 2>&1 || {
  echo "error: gh is not authenticated" >&2
  exit 2
}

labels=(
  "factory:ready-to-implement|0E8A16|前置 Gate 已满足，可以执行"
  "factory:ready-to-spec|FBCA04|需要形成产品或技术方案"
  "factory:needs-info|D93F0B|等待一个明确问题的答案"
  "factory:wait-to-implement|C5DEF5|等待 GitHub Gate 或明确依赖"
  "factory:in-progress|1D76DB|需求分支正在实现或验证"
  "factory:awaiting-review|5319E7|Draft PR 等待产品验收或合并"
  "factory:verified|0E8A16|独立验证已接受"
  "factory:rejected|B60205|独立验证发现阻塞项"
  "factory:monitor|BFDADC|由 Factory 巡检创建"
  "factory:plan-review|7057FF|Draft PR 等待 GitHub 技术方案确认"
  "factory:product-review|D876E3|Draft PR 等待 GitHub 产品验收"
)

if [ "$APPLY" -eq 0 ]; then
  echo "将创建或更新以下标签："
  printf '  %s\n' "${labels[@]%%|*}"
  echo
  echo "确认后使用 --apply 执行。"
  exit 0
fi

for entry in "${labels[@]}"; do
  IFS='|' read -r name color description <<< "$entry"
  gh label create "$name" --color "$color" --description "$description" --force
done

echo "Factory 标签已就绪。"
