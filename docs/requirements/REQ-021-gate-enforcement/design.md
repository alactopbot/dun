# REQ-021：GitHub Gate 强制验证

## 原因

PR #20 在独立验证结束前被合并，验证器随后拒绝。机器 Gate 当时只检查代码与规则文本，没有检查
人类决定的原始来源、目标 SHA、漂移、唯一 PR 和独立验证，因此无法阻止提前合并。

## 完整结果

为 PR 增加确定性协议检查。人类必须直接提交含完整 SHA 的 `factory-gate:v2`；Agent 不再规范化
自然语言批准。独立验证使用绑定当前头的 `factory-verification:v2`。GitHub Check 在任一证据缺失、
不可信、陈旧或发生禁止漂移时失败。

## 内部 work units

1. 先新增负向测试，覆盖非可信作者、短或错误 SHA、聊天批准、缺失来源、方案与产品漂移、第二个
   开放 PR、已合并 PR、待方案状态和陈旧验证。
2. 实现无第三方依赖的 `.factory/scripts/validate-pr-gates.mjs`，同时支持测试上下文和 GitHub API。
3. 把协议验证接入 `factory-gates` 工作流，并允许标签状态变化触发重检。
4. 更新契约、skills 与入口文档，删除 Agent 规范化批准的旧规则。
5. 把 REQ-019 的候选交付更正为事后拒绝，删除不可复现的评测百分比。
6. 执行 Deep Gate、创建唯一 Draft PR，并在合并前完成全新上下文独立验证。

## 范围与风险

仅修改 Issue #21 明确列出的 Factory、workflow、测试与需求证据路径，不改变 DUN 产品，不增加依赖。
协议检查依赖 GitHub API 可用性；API 或事件缺失时必须以 `MISCONFIGURED` 失败关闭。

## 验收

- 所有正向和负向协议测试通过；
- PR 缺少当前 SHA 的独立验证时，GitHub Check 为红；
- 验证器发布结构化接受证据并添加标签后，重新触发的 Check 为绿；
- 人类只能在上述条件满足后合并，Agent 永不合并。
