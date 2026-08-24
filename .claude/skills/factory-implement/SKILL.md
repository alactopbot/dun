---
name: factory-implement
description: 在统一 Spec 已由人类将 Draft PR 标为 Ready for review，或由成熟 Pattern 自动通过后，恢复同一需求分支与 PR，完成实现、机器 Gate 和独立验证，最终等待人类合并。
---

# Factory 实现

一次运行推进一个完整需求。读取契约、章程、项目配置、Pattern、Issue、`design.md`、`factory.json`、
唯一 PR、最新可信 Ready/Convert 时间线事件和交接后再行动。Agent 会话不是状态来源。

## 选择与恢复

选择 `factory:ready-to-implement` 的开放 Issue。验证：

- `factory.json` 与 Issue、PR、Pattern 和模式一致；
- 同一 Issue 只有一个开放 PR；
- `bootstrap`/`supervised` 的 PR 不再是 Draft，最新可信状态事件是 Ready for review；
- Ready 事件绑定的提交之后没有 Spec、机读范围、Pattern 或项目策略漂移；
- 当前完整 diff 的每个路径都在 `factory.json.allowedPaths` 中。

任何一项失败都回到同一 PR 的 Spec 流程。通过后复用已有分支和 Draft PR，并把 Issue 改为
`factory:in-progress`。`trusted` 需求可以自动通过 Spec，但仍遵守唯一 PR 和范围验证。

## 执行完整需求

按 Spec 的内部 work units 顺序推进：

1. 先建立能在旧行为失败的测试或等价证据。
2. 实现让证据通过的最小完整行为。
3. 运行相关检查，提交并推送可恢复的语义节点。
4. 继续直到完整产品结果成立。

内部 work units 不产生额外流程对象。既有测试语义、新依赖、承重路径、产品设计或允许范围发生
变化时，先把 PR 转回 Draft，更新 `design.md` 与 `factory.json`，等待人类重新点击 Ready for review。

## 候选与独立验证

运行规定等级 Gate；缺失、跳过或 `MISCONFIGURED` 都不算绿色。写唯一候选 `delivery.md`，保持
`outcome`、`verifier` 和 `eligible_clean_run` 为 `pending`，推送同一 PR。

启动全新上下文验证器，冷读 Issue、Spec、机读范围、Ready 事件、完整 diff、测试与 GitHub 状态。
拒绝时在同一分支修复后重新验证；连续两次拒绝则停止。

接受后只更新最终交付证据，由原验证上下文重新核对并发布绑定新头的
`factory-verification:v2`，确保 `factory:verified` 存在、`factory:rejected` 不存在且必需 Check
最终绿色。然后把 Issue 设为 `factory:awaiting-review`。

不再请求单独的产品验收评论。人类审阅最终产品并合并同一 PR，合并即产品验收。Agent 不转 Ready、
不合并、不发布。
