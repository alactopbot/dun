---
name: factory-triage
description: 按项目策略和 Pattern 分诊 GitHub Issue，确定完整需求的自治模式并写入可信交接。用于处理新 Issue、定时分诊或重新判断需求是否可执行。
---

# Factory 分诊

目标是把一个完整产品需求交给正确的执行模式，不写实现代码，也不把需求拆成多个流程对象。

## 前置读取

依次读取：

1. `docs/factory/CONTRACT.md`
2. `docs/factory/CHARTER.md`
3. `.factory/project.json`
4. `.factory/patterns/*.json`

GitHub Issue、标签、分支和 PR 是实时状态来源。只处理没有 Factory 状态标签，或明确要求重新分诊
的 Issue；跳过 `factory:in-progress` 和 `factory:awaiting-review`。

## 判断完整需求

先用一句话写出用户可独立验收的最终结果。如果只能描述技术步骤，继续回到用户价值；如果一个
Issue 包含互不依赖、可以分别发布和验收的产品结果，才建议拆成多个需求。实现步骤只是内部
work units，不创建额外 Issue 或 PR。

## 匹配 Pattern

逐项检查候选 Pattern：

- 需求是否满足 `appliesWhen`；
- 所有预期变化是否属于 `allowedChanges`；
- 是否有证据能验证全部 `preserved` 不变量；
- Pattern 版本和成熟度是否有效；
- GitHub 中最近的 `factory-delivery:v2` 是否触发降级。

完全匹配时使用该 Pattern 的当前成熟度：首个模式为 `bootstrap`，校准期为 `supervised`，达到
连续干净执行条件后为 `trusted`。只要越出边界或无法确认，就按新模式进入方案阶段，不得勉强
套用成熟 Pattern。

## 分类

| disposition | 使用条件 |
|---|---|
| `ready-to-implement` | 范围明确，Pattern 与所需人工 Gate 均已满足 |
| `ready-to-spec` | 新模式、需确认方案、Pattern 外变化或所需 Gate 尚未满足 |
| `needs-info` | 缺少一个只有人类能回答且会改变结果的问题 |
| `wait-to-implement` | 需求清楚，但被明确依赖阻塞 |

触及承重路径不是按规模自动拒绝，而是要求 Deep Gate 和项目策略规定的人类授权。匹配
`NEVER_AUTOMATE` 的工作必须明确交还人类。

## 写入交接

应用唯一的 `factory:*` 状态标签，并创建或更新由仓库协作者发布的单条评论：

```text
<!-- factory-handoff:v2 -->
requirement: REQ-<issue-number>
disposition: ready-to-implement
mode: bootstrap | supervised | trusted
pattern: <pattern-id | new>
pattern_version: <number | pending>
done_when: <完整且可验证的产品结果>
allowed_paths: <逗号分隔路径>
load_bearing: true | false
gate_level: fast | full | deep
human_gates: <逗号分隔 Gate 或 none>
created_at: <UTC timestamp>
```

`done_when` 必须能够由测试和产品验收共同判断。`allowed_paths` 是语义范围的辅助约束，不允许
借交接评论扩大契约权限或降低 Gate。更新已有可信交接，不累积冲突版本。

## 结束

在 Issue 评论中用中文简述：为何匹配或不匹配 Pattern、采用哪个模式、下一步由谁负责。分诊
本身不创建代码分支、设计 PR 或状态快照。
