# GitHub 控制面

GitHub 承载 Factory 的实时状态、Spec Review、并发认领、PR Gate 和最终机器证据。

## 人工体验

一个完整需求只使用一个 Issue、一个分支和一个 Draft PR。Agent 在 PR 一次性提交产品、技术、素材、
风险、测试与验收的统一 Spec。

人类只做正常 PR Review：

- 方案没问题：**Approve**。
- 方案有问题：**Request changes** 并写反馈。
- 当前人类账号与 PR 作者相同时，GitHub 不允许 Approve/Request changes；使用 **Comment** Review，
  第一行写 `方案通过` 或 `需要修改`，正文照常写反馈。

Agent 根据最新 Review 在同一 PR 重做 Spec 或进入实现。人类不填写 SHA、摘要和结构化协议。最终
实现通过独立验证后，人工合并同时代表产品验收，不再增加一次确认。

## 机读 Spec 与协议检查

每个需求的 `factory.json` 和 `design.md` 一起进入 Spec Review。GitHub Review 自带作者、提交 SHA、
时间和 URL；`.factory/scripts/validate-pr-gates.mjs` 自动验证：

- PR 仍开放，同一 Issue 只有一个开放 PR；
- `factory.json` 与 Issue、PR、模式、Pattern 和 Gate 一致；
- 完整 diff 的每个路径都属于 `allowedPaths`；
- 最新可信 Review 是通过而不是要求修改；
- Review 提交之后 Spec、机读范围、Pattern 和项目策略没有漂移；
- 独立验证证据绑定当前 PR 头，`factory:verified` 与 `factory:rejected` 不冲突。

Spec 等待 Review 或候选等待验证时，Check 为红是正常的合并保护。Review 通过后 Agent 更新状态，
验证器接受后添加证据和标签，各自触发重检。

## 标签

Issue 状态标签互斥。PR 使用 `factory:plan-review`、`factory:verified` 与 `factory:rejected`。运行：

```bash
./.factory/scripts/bootstrap-github.sh --apply
```

## 默认分支保护

- 所有变更通过 PR；
- 禁止强推，Agent 账号不可绕过；
- `factory-gates` 是必需检查，严格要求最新默认分支；
- 最终合并始终由人类执行。

要使用原生 Approve/Request changes，Agent 应通过独立 GitHub App 或 bot 账号创建 PR，人类账号负责
Review。DUN 当前 Agent 与维护者共用 `alactopbot`，因此暂用带提交绑定的 Comment Review 兼容模式。

## 认领与清理

实现运行用确定性远端分支无强推认领。已有 Spec PR 时直接恢复同一分支。合并后 GitHub 关闭带有
`Closes #<issue>` 的 Issue 并删除分支；关闭但未合并时恢复明确状态。巡检不会抢占有效认领。
