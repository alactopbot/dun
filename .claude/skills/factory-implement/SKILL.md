---
name: factory-implement
description: 从可信 Factory V2 交接认领并完成一个完整需求，按内部工作单元测试驱动实现、独立验证，最后创建一个中文 Draft PR。用于执行 ready-to-implement 的 GitHub Issue。
---

# Factory 实现

一次运行只完成一个完整需求，并为它创建一个分支和一个 Draft PR。读取契约、章程、项目配置、
适用 Pattern、需求设计和最新可信 `factory-handoff:v2` 后再行动。

## 选择与认领

只选择 `factory:ready-to-implement` 且交接字段完整的开放 Issue。验证评论作者权限、Pattern 版本、
模式、人工 Gate、允许路径和所需 Gate。若交接选择项目当前禁用的 `autonomous`，必须拒绝执行。
已有 `factory:in-progress` 或 `factory:awaiting-review` 的需求
不得重复认领。

从最新默认分支创建确定性远端分支，以包含唯一运行标识的首次无强推 push 作为并发认领。只有
首次成功者继续；随后把 Issue 状态改为 `factory:in-progress`。认领后若无法交付，先安全释放远端
分支，再恢复正确状态；若释放失败，保留 `in-progress` 并明确报告。

## 执行完整需求

按设计中的内部 work units 顺序推进：

1. 先增加或运行能够在旧行为上失败的测试或等价证据。
2. 实现让该证据通过的最小完整行为。
3. 运行相关检查，提交一个可恢复的语义节点。
4. 继续下一个工作单元，直到完整需求的产品验收标准全部成立。

内部工作单元不产生额外 Issue、分支、PR 或人工 Gate。不能因为执行过程较长就缩减用户已批准的
完整结果；应利用提交、测试和 checklist 恢复上下文。

## 变更控制

- 所有修改必须服务于 `done_when`，并位于允许路径或已批准方案内。
- 必须保持 Pattern 的全部不变量。
- 既有测试只有在当前会话明确批准，或批准方案已预授权时才能修改。
- 新依赖、未经批准的承重路径、Pattern 外产品变化或架构决定立即交还人类。
- 范围根据语义、风险和证据判断，不用变更数量替代判断。

## Gate 与独立验证

先运行相关快速检查，再在完整需求结束时运行交接规定等级的 Gate。任何必需检查缺失、被跳过或
配置错误都不算绿色。同一需求连续两次失败则停止并报告两个不同尝试的证据。

随后启动全新上下文的验证器，冷读 Issue、可信交接、Pattern、需求设计、完整 diff 和测试输出。
实现者不得提示验证器接受，也不得自行替代验证器。被拒绝时按意见修正并重新执行 Gate；连续
两次拒绝则停止。

## 单一交付

通过后：

1. 写 `docs/requirements/REQ-<issue-number>-<名称>/delivery.md`，概括产品结果、测试、Gate、验证、
   风险、Pattern 结论和人工决策点。
2. 推送同一需求分支并创建一个 Draft PR；标题与正文使用中文，正文包含 `Closes #<issue>`。
3. 将 Issue 状态改为 `factory:awaiting-review`。
4. 创建或更新一条最终评论：

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

只有全程未被人工纠正、未越界、Gate 全绿且独立验证接受，才标记为可计入连续干净执行。Agent
到 Draft PR 为止，合并始终由人类决定。
