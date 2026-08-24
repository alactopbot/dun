---
name: factory-spec
description: 把一个完整 Issue 的产品、技术、素材、风险、测试和验收上下文整合成统一 Spec，并在同一个 GitHub Draft PR 上通过标准 Review 迭代。用于新模式、监督模式、Review 要求修改或范围变化。
---

# Factory Spec

Spec 阶段交付一个可执行的完整方案，不把需求拆成更多 Issue，也不让人处理机器协议。

## 创建 Spec 候选

读取契约、章程、项目配置、Issue 和适用 Pattern。在同一需求分支创建：

- `docs/requirements/REQ-<编号>-<名称>/design.md`：产品目标、体验、技术方案、数据或素材、影响范围、
  不变量、内部 work units、测试、验收、风险与明确不做的内容。
- 同目录 `factory.json`：需求编号、Issue、模式、Pattern、唯一 PR、人工 Gate、允许路径与 Gate 等级。

推送分支并创建该需求唯一 Draft PR。`bootstrap` 和 `supervised` 加 `factory:plan-review`，Issue 改为
`factory:wait-to-implement`，然后停止；不在 Agent 会话等待批准。

## 人工 Review

人类只使用 GitHub 标准 Review：

- 没问题：**Approve**。PR 作者与人类账号相同时，用 **Comment** Review，第一行写 `方案通过`。
- 有问题：**Request changes** 并写要求。同账号时用 **Comment** Review，第一行写 `需要修改`，
  后续正文写反馈。

GitHub Review 自带提交 SHA、作者和时间，Factory 自动读取。人类不填写 SHA、摘要或结构化字段；
Agent 不替人提交 Review。

## Review 后恢复

后续 Agent 读取最新可信且有明确决定的 Review：

- `CHANGES_REQUESTED` 或 `需要修改`：把反馈当作新的 Spec 输入，更新同一个 `design.md`、
  `factory.json`、分支和 PR，再请求 Review。不得创建第二个 PR。
- `APPROVED` 或 `方案通过`：验证 Review 提交属于 PR 历史，且之后没有修改 `design.md`、
  `factory.json`、Pattern 或项目策略；随后移除 `factory:plan-review`，把 Issue 改为
  `factory:ready-to-implement`。

若批准后仅增加实现代码，Spec Review 继续有效；若产品、技术、依赖、既有测试语义或允许范围
变化，先更新 Spec 并重新 Review。

## 成熟度

- `bootstrap`：人工审阅完整 Spec。
- `supervised`：人工审阅相对 Pattern 的差异 Spec。
- `trusted`：Pattern 自动通过 Spec，仍生成精简 `design.md` 和 `factory.json`，不等待人工 Review。
- `autonomous`：只有项目配置开启时可用；DUN 当前禁用。

最终合并就是产品验收，不再设置独立 `product-acceptance` 确认。

## 内部 work units

实现步骤只作为 Spec 内部 work units，每项写行为结果、路径、失败证据和完成证据。它们可以对应
提交或 PR checklist，但不创建额外 Issue、分支、PR 或人工 Gate。
