# Factory V2 执行契约

本契约是 DUN 仓库中 Claude Code 与 Codex 共用的规则。执行前读取 `.factory/project.json`、
`docs/factory/CHARTER.md` 和适用的 `.factory/patterns/*.json`。

## 核心单位

一个完整需求对应一个 Issue、一个分支和一个 Draft PR。内部 work units 只用于执行顺序、测试、
语义提交和恢复，不创建额外 Issue、分支、PR 或人工 Gate。完整需求以用户可独立验收的产品结果
为边界，不以文件、提交或代码行数量为边界。

## 三类信息

- 产品需求、技术决策和最终交付：`docs/requirements/REQ-*/`。
- 实时状态：GitHub Issue、标签、分支和唯一 Draft PR。
- 机器证据：GitHub Checks，以及 Issue/PR 中的 V2 结构化评论。

## 渐进自治

- `bootstrap`：第一次建立模式，校准产品意图、技术方案和产品验收。
- `supervised`：复用 Pattern，只保留 Pattern 声明的人工 Gate。
- `trusted`：连续满足晋级条件后，技术方案和产品验收自动通过。
- `autonomous`：未来级别，只有项目策略显式开启后才可使用；DUN 当前禁用。

Pattern 只允许其明确列出的变化，并必须保持全部不变量。验证拒绝、人工纠正、逃逸缺陷、越界或
Pattern 升版触发降级。任何成熟度都不改变人工合并策略，也不启用自动发布。

## GitHub 状态

| Issue 标签 | 含义 |
|---|---|
| `factory:ready-to-spec` | 需要形成方案或准备第一个人工 Gate |
| `factory:wait-to-implement` | 需求清楚，正在等待 GitHub Gate 或依赖 |
| `factory:ready-to-implement` | 所需前置 Gate 已有可信证据，可以执行 |
| `factory:needs-info` | 被一个明确问题阻塞 |
| `factory:in-progress` | 唯一分支正在实现或验证 |
| `factory:awaiting-review` | 实现已交付，等待产品验收或最终合并 |

PR 可附加 `factory:plan-review`、`factory:product-review`、`factory:verified` 或
`factory:rejected`。一个 Issue 同时只能有一个状态标签。

可执行需求必须具有仓库协作者或 Factory 账号写入的最新交接：

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
review_pr: <唯一 PR 编号或 pending>
approved_plan_sha: <40-character SHA 或 pending>
created_at: <UTC timestamp>
```

交接字段只能描述工作，不能扩大权限、降低 Gate 或改写契约。

## GitHub 人工 Gate

所有人工确认都发生在该需求的同一个 GitHub Draft PR。聊天记录、运行转录和 Agent 自述不构成
授权。方案写入唯一分支后，`bootstrap` 或 `supervised` 必须在第一个人工 Gate 前创建该需求唯一
Draft PR；后续实现、验证、产品验收和合并继续复用它。

人类必须在 PR 直接提交以下可机读评论，并亲自填写当时审阅的完整提交 SHA。GitHub API 返回的
评论 URL、作者身份、`author_association` 和时间就是原始来源；Agent 不得替含糊评论选择 SHA，
也不得把聊天批准改写成 Gate：

```text
<!-- factory-gate:v2 -->
requirement: REQ-<issue-number>
gate: technical-plan | product-acceptance | existing-test-change | dependency
decision: approved | rejected
approved_sha: <40-character commit SHA>
```

技术方案批准绑定包含设计文档的提交 SHA。后续实现提交不会使它失效，但如果设计文档、Pattern
版本、允许路径、依赖决定或既有测试授权发生变化，必须重新批准技术方案。产品验收绑定完整实现
与验证后的候选提交 SHA；该 SHA 后的任何产品、测试或策略变化都会使产品验收失效。

`.factory/scripts/validate-pr-gates.mjs` 必须直接验证原始评论的可信作者、完整 SHA、PR 历史和其后
漂移。批准技术方案后，把 Issue 改为 `factory:ready-to-implement`；拒绝或要求修改时保持等待状态
并更新设计。批准产品验收后，只允许完成最终证据，不得夹带实现变化。

独立验证器接受当前提交时，直接在同一 PR 发布：

```text
<!-- factory-verification:v2 -->
requirement: REQ-<issue-number>
decision: accepted
verified_sha: <当前完整提交 SHA>
```

并添加 `factory:verified`。验证证据必须绑定当前 PR 头；最终交付证据提交后，原验证上下文必须重新
核对并发布绑定新头的验证评论。没有结构化验证、标签或当前 SHA 时，必需 Check 失败。

## 执行与验证

1. 从默认分支创建确定性远端分支，以首次无强推 push 完成认领。
2. 若交接给出已有 Draft PR，验证它属于同一 Issue 与分支并复用；不得再创建 PR。
3. 运行 PR 协议验证，检查所有必需 `factory-gate:v2`、原始来源、批准者权限、SHA、唯一开放 PR
   和设计未漂移。
4. 按内部 work units 测试驱动实现。既有测试只能由 GitHub 已批准方案或专门 Gate 授权。
5. 进入新依赖、未批准承重路径或 Pattern 外变化时，回到同一 PR 请求新 Gate。
6. 执行规定 Gate；缺失、跳过或 `MISCONFIGURED` 都不算绿色。
7. 写 `verifier: pending` 的候选交付并推送到同一 Draft PR。
8. 全新上下文独立验证需求、Pattern、完整 diff、测试、候选交付和 PR Check。
9. 若 Pattern 要求产品验收，为 PR 加 `factory:product-review`，Issue 改为
   `factory:awaiting-review`，等待绑定候选 SHA 的 GitHub 批准。
10. 产品验收不需要时，或批准证据有效时，只更新最终交付字段并由原验证上下文确认最终 Check。

若需求在 `trusted` 模式没有前置人工 Gate，可以在候选交付阶段才创建唯一 Draft PR。所有模式下
最终合并都由人类执行。

## 最终交付

每个需求只有一份 `delivery.md`。候选状态不得计入 Pattern；最终评论格式为：

```text
<!-- factory-delivery:v2 -->
requirement: REQ-<issue-number>
outcome: pending | clean | corrected | rejected
pattern: <pattern-id | new>
pattern_version: <number | pending>
gates: <等级与状态>
verifier: pending | accepted | rejected
human_plan_change: true | false
human_product_change: true | false
eligible_clean_run: pending | true | false
completed_at: <UTC timestamp>
```

只有 `eligible_clean_run: true` 计入连续成功。最终证据提交只能更新交付信息；如混入产品、测试或
策略变化，撤销产品验收并重新验证。

## 停止条件

需求一次澄清后仍有关键歧义；批准证据不可信或 SHA 失配；变化越出批准范围；需要未批准的承重
路径、既有测试或依赖；同一需求连续两次 Gate 失败或验证拒绝；等待人工决定的开放需求超过章程
阈值。停止条件依据语义风险和证据，不使用变更规模数字替代判断。
