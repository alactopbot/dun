---
name: factory-monitor
description: 检查 DUN Factory 的 GitHub 实时状态、证据缺口、停滞认领和 Pattern 退化信号。用于定时巡检或人工请求健康检查。
---

# Factory 巡检

只读取 GitHub 实时对象、项目配置、Pattern 和最终交付证据，不实现产品需求。

检查：

- `factory:in-progress` 是否有对应开放分支且仍有活动；
- `factory:awaiting-review` 是否有对应开放 Draft PR；
- 合并或关闭后 Issue、分支和标签是否正确收敛；
- PR 必需 Checks 是否运行且结论清楚；
- `factory-delivery:v2` 是否与实际 Gate、验证和人工修正一致；
- Pattern 是否达到晋级条件，或出现应降级的拒绝、人工纠正、逃逸缺陷、越界和升版；
- 等待人工决策的开放需求是否超过章程背压阈值。

能安全纠正的纯状态漂移可以修复；涉及产品结论、Pattern 晋级/降级争议或权限扩大的情况，只创建
或更新一个明确的 GitHub Issue。巡检输出使用中文，并链接到作为证据的 Issue、PR、Check 或评论。
