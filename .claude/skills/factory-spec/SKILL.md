---
name: factory-spec
description: 为一个完整需求形成与其 Pattern 成熟度相适应的中文方案，并在同一 Issue 内完成必要的人类确认。用于新模式、监督模式需求或范围发生变化时。
---

# Factory 需求方案

方案阶段的输出是一个完整需求的可执行设计，不是把需求变成更多 Issue。

## 前置读取

读取契约、章程、项目配置、适用 Pattern、Issue 全文和最新可信 `factory-handoff:v2`。在
`docs/requirements/REQ-<issue-number>-<名称>/design.md` 中维护一份设计；同一需求的补充与批准
继续更新该文件和 Issue，不建立多套并行状态。

## 按成熟度选择确认深度

### bootstrap

用于第一次建立新 Pattern。依次确认：

1. 产品意图：用户问题、成功标准、完成后的产品表述、明确不做什么。
2. 技术方案：现有模块、数据与调用流、依赖、承重路径、风险与回退。
3. 执行设计：准确路径、接口约定、测试证明、最不确定的决策。
4. 产品验收：从用户视角确认完整结果，并沉淀可复用 Pattern。

只有人类明确批准当前阶段后才继续，但这些确认都属于同一个 Issue 和最终 PR。

### supervised

Pattern 已经建立。把产品差异、技术影响、内部 work units、测试与验收标准合并为一份技术方案，
只在 `technical-plan` 和最终 `product-acceptance` 停止等待。重复性的产品意图和架构选择直接引用
Pattern，不要求重新确认。

### trusted

需求完全落在成熟 Pattern 内时，方案与产品验收自动通过。Agent 仍需写出精简设计、执行全部
证据与独立验证；任何越界或不确定性立即退回 `supervised` 或新模式。

## 内部 work units

将实现拆成可以顺序验证和恢复的内部 work units。每项说明行为结果、预期路径、失败证据和完成
证据。它们可以对应提交或 PR checklist，但不得各自创建 GitHub Issue、分支、PR 或人工 Gate。
工作单元可以小，完整需求不能因此被切碎。

## 设计文档最少内容

- 需求与成功标准
- Pattern、版本、模式及匹配理由
- 本次允许变化与必须保持的不变量
- 技术方案、影响路径和依赖决定
- 内部 work units 与测试证明
- 产品验收场景
- 明确不做的内容和已知风险
- 已获得的人类授权，包括既有测试、依赖和承重路径

## 交回执行

所需确认完成后，更新同一条可信交接评论为：

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
human_gates: <已完成或 none>
created_at: <UTC timestamp>
```

把 Issue 状态改为 `factory:ready-to-implement`。不创建中间 PR；设计与实现最终进入同一个 Draft PR。
