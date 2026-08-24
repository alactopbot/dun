# REQ-021：GitHub Draft/Ready Spec 强制验证

## 原因

PR #20 在独立验证结束前被合并，验证器随后拒绝。机器 Gate 当时只检查代码与规则文本，没有检查
人类决定的原始来源、目标 SHA、漂移、唯一 PR 和独立验证，因此无法阻止提前合并。

## 完整结果

为 PR 增加确定性协议检查，同时保持自然的人工体验。Agent 在同一 Draft PR 提交统一 Spec 与机读
`factory.json`；有问题时人类保持 Draft 并留下普通评论，没有问题时点击 Ready for review。时间线
事件提供操作者、时间与来源，后续 Agent 自动记录当时 PR 头。独立
验证使用绑定当前头的 `factory-verification:v2`。最终合并就是产品验收。

## 产品流程

一个需求始终只使用一个 Issue、一个分支和一个 PR：

1. Agent 从 Issue 形成统一 Spec，把产品设计、技术方案、范围、测试和验收写入 `design.md`，把
   机器约束写入同目录 `factory.json`，然后创建 Draft PR。
2. PR 为 Draft 时代表方案尚未通过。人类有问题只需留下普通 PR 评论；后续 Agent 读取新评论，
   修改同一份 Spec 并推送同一 PR。
3. 人类没有问题时点击 **Ready for review**。这一个动作代表 Spec 通过并允许进入实现。
4. Ready 后如果需要推翻方案，人类点击 **Convert to draft** 并留言；此前的通过立即失效。
5. 实现、测试和独立验证继续使用同一分支和 PR。验证绿色后等待人类合并；合并同时代表产品验收。

人类不需要使用 Files changed 中的 Review changes，不需要写 `方案通过`，也不需要填写提交 SHA、
摘要或其他机器字段。

## 状态机

```text
Issue
  -> Draft PR / wait-to-implement
       -> 普通评论 -> Agent 修订 Spec -> 继续 Draft
       -> Ready for review -> ready-to-implement -> 实现与验证
            -> Convert to draft -> 撤销通过 -> 修订 Spec
            -> 验证通过 -> awaiting-review -> 人类合并
```

- `bootstrap`、`supervised`：要求可信人类产生 Ready for review 事件。
- `trusted`：成熟 Pattern 自动通过 Spec，不等待 Ready；仍由人类最终合并。
- `factory:plan-review` 只表示仍在 Draft 方案阶段；进入实现前必须移除。

## 技术实现

### 1. 机读 Spec

每个需求的 `factory.json` 固定 Issue、唯一 PR、模式、Pattern、允许路径、Gate 等级和人工边界。
`bootstrap`、`supervised` 使用 `humanGates: ["spec-ready", "merge"]`；成熟 `trusted` 只保留
`merge`。验证器逐项检查完整 PR diff，任何路径超出 `allowedPaths` 都失败关闭。

### 2. Ready 提交绑定

`.factory/scripts/validate-pr-gates.mjs` 从 GitHub PR 时间线读取 `ready_for_review` 与
`convert_to_draft`：

- 只接受仓库 Owner 触发的最新 Ready 事件；
- GitHub 当前可能不返回 Ready 事件的 `commit_id`；后续 Agent 在进入实现前把当时 PR 头记录到
  `factory-handoff:v2.approved_plan_sha`，人类无需填写；
- 确认该提交仍是当前 PR 头的祖先；
- 比较 Ready 提交到当前头的 diff。若 `design.md`、`factory.json`、Pattern、项目策略或章程发生变化，
  Ready 自动失效；普通实现代码变化不会让 Spec 失效；
- 最新事件若为 Convert to draft，或 PR 当前仍是 Draft，则禁止进入实现。

GitHub API、时间线、来源或完整 SHA 缺失时不猜测成功，而以红灯或 `MISCONFIGURED` 停止。

### 3. 评论与跨会话恢复

普通 PR 评论只承载自然语言反馈，不承担机器批准。`factory-spec` 和 `factory-monitor` 在 PR 为 Draft
时读取人类新增评论，更新同一 Spec；它们不得替人点击 Ready。Issue 的 `factory-handoff:v2` 只保存
恢复所需摘要，不能扩大 `factory.json` 的权限。新的或定时 Agent 仅凭 Issue、PR 状态、时间线、
评论、分支和 Checks 就能继续，不依赖原 Agent 会话。

### 4. GitHub Check 与独立验证

`factory-gates` 在 PR 推送、标签变化、Ready for review 和 Convert to draft 时重跑：

- Spec 未 Ready、范围漂移、存在第二个开放 PR 或缺少独立验证时保持红灯；
- 实现完成后，全新上下文验证器运行 Deep Gate，并发布绑定当前 PR 头的
  `factory-verification:v2`；
- 只有最新验证结论为接受、`factory:verified` 存在、`factory:rejected` 不存在且所有 Check 绿色，
  才进入等待最终合并状态。

## 内部 work units

1. 新增正负测试，覆盖 Ready for review、Convert to draft、非可信操作者、错误 SHA、Spec 漂移、
   范围外路径、第二个 PR、已合并 PR、陈旧验证和冲突标签。
2. 实现无第三方依赖的 `.factory/scripts/validate-pr-gates.mjs`，同时支持测试上下文和 GitHub API。
3. 把协议验证接入 `factory-gates` 工作流，并允许推送、标签、Ready/Convert 状态变化触发重检。
4. 更新契约、Pattern、skills 与入口文档，删除结构化人工批准、特殊评论关键词和单独产品验收。
5. 把 REQ-019 的候选交付更正为事后拒绝，删除不可复现的评测百分比。
6. 执行 Deep Gate、创建唯一 Draft PR，并在合并前完成全新上下文独立验证。

## 范围与风险

仅修改 Issue #21 明确列出的 Factory、workflow、测试与需求证据路径，不改变 DUN 产品，不增加依赖。
协议检查依赖 GitHub API 可用性；API 或事件缺失时必须以 `MISCONFIGURED` 失败关闭。

## 验收

- 所有 Draft/Ready、范围和验证协议测试通过；
- Draft 中的普通评论能由后续 Agent 当作 Spec 反馈处理，不会被误判为批准；
- Owner 点击 Ready 后，Agent 能记录当时完整 PR 头；Convert to draft 能撤销旧 Ready；
- Ready 后修改 Spec、范围、Pattern 或项目策略会自动失败，普通实现提交不会；
- PR 缺少当前 SHA 的独立验证时，GitHub Check 为红；
- 验证器发布结构化接受证据并添加标签后，重新触发的 Check 为绿；
- 人类只能在上述条件满足后合并，Agent 永不合并。
