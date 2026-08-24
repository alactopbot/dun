---
name: factory-spec
description: 为一个完整需求形成与其 Pattern 成熟度相适应的中文方案，并在同一个 GitHub Draft PR 上建立可跨 Agent 会话恢复的人工 Gate。用于新模式、监督模式需求或范围发生变化时。
---

# Factory 需求方案

方案阶段形成一个完整需求的可执行设计，不把需求拆成更多 Issue。GitHub Issue、分支和 PR 是跨
会话状态；Agent 对话可以随时结束，不能承载流程授权。

## 前置读取

读取契约、章程、项目配置、适用 Pattern、Issue 全文和最新可信 `factory-handoff:v2`。在
`docs/requirements/REQ-<issue-number>-<名称>/design.md` 中维护一份设计，同一需求的补充继续更新
该文件。设计定稿后推送需求分支，并创建该需求唯一 Draft PR；这一步发生在任何人工批准之前。

## GitHub Gate

所有人工决定都在该 Draft PR 上完成。只接受仓库 Owner、Member 或 Collaborator 亲自发布的
`factory-gate:v2` 评论；聊天、运行转录和 Agent 自述都不是授权。人类必须填写审阅时的完整提交
SHA，GitHub API 的评论 URL 和作者元数据是原始来源。Agent 不能替人生成 `approved`、补写结构化
评论或为含糊批准选择 SHA：

```text
<!-- factory-gate:v2 -->
requirement: REQ-<issue-number>
gate: technical-plan | product-acceptance | existing-test-change | dependency
decision: approved | rejected
approved_sha: <40-character commit SHA>
```

## 按成熟度选择确认深度

### bootstrap

用于第一次建立新 Pattern。产品意图、技术方案、执行设计和产品验收可以分阶段讨论，但都使用
同一 Issue、分支和 Draft PR。每个需要人工决定的阶段都绑定当时 SHA；方案或授权范围变化后，
原技术方案 Gate 失效并在同一 PR 重新评审。

### supervised

Pattern 已建立。把产品差异、技术影响、内部 work units、测试与验收标准合并成一份技术方案。
PR 加 `factory:plan-review`，Issue 设为 `factory:wait-to-implement`，由人在 GitHub PR 用结构化评论
批准技术方案。
批准证据有效后移除该 PR 标签，把 Issue 设为 `factory:ready-to-implement`。最终实现仍在同一 PR
进行，完成后再进入 `product-acceptance`。

### trusted

需求完全落在成熟 Pattern 内时，方案与产品验收自动通过。Agent 仍写精简设计、执行全部证据与
独立验证；任何越界或不确定性立即退回 `supervised` 或新模式。没有前置人工 Gate 时可以到候选
交付阶段才创建唯一 Draft PR。

### autonomous

只有 `.factory/project.json` 显式开启时才可使用；DUN 当前禁用。禁用状态下不得用它绕过任何
项目级人工策略，尤其不能自动合并或发布。

## 内部 work units

将实现拆成可顺序验证和恢复的内部 work units。每项说明行为结果、预期路径、失败证据和完成
证据。它们可以对应提交或 PR checklist，但不各自创建 GitHub Issue、分支、PR 或人工 Gate。
工作单元可以小，完整需求不能因此被切碎。

## 设计文档最少内容

- 需求与成功标准
- Pattern、版本、模式及匹配理由
- 本次允许变化与必须保持的不变量
- 技术方案、影响路径和依赖决定
- 内部 work units 与测试证明
- 产品验收场景
- 明确不做的内容和已知风险
- 需要或已经取得的人类授权，包括既有测试、依赖和承重路径

## 交回执行

方案已推送且唯一 Draft PR 已建立后，更新同一条可信交接评论：

```text
<!-- factory-handoff:v2 -->
requirement: REQ-<issue-number>
disposition: ready-to-implement | wait-to-implement
mode: bootstrap | supervised | trusted | autonomous
pattern: <pattern-id | new>
pattern_version: <number | pending>
done_when: <完整且可验证的产品结果>
allowed_paths: <逗号分隔路径>
load_bearing: true | false
gate_level: fast | full | deep
human_gates: <Gate 状态或 none>
review_pr: <唯一 PR 编号>
approved_plan_sha: <40-character SHA | pending>
created_at: <UTC timestamp>
```

需要人工方案 Gate 时保持 `wait-to-implement`，直到可信 GitHub 证据出现；不需要或证据有效时改为
`ready-to-implement`。实现阶段复用交接中的分支和 PR，不创建第二个 PR。
