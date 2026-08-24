# DUN Factory V2 使用指南

Factory V2 以完整产品需求和成熟 Pattern 驱动研发。日常运行不维护 Git 内队列：GitHub 是状态
和机器证据的权威来源，Git 只保留项目策略、可复用模式、产品决策和最终交付结论。

## 配置结构

| 路径 | 作用 |
|---|---|
| `.factory/project.json` | 语言、人工决策、自动化与证据策略 |
| `.factory/patterns/*.json` | 可复用需求模式、成熟度、晋级与降级条件 |
| `CHARTER.md` | 人类批准的风险与产品边界 |
| `CONTRACT.md` | Claude Code 与 Codex 共用的执行契约 |
| `docs/requirements/REQ-*/` | 每个完整需求的方案和最终交付 |
| `GITHUB.md` | 仓库侧 Gate 与保护设置 |
| `archive/v1/` | 只读 V1 历史 |

## 完整流程

1. 新需求创建一个 GitHub Issue。
2. `factory-triage` 匹配 Pattern，决定 `bootstrap`、`supervised` 或 `trusted`。
3. `factory-spec` 在需求分支形成统一 `design.md` 和机读 `factory.json`，立即创建唯一中文 Draft PR。
4. PR 保持 Draft 时，人类有问题就留下普通评论；没有问题就点击 Ready for review。GitHub 自动
   绑定方案提交，Agent 在同一 PR 重做 Spec 或进入实现。
5. 后续 `factory-implement` 可以来自新的或定时 Agent，会读取 GitHub 状态并复用同一分支和 PR，
   完成全部内部工作单元、测试、Deep Gate 和 `pending` 候选交付。
6. 全新上下文的 `factory-verify` 独立验收候选并绑定当前头。
7. 后续 Agent 根据验证完成最终证据；人类合并即产品验收。`factory-monitor` 负责发现可恢复
   的 Gate、状态漂移、Pattern 连续成功或降级信号。

Agent 对话不是流程状态或授权来源。关闭会话、换一个 Agent 或由定时任务继续，都应仅凭 Issue、
同一 PR、Draft/Ready 时间线、评论、`factory.json`、分支和 Checks 恢复到正确步骤。

当前项目关闭 `autonomous`、自动合并和自动发布。`animal-exhibit-v1` 处于监督模式，同类动物展品
需要由人类将统一 Spec 的 Draft PR 标为 Ready；最终合并就是产品验收。连续 3 次干净执行后才具备晋级条件。

## 本地检查

```bash
./.factory/scripts/doctor.sh
./.claude/scripts/gates.sh fast
./.claude/scripts/gates.sh full
./.claude/scripts/gates.sh deep
```

首次配置 GitHub 标签可先预览，再执行：

```bash
./.factory/scripts/bootstrap-github.sh
./.factory/scripts/bootstrap-github.sh --apply
```
