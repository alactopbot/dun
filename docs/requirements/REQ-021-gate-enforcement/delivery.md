# REQ-021 交付证据

```text
requirement: REQ-021
outcome: corrected
pattern: new
pattern_version: pending
gates: deep GREEN (6 passed, mutation skipped because project has no mutation script)
verifier: accepted
human_plan_change: true
human_product_change: false
eligible_clean_run: false
completed_at: 2026-08-24T12:03:46Z
```

## 候选结果

- 新增可执行 PR 协议验证器，并接入 GitHub `factory-gates`。
- 人工有问题就保持 Draft 并留普通评论，没有问题只点击 Ready for review；Actions 自动保存当时 PR 头。
- 统一 Spec 的机读范围由 `factory.json` 承载并约束完整 diff。
- 独立验证必须使用 `factory-verification:v2` 绑定当前 PR 头。
- 12 组协议测试覆盖 Ready/Convert、Actions 运行头绑定、可编辑交接绕过、完整分页、非可信操作者、
  错误 SHA、Spec 漂移、范围外路径、第二个 PR、陈旧验证、冲突标签和 trusted 自动 Spec。
- REQ-019 已更正为 `rejected`，删除不可复现的评测百分比与不实的 PR #18 等待状态。

## 机器证据

`FACTORY_GATES: level=deep status=GREEN passed=6 failed=0 failing=none skipped=mutation misconfigured=none`

- 候选独立复验：`accepted`，绑定 `2e3ea6f63cf4d9c2a2018f6b7e9ec1eae57d790b`
- 候选必需 Check：GREEN，Actions run `32724951224`
- 本次经历人工方案反馈与独立验证拒绝后修正，因此结果为 `corrected`，不计为 Pattern 干净运行。
