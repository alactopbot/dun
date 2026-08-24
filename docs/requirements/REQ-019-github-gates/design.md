# REQ-019：人工 Gate 迁移到 GitHub Draft PR

## 需求与成功标准

Factory 的人工确认不能依赖某次 Agent 对话。每个完整需求只使用一个 Issue、一个分支和一个
Draft PR；只要 GitHub 上存在可信、绑定提交 SHA 的决定，任意后续 Agent 或定时任务都能恢复流程。

成功标准：

- 需要技术方案确认时，方案提交后、实现前就创建唯一 Draft PR；
- 技术方案、既有测试或依赖例外、产品验收都在同一 PR 留证；
- 实现与最终证据运行复用已有分支和 PR，不创建第二个 PR；
- Gate 验证批准者权限、决定类型、提交 SHA 和其后是否发生使授权失效的漂移；
- 聊天、Agent 自述和运行转录都不能授权流程；
- 静态契约测试与真实 GitHub 剑龙流程共同验证机制。

## 模式与范围

这是 Factory 自身的启动模式修订，不改变 DUN 产品行为。允许修改 `.factory/**`、`.claude/**`、
`.agents/**`、`CLAUDE.md`、`AGENTS.md`、`docs/factory/**`、本需求文档和 Factory 契约测试。修改承重
路径已由 Issue #19 明确授权，执行 Deep Gate。不新增依赖。

## 状态机

```text
Issue ready-to-spec
  -> 需求分支 + design.md
  -> 唯一 Draft PR + factory:plan-review
  -> GitHub 技术方案 Gate
  -> Issue ready-to-implement
  -> 同一分支/PR 实现 + 机器 Gate + 独立验证
  -> factory:product-review
  -> GitHub 产品验收 Gate
  -> 最终证据
  -> 人类合并
```

`trusted` 模式没有前置人工 Gate 时，可以到候选交付阶段再建唯一 Draft PR。其他模式在第一个人工
Gate 前建 PR。任何模式都不允许 Agent 合并。

## Gate 证据

结构化评论使用 `factory-gate:v2`，包含需求、Gate 类型、决定、完整提交 SHA、GitHub 登录名和 UTC
时间。Agent 只能在验证原始 PR 评论或 Review 来自 Owner、Member 或 Collaborator 后规范化它，
不能自己生成 `approved`。

技术方案 Gate 绑定方案提交。纯实现提交不会使其失效；设计、Pattern 版本、允许路径、依赖或既有
测试授权发生变化时失效。产品验收绑定完成实现并经独立验证的候选提交；之后任何产品、测试或策略
变化都会使它失效。

## 内部 work units

1. 用契约测试先证明旧 Factory 缺少 `github-pr` Gate、统一结构化证据和同一 PR 恢复规则。
2. 更新项目策略、共享契约、章程、GitHub 标签与诊断脚本。
3. 更新分诊、方案、实现、巡检和独立验证 skills，使它们使用同一状态机。
4. 更新 Claude/Codex 入口文档、使用指南和决策记录。
5. 运行新旧 skill 的跨会话场景对照、Deep Gate 与全新上下文独立验证。
6. 创建本需求唯一 Draft PR，交给人类在 GitHub 审阅和合并。

## 验收场景

- Agent A 为监督模式需求写方案并创建 Draft PR 后退出；人类在 PR 批准；Agent B 仅凭 GitHub 能
  验证 Gate 并继续同一个分支和 PR。
- 候选实现验证完成后 Agent 退出；人类在原 PR 做产品验收；定时 Agent 能完成最终证据。
- 聊天中出现“批准”但 PR 没有可信决定时，Factory 必须保持等待。
- PR 上决定来自非可信作者、绑定错误 SHA 或方案已漂移时，Factory 必须拒绝恢复。

## 不做与风险

本需求不实现自动轮询服务、不自动合并，也不修改剑龙产品代码。最大风险是把模糊评论错误解释为
批准，因此恢复时宁可要求明确 GitHub 决定，也不能由 Agent 推断授权。
