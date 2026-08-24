---
name: factory-implement
description: 从可信 Factory V2 交接恢复并完成一个完整需求，校验 GitHub PR Gate，按内部工作单元测试驱动实现、独立验证，并持续复用唯一中文 Draft PR。
---

# Factory 实现

一次运行只推进一个完整需求。读取契约、章程、项目配置、适用 Pattern、需求设计、Issue、唯一
Draft PR 和最新可信 `factory-handoff:v2` 后再行动。Agent 会话不是状态来源。

## 选择与恢复

通常选择 `factory:ready-to-implement` 的开放 Issue。若需求已有分支与 PR，验证它们属于同一 Issue，
运行 `.factory/scripts/validate-pr-gates.mjs` 所定义的同等检查，校验 `review_pr`、分支头 SHA、原始
评论来源、批准者权限与所需 `factory-gate:v2`，然后复用已有 Draft PR。技术方案
Gate 绑定设计提交；实现提交本身不会使它失效，但设计、Pattern、允许路径、依赖或测试授权变化会
使它失效，此时回到同一 PR 请求重新评审。

没有前置人工 Gate 的 `trusted` 需求才从最新默认分支建立确定性远端分支，以首次无强推 push 完成
认领。已有 `factory:in-progress` 的需求不得重复认领。`factory:awaiting-review` 只有在同一 PR 已出现
有效产品验收 Gate 时，才能由恢复运行进入最终证据步骤。

开始实现时把 Issue 设为 `factory:in-progress`。无法安全恢复或 Gate 证据有歧义时停止并在 GitHub
报告，不把聊天回复当作流程决定。

## 执行完整需求

按设计中的内部 work units 顺序推进：

1. 先增加或运行能在旧行为上失败的测试或等价证据。
2. 实现让该证据通过的最小完整行为。
3. 运行相关检查，提交可恢复的语义节点并推送同一分支。
4. 继续下一个工作单元，直到完整产品验收标准成立。

内部工作单元不产生额外 Issue、分支、PR 或人工 Gate。执行较长时依靠提交、测试和 PR checklist
恢复上下文，不缩减完整需求。

## 变更控制

- 所有修改服务于 `done_when`，并位于允许路径或 GitHub 已批准方案内。
- 保持 Pattern 的全部不变量。
- 既有测试只能由已批准技术方案或专门的 GitHub Gate 授权。
- 新依赖、未经批准的承重路径、Pattern 外产品变化或架构决定回到同一 PR 请求新 Gate。
- 范围根据语义、风险和证据判断，不用变更数量替代判断。

## 候选交付与独立验证

先运行相关快速检查，完整需求结束时运行交接规定等级的 Gate。缺失、跳过或配置错误都不算绿色；
同一需求连续两次失败则停止并在 GitHub 报告两次不同尝试的证据。

Gate 绿色后写唯一候选 `delivery.md`，其中 `outcome`、`verifier` 和 `eligible_clean_run` 均为
`pending`。推送同一分支。监督或启动模式继续使用方案阶段的 PR；没有前置 PR 的可信模式此时
创建唯一中文 Draft PR。PR 明确写“独立验证待完成”，此时不写最终 Issue 交付评论。

随后启动全新上下文的验证器，冷读 Issue、可信交接、所有 GitHub Gate、Pattern、设计、Draft PR、
完整 diff 和测试输出。实现者不能提示验证器接受，也不能自行替代验证器。拒绝时按意见修正并重新
执行 Gate 与完整验证；连续两次拒绝则停止。

## 产品验收与最终证据

验证器接受候选后：

1. 若 Pattern 要求 `product-acceptance`，给同一 PR 加 `factory:product-review`，把 Issue 设为
   `factory:awaiting-review`，等待可信 GitHub 人类决定绑定当前候选 SHA，然后结束本次运行。
2. 后续运行核对批准者权限、候选 SHA 与其后 diff；产品、测试或策略发生变化时 Gate 失效并重新验证。
3. 产品验收不需要，或有效 Gate 已存在时，只更新同一 `delivery.md` 的验证结果、Pattern 资格和完成
   时间，不夹带产品、测试或策略变化。
4. 推送证据提交，由原验证上下文确认转录准确，发布绑定新头的 `factory-verification:v2`，重新
   触发并确认 PR Check 最终绿色。
5. 创建或更新一条最终 Issue 评论：

```text
<!-- factory-delivery:v2 -->
requirement: REQ-<issue-number>
outcome: clean | corrected | rejected
pattern: <pattern-id | new>
pattern_version: <number | pending>
gates: <等级与最终状态>
verifier: accepted | rejected
human_plan_change: true | false
human_product_change: true | false
eligible_clean_run: true | false
completed_at: <UTC timestamp>
```

只有全程未被人工纠正、未越界、Gate 全绿且独立验证接受，才计入连续干净执行。最终仍保持 Draft；
Agent 不转 Ready、不合并，合并由人类在 GitHub 决定。
