# DUN 项目与 Factory 指引

修改仓库前先读取 `CLAUDE.md`、`docs/factory/CONTRACT.md`、`docs/factory/CHARTER.md` 和
`.factory/project.json`；处理产品需求时还要读取匹配的 `.factory/patterns/*.json`。

Codex 使用 `.agents/skills/` 中的适配器，实际流程以 `.claude/skills/` 中的同名规范为准。若适配器
与共享契约冲突，以共享契约为准。

所有面向人的 Factory 文档、Issue/PR 说明和工作结论使用中文；产品保持中文为主、英文为辅；
代码、类型、接口和机器字段使用英文。

仓库 Hook 只是纵深保护，GitHub 规则与人工合并仍是最终边界。

需要人工 Spec 决策时，只认该需求唯一 GitHub Draft PR 上的可信 Review。GitHub 自动绑定提交；
人类不填写机器字段，Agent 不替人 Review。会话可以中断或更换，不作为流程状态来源。最终合并
同时代表产品验收。
