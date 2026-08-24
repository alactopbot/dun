# GitHub 控制面

GitHub 承载 Factory 的实时状态、并发认领、PR Gate 和最终机器证据。

## 标签

运行 `./.factory/scripts/bootstrap-github.sh` 预览，确认仓库后增加 `--apply`。Issue 状态标签互斥；
`factory:monitor` 可作为来源标签共存；`factory:verified` 与 `factory:rejected` 用于 PR 验证结论。

## 默认分支保护

为实际默认分支配置规则：

- 所有变更通过 PR 进入；
- 禁止强推，并且不允许 Agent 账号绕过；
- Factory Gates 成为必需检查；
- 最终合并由人类执行。

仓库内 Hook 只能覆盖常见本地命令，GitHub 规则才是远端执行边界。

## 认领与清理

实现运行用确定性远端分支完成首次无强推认领，失败者立即停止。Draft PR 合并后由 GitHub 关闭
带有 `Closes #<issue>` 的需求，并由仓库设置自动删除已合并分支。关闭但未合并的 PR 必须把 Issue
恢复到明确状态；巡检只报告或修复确定的状态漂移，不会抢占仍有效的认领。
