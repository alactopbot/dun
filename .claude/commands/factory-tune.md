---
name: factory-tune
description: 基于 GitHub 最终证据评估 Pattern 与 Factory 约束，提出晋级、降级、收紧或放宽建议。
---

# Factory 调优

读取最近 30 天或章程上次复核以来的合并 PR、Checks、验证评论、Issue 时间线、逃逸缺陷和
`factory-delivery:v2`。本命令只提出建议；不得自行修改章程、项目策略、Pattern 或 Gate。

重点分析：

- Pattern 连续干净执行是否达到晋级条件；
- 人工是否反复修改技术方案或产品验收；
- 独立验证反复发现什么问题，能否转为确定性检查；
- 哪类变化发生逃逸缺陷，应立即降级或收紧；
- 人工等待是否成为瓶颈；
- PR Gate 是否缺失、跳过或配置错误。

建议必须引用具体 Issue、PR、Check 或评论。接受后的规则决策记录到
`docs/factory/DECISIONS.md`；Pattern 的机读变更仍需人类明确批准并通过一个独立需求交付。

最后回答：Factory 产生的产品价值是否值得它占用的人工注意力。
