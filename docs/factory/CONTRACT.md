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
- `docs/requirements/REQ-*/factory.json`：与 Spec 一同确认的机读范围和流程配置。
- 同一个 PR：Draft 阶段的 Spec、实现、反馈、独立验证和最终合并。
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
3. 人类直接使用 PR 状态和普通评论：
   - 有问题：保持 Draft，在 PR 留下普通评论；Agent 在同一 PR 修改 Spec。
   - 没问题：点击 **Ready for review**，表示 Spec 通过并允许进入实现。
   - 已经 Ready 后需要撤销：点击 **Convert to draft** 并留下评论。
4. 后续 Agent 读取 PR 状态与最新可信时间线事件。Draft 时处理反馈并继续等待；Ready 时移除
   `factory:plan-review`，把 Issue 设为 `factory:ready-to-implement`。
5. Ready 时间线事件记录可信操作者和时间，对应 Factory Gates Actions 运行记录不可变地保存当时
   PR 头。Agent 只把该值镜像为 `approved_plan_sha`；Gate 以 Actions 记录为准并要求两者一致，再
   校验祖先关系与其后 diff。Spec 或策略在 Ready 后变化会自动使通过失效；普通实现提交不会。

人工只审阅产品和技术内容，不填写关键词、SHA、摘要或结构化协议。Agent 可以因 Spec 漂移把 PR
转回 Draft，但不得替人点击 Ready for review。

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
  "humanGates": ["spec-ready", "merge"],
  "allowedPaths": ["app/**", "docs/requirements/REQ-017-stegosaurus/**"],
  "gateLevel": "deep"
}
```

`validate-pr-gates.mjs` 验证该文件与 Issue、PR、Ready 事件、完整 diff 一致，并拒绝范围外路径、
第二个开放 PR、已关闭 PR、非可信 Ready、Ready 后 Spec 漂移和未完成的方案确认。

## Issue 状态

| 标签 | 含义 |
|---|---|
| `factory:ready-to-spec` | 等待形成或修订 Spec |
| `factory:wait-to-implement` | Draft PR 正在等待反馈或 Ready for review |
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
human_gates: spec-ready=required | automatic, merge=required
review_pr: <唯一 PR 编号>
approved_plan_sha: <Actions Ready 运行头的只读镜像 | automatic | pending>
created_at: <UTC timestamp>
```

## 实现与验证

1. 校验最新可信 Ready 事件、`factory.json`、唯一 PR、允许路径和通过后的 Spec 漂移。
2. 复用已有分支和 Draft PR，按内部 work units 测试驱动实现。
3. 新依赖、既有测试语义变化、承重路径或 Pattern 外变化必须先写入 Spec，把同一 PR 转回 Draft
   并重新等待 Ready for review。
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

需求一次澄清后仍有关键歧义；PR 仍是 Draft 或已被转回 Draft；Spec 或范围漂移；需要未写入 Spec 的依赖、
既有测试语义变化或承重路径；同一需求连续两次 Gate 失败或验证拒绝；等待人工决定的开放需求超过
章程阈值。停止条件依据语义风险和证据，不使用规模数字替代判断。
