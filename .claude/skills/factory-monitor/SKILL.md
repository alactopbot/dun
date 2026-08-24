---
name: factory-monitor
description: 检查并恢复 DUN Factory 的 GitHub Issue、Spec Review、唯一 Draft PR、验证证据、停滞认领和 Pattern 退化信号。用于定时巡检或跨 Agent 会话继续流程。
---

# Factory 巡检与恢复

GitHub 是实时状态来源。读取 Issue、标签、分支、唯一 Draft PR、Review、Checks、`factory.json`、
Pattern 和交付证据，不依赖之前的 Agent 会话，也不实现产品需求。

检查：

- `factory:wait-to-implement` 的最新可信 Review 是通过还是要求修改；
- Review 绑定提交后 `design.md`、`factory.json`、Pattern 或项目策略是否漂移；
- `factory.json` 是否与 Issue、唯一 PR 和完整 diff 一致；
- `factory:in-progress` 是否有对应开放分支和 PR；
- `factory:awaiting-review` 是否已有当前 SHA 的结构化验证和绿色 Check；
- 合并或关闭后 Issue、分支和标签是否正确收敛；
- Pattern 是否达到晋级条件，或出现拒绝、人工改 Spec、逃逸缺陷、越界和升版；
- 等待人工 Review 或合并的开放需求是否超过章程背压阈值。

不得替人提交 Review。最新 Review 要求修改时触发同一 PR 的 Spec 重做；Review 通过且协议检查有效
时，移除 `factory:plan-review`，把 Issue 转为 `factory:ready-to-implement`，让后续 Agent 恢复同一
分支和 PR。候选验证完成后只等待最终合并，不再请求单独产品验收。

能安全纠正的纯状态漂移可以修复；涉及产品结论、Pattern 晋级或权限扩大时，只创建或更新明确的
GitHub Issue。输出使用中文并链接证据。
