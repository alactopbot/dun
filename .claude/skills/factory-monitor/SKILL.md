---
name: factory-monitor
description: 检查 DUN Factory 的 GitHub 实时状态、PR 人工 Gate、证据缺口、停滞认领和 Pattern 退化信号。用于定时巡检或跨 Agent 会话恢复流程。
---

# Factory 巡检与恢复

GitHub 是实时状态来源。读取 Issue、标签、分支、唯一 Draft PR、Review、评论、Checks、项目配置、
Pattern 和最终交付证据，不依赖之前的 Agent 会话，也不实现产品需求。

检查：

- `factory:wait-to-implement` 的 PR 是否出现可信技术方案决定；
- `factory:awaiting-review` 的 PR 是否出现可信产品验收决定；
- 人类评论或 Review 是否需要规范化为 `factory-gate:v2`；
- 结构化 Gate 的批准者权限、绑定 SHA 与后续 diff 是否仍有效；
- `factory:in-progress` 是否有对应开放分支、唯一 PR 且仍有活动；
- 合并或关闭后 Issue、分支和标签是否正确收敛；
- PR 必需 Checks 是否运行且结论清楚；
- `factory-delivery:v2` 是否与实际 Gate、验证和人工修正一致；
- Pattern 是否达到晋级条件，或出现应降级的拒绝、人工纠正、逃逸缺陷、越界和升版；
- 等待人工决策的开放需求是否超过章程背压阈值。

只有先验证原始决定来自可信 GitHub 人类且目标 SHA 明确，才可补写结构化 Gate；绝不能自行发明
`approved`。技术方案 Gate 有效时可把 Issue 转为 `factory:ready-to-implement`，让后续定时 Agent
恢复同一分支和 PR。产品验收 Gate 有效时可触发最终证据运行。拒绝、SHA 漂移或范围变化保持等待
并清楚报告原因。

能安全纠正的纯状态漂移可以修复；涉及产品结论、Pattern 晋级或降级争议、权限扩大时，只创建或
更新一个明确的 GitHub Issue。输出使用中文并链接作为证据的 Issue、PR、Check 或评论。
