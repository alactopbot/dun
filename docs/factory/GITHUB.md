# GitHub 控制面

GitHub 承载 Factory 的实时状态、Spec Draft/Ready 决定、并发认领、PR Gate 和最终机器证据。

## 人工体验

一个完整需求只使用一个 Issue、一个分支和一个 Draft PR。Agent 在 PR 一次性提交产品、技术、素材、
风险、测试与验收的统一 Spec。

人类只使用最直接的 PR 操作：

- 方案有问题：保持 Draft，留下普通 PR 评论。
- 方案没问题：点击 **Ready for review**。
- 已经 Ready 后需要撤销：点击 **Convert to draft**，再留下普通评论。

Agent 根据 Draft/Ready 状态和评论在同一 PR 重做 Spec 或进入实现。人类不填写关键词、SHA、摘要
和结构化协议。最终
实现通过独立验证后，人工合并同时代表产品验收，不再增加一次确认。

## 机读 Spec 与协议检查

每个需求的 `factory.json` 和 `design.md` 一起进入 Draft PR。GitHub Ready/Convert 时间线事件自带
操作者、提交 SHA、时间和 URL；`.factory/scripts/validate-pr-gates.mjs` 自动验证：

- PR 仍开放，同一 Issue 只有一个开放 PR；
- `factory.json` 与 Issue、PR、模式、Pattern 和 Gate 一致；
- 完整 diff 的每个路径都属于 `allowedPaths`；
- PR 已由仓库 Owner 标为 Ready，且之后没有被转回 Draft；
- Ready 事件之后 Spec、机读范围、Pattern 和项目策略没有漂移；
- 独立验证证据绑定当前 PR 头，`factory:verified` 与 `factory:rejected` 不冲突。

Spec 等待 Ready 或候选等待验证时，Check 为红是正常的合并保护。PR Ready 后 Agent 更新状态，
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

当前 Agent 与维护者共用 `alactopbot`，所以 Draft/Ready 同时是最自然且可跨会话恢复的方案状态；
不需要额外 bot 账号，也不要求人类学习特殊评论格式。

## 认领与清理

实现运行用确定性远端分支无强推认领。已有 Spec PR 时直接恢复同一分支。合并后 GitHub 关闭带有
`Closes #<issue>` 的 Issue 并删除分支；关闭但未合并时恢复明确状态。巡检不会抢占有效认领。
