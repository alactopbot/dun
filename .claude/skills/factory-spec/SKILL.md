---
name: factory-spec
description: 把一个完整 Issue 的产品、技术、素材、风险、测试和验收上下文整合成统一 Spec，并用同一个 GitHub Draft PR 的 Draft/Ready 状态迭代。用于新模式、监督模式、方案反馈或范围变化。
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

## 人工决定

Draft 状态就是方案阶段：

- 有问题：保持 Draft，直接留下普通 PR 评论。后续 Agent 把评论作为新的 Spec 输入，在同一 PR 修改。
- 没问题：点击 **Ready for review**，表示 Spec 通过并允许进入实现。
- 已经 Ready 后需要撤销：点击 **Convert to draft** 并留下评论。

GitHub 时间线事件自带操作者、提交 SHA 和时间，Factory 自动读取。人类不填写关键词、SHA、摘要或
结构化字段。Agent 可以因 Spec 漂移撤回到 Draft，但不得替人点击 Ready for review。

## 状态恢复

后续 Agent 读取 PR 状态、最新可信 Ready/Convert 事件和 Draft 期间新增的普通评论：

- PR 仍是 Draft：处理新反馈并更新同一个 `design.md`、`factory.json`、分支和 PR，继续等待；不得
  创建第二个 PR。
- 最新可信事件是 Ready for review：验证事件提交属于 PR 历史，且之后没有修改 `design.md`、
  `factory.json`、Pattern 或项目策略；随后移除 `factory:plan-review`，把 Issue 改为
  `factory:ready-to-implement`。
- 最新事件是 Convert to draft：撤销之前的通过，回到方案阶段。

Ready 后仅增加实现代码时，Spec 通过继续有效；若产品、技术、依赖、既有测试语义或允许范围变化，
先把 PR 转回 Draft、更新 Spec，并重新等待人类点击 Ready for review。

## 成熟度

- `bootstrap`：人工审阅完整 Spec。
- `supervised`：人工审阅相对 Pattern 的差异 Spec。
- `trusted`：Pattern 自动通过 Spec，仍生成精简 `design.md` 和 `factory.json`，不等待人工操作。
- `autonomous`：只有项目配置开启时可用；DUN 当前禁用。

最终合并就是产品验收，不再设置独立 `product-acceptance` 确认。

## 内部 work units

实现步骤只作为 Spec 内部 work units，每项写行为结果、路径、失败证据和完成证据。它们可以对应
提交或 PR checklist，但不创建额外 Issue、分支、PR 或人工 Gate。
