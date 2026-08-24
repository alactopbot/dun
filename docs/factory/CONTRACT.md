# Factory V2 执行契约

本契约是 DUN 仓库中 Claude Code 与 Codex 共用的规则。执行前读取 `.factory/project.json`、
`docs/factory/CHARTER.md` 和适用 Pattern。

## 核心单位

一个完整需求对应一个 Issue、一个分支和一个 Draft PR；该 PR 使用 GitHub Draft PR。内部 work units 只用于实现顺序、测试、
语义提交和恢复，不创建额外 Issue、分支、PR 或人工确认。需求边界是用户可独立验收的产品结果，
不由文件、提交或代码行数量决定。

## 权威信息

- Issue：用户需求、讨论和实时状态。
- `docs/requirements/REQ-*/design.md`：产品、技术、素材、风险、测试与验收的统一 Spec。
- `docs/requirements/REQ-*/factory.json`：与 Spec 一同接受 Review 的机读范围和流程配置。
- 同一个 Draft PR：Spec Review、实现、反馈、独立验证和最终合并。
- GitHub Checks 与结构化验证评论：机器证据。

Issue 交接只用于发现与恢复状态，不能扩大 `factory.json` 的权限。聊天记录、Agent 会话和运行转录
都不是批准来源。

## 渐进自治

- `bootstrap`：新 Pattern，人工审阅完整 Spec。
- `supervised`：复用 Pattern，人工审阅本次差异化 Spec。
- `trusted`：完整落在成熟 Pattern 内，Spec 自动通过。
- `autonomous`：只有项目策略显式开启时可用；DUN 当前禁用。

所有模式最终都由人类合并，合并同时代表产品验收，不再增加单独的产品验收评论。验证拒绝、人工
修改 Spec、逃逸缺陷、越界或 Pattern 升版触发降级评估。

## 单一 PR 的 Spec 流程

1. Agent 从 Issue 形成统一 `design.md` 和 `factory.json`，推送需求分支并创建唯一 Draft PR。
2. `bootstrap` 或 `supervised` 给 PR 加 `factory:plan-review`，Issue 设为
   `factory:wait-to-implement`，然后结束本次运行。
3. 人类使用 GitHub 标准 Review：
   - 没问题：选择 **Approve**；若 PR 作者与人类是同一 GitHub 账号，选择 **Comment** 并让 Review
     第一行写 `方案通过`。
   - 有问题：选择 **Request changes** 并写要求；同账号时选择 **Comment**，第一行写 `需要修改`，
     后续正文写具体反馈。
4. 后续 Agent 读取最新可信 Review。需要修改时重新执行 Spec，更新同一分支和 PR，并再次请求
   Review；通过时移除 `factory:plan-review`，把 Issue 设为 `factory:ready-to-implement`。
5. Review 自带 `commit_id`，Factory 自动绑定方案版本。`design.md`、`factory.json`、Pattern 或项目
   策略在批准后变化会自动使 Review 失效；普通实现提交不会。

人工只审阅产品和技术内容，不填写 SHA、摘要或结构化协议。Agent 不得替人提交 Review。

## 机读 Spec

每个需求在方案阶段创建：

```json
{
  "schemaVersion": 1,
  "requirement": "REQ-017",
  "issue": 17,
  "mode": "supervised",
  "pattern": "animal-exhibit-v1",
  "reviewPr": 18,
  "humanGates": ["spec-review", "merge"],
  "allowedPaths": ["app/**", "docs/requirements/REQ-017-stegosaurus/**"],
  "gateLevel": "deep"
}
```

`validate-pr-gates.mjs` 验证该文件与 Issue、PR、Review、完整 diff 一致，并拒绝范围外路径、第二个
开放 PR、已关闭 PR、陈旧 Review、Review 后 Spec 漂移和未完成的方案评审。

## Issue 状态

| 标签 | 含义 |
|---|---|
| `factory:ready-to-spec` | 等待形成或修订 Spec |
| `factory:wait-to-implement` | Draft PR 正在等待 Spec Review |
| `factory:ready-to-implement` | Spec 已通过或由成熟 Pattern 自动通过 |
| `factory:needs-info` | 缺少会改变结果的信息 |
| `factory:in-progress` | 同一分支和 PR 正在实现或验证 |
| `factory:awaiting-review` | 候选已验证，等待人类最终合并 |

最新可信 Issue 评论保留状态交接：

```text
<!-- factory-handoff:v2 -->
requirement: REQ-<issue-number>
disposition: ready-to-implement | wait-to-implement
mode: bootstrap | supervised | trusted | autonomous
pattern: <pattern-id | new>
pattern_version: <number | pending>
done_when: <完整且可验证的产品结果>
allowed_paths: <factory.json 的只读摘要>
load_bearing: true | false
gate_level: fast | full | deep
human_gates: spec-review=required | automatic, merge=required
review_pr: <唯一 PR 编号>
approved_plan_sha: <Review commit_id | automatic | pending>
created_at: <UTC timestamp>
```

## 实现与验证

1. 校验最新可信 Review、`factory.json`、唯一 PR、允许路径和批准后的 Spec 漂移。
2. 复用已有分支和 Draft PR，按内部 work units 测试驱动实现。
3. 新依赖、既有测试语义变化、承重路径或 Pattern 外变化必须先写入 Spec，在同一 PR 重新 Review。
4. 执行规定等级 Gate；缺失、跳过或 `MISCONFIGURED` 都不算绿色。
5. 写 `verifier: pending` 的候选 `delivery.md` 并推送同一 PR。
6. 全新上下文独立验证完整需求、Pattern、diff、测试和 GitHub 状态。
7. 接受时验证器在 PR 发布绑定当前头的证据并加 `factory:verified`：

```text
<!-- factory-verification:v2 -->
requirement: REQ-<issue-number>
decision: accepted
verified_sha: <当前完整提交 SHA>
```

更晚的拒绝、`factory:rejected`、陈旧 SHA 或缺失标签都会使 Check 失败。最终证据提交后，原验证
上下文必须重新核对并发布绑定新头的接受证据。

## 最终交付

每个需求只有一份 `delivery.md` 和一条最终 Issue 评论：

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

验证与 Check 绿色后，Issue 进入 `factory:awaiting-review`。人类在 GitHub 合并即完成产品验收；
Agent 不转 Ready、不合并、不发布。

## 停止条件

需求一次澄清后仍有关键歧义；最新 Review 要求修改；Spec 或范围漂移；需要未写入 Spec 的依赖、
既有测试语义变化或承重路径；同一需求连续两次 Gate 失败或验证拒绝；等待人工决定的开放需求超过
章程阈值。停止条件依据语义风险和证据，不使用规模数字替代判断。
