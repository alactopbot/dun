# GitHub 控制面

GitHub 承载 Factory 的实时状态、并发认领、PR Gate 和最终机器证据。

## 标签

运行 `./.factory/scripts/bootstrap-github.sh` 预览，确认仓库后增加 `--apply`。Issue 状态标签互斥；
`factory:monitor` 可作为来源标签共存。PR 使用 `factory:plan-review`、`factory:product-review`、
`factory:verified` 与 `factory:rejected` 表达当前阶段，不在 Agent 会话里等待人类确认。

## 同一 PR 上的人工 Gate

需要方案确认的需求在设计提交推送后就创建唯一 Draft PR。技术方案、依赖、既有测试授权、产品
验收和最终合并都在该 PR 进行；实现阶段不得另开 PR。

人类直接在 PR 发布结构化决定，并亲自填写审阅时的完整提交 SHA。Factory 只接受仓库 Owner、
Member 或 Collaborator；GitHub API 的评论 URL、作者身份和时间作为原始来源：

```text
<!-- factory-gate:v2 -->
requirement: REQ-<issue-number>
gate: technical-plan | product-acceptance | existing-test-change | dependency
decision: approved | rejected
approved_sha: <40-character commit SHA>
```

技术方案批准绑定设计提交；只要设计、Pattern、允许路径、依赖和测试授权未漂移，后续实现提交
不会使它失效。产品验收绑定经独立验证的候选提交；之后若混入产品、测试或策略变化则必须重验。
Agent 不得自行构造批准、替含糊评论选择 SHA，聊天记录也不能转换成 GitHub 授权。

## 必需 PR 协议检查

`.factory/scripts/validate-pr-gates.mjs` 在 GitHub Actions 中验证：

- PR 仍开放，且同一 Issue 只有一个开放 PR；
- 交接来自可信作者，`review_pr` 指向当前 PR；
- 必需人工 Gate 来自可信原始评论、使用完整 SHA 且属于当前 PR 历史；
- 技术方案批准后设计、Pattern、允许范围与策略没有漂移；
- 产品验收后只允许最终 `delivery.md` 证据变化；
- `factory:verified` 与 `factory-verification:v2` 均存在并绑定当前 PR 头。

方案评审阶段或产品验收等待阶段，Check 为红是正常的合并保护。人类提交 Gate 后，后续 Agent
更新标签或推送提交触发重检。分支保护必须把 `factory-gates` 设为必需且禁止 Agent 绕过。

## 默认分支保护

为实际默认分支配置规则：

- 所有变更通过 PR 进入；
- 禁止强推，并且不允许 Agent 账号绕过；
- Factory Gates 成为必需检查；
- 最终合并由人类执行。

仓库内 Hook 只能覆盖常见本地命令，GitHub 规则才是远端执行边界。

## 认领与清理

没有前置 PR 的可信模式用确定性远端分支完成首次无强推认领，失败者立即停止。已有方案 PR 的
监督或启动模式验证交接后直接恢复该分支。Draft PR 合并后由 GitHub 关闭
带有 `Closes #<issue>` 的需求，并由仓库设置自动删除已合并分支。关闭但未合并的 PR 必须把 Issue
恢复到明确状态；巡检只报告或修复确定的状态漂移，不会抢占仍有效的认领。
