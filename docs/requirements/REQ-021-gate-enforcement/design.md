# REQ-021：GitHub Draft/Ready Spec 强制验证

## 原因

PR #20 在独立验证结束前被合并，验证器随后拒绝。机器 Gate 当时只检查代码与规则文本，没有检查
人类决定的原始来源、目标 SHA、漂移、唯一 PR 和独立验证，因此无法阻止提前合并。

## 完整结果

为 PR 增加确定性协议检查，同时保持自然的人工体验。Agent 在同一 Draft PR 提交统一 Spec 与机读
`factory.json`；有问题时人类保持 Draft 并留下普通评论，没有问题时点击 Ready for review。时间线
事件自动提供操作者、提交 SHA、时间与来源。独立
验证使用绑定当前头的 `factory-verification:v2`。最终合并就是产品验收。

## 内部 work units

1. 新增正负测试，覆盖 Ready for review、Convert to draft、非可信操作者、错误 SHA、Spec 漂移、
   范围外路径、第二个 PR、已合并 PR、陈旧验证和冲突标签。
2. 实现无第三方依赖的 `.factory/scripts/validate-pr-gates.mjs`，同时支持测试上下文和 GitHub API。
3. 把协议验证接入 `factory-gates` 工作流，并允许标签状态变化触发重检。
4. 更新契约、Pattern、skills 与入口文档，删除结构化人工评论和单独产品验收。
5. 把 REQ-019 的候选交付更正为事后拒绝，删除不可复现的评测百分比。
6. 执行 Deep Gate、创建唯一 Draft PR，并在合并前完成全新上下文独立验证。

## 范围与风险

仅修改 Issue #21 明确列出的 Factory、workflow、测试与需求证据路径，不改变 DUN 产品，不增加依赖。
协议检查依赖 GitHub API 可用性；API 或事件缺失时必须以 `MISCONFIGURED` 失败关闭。

## 验收

- 所有 Draft/Ready、范围和验证协议测试通过；
- PR 缺少当前 SHA 的独立验证时，GitHub Check 为红；
- 验证器发布结构化接受证据并添加标签后，重新触发的 Check 为绿；
- 人类只能在上述条件满足后合并，Agent 永不合并。
