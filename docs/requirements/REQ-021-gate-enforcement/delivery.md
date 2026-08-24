# REQ-021 交付证据

```text
requirement: REQ-021
outcome: pending
pattern: new
pattern_version: pending
gates: deep GREEN (6 passed, mutation skipped because project has no mutation script)
verifier: pending
human_plan_change: false
human_product_change: false
eligible_clean_run: pending
completed_at: pending
```

## 候选结果

- 新增可执行 PR 协议验证器，并接入 GitHub `factory-gates`。
- 人工有问题就保持 Draft 并留普通评论，没有问题只点击 Ready for review；时间线自带提交 SHA 与来源。
- 统一 Spec 的机读范围由 `factory.json` 承载并约束完整 diff。
- 独立验证必须使用 `factory-verification:v2` 绑定当前 PR 头。
- 8 组协议测试覆盖 Ready for review、Convert to draft、非可信操作者、错误 SHA、Spec 漂移、范围外
  路径、第二个 PR、已合并 PR、陈旧验证、冲突标签和 trusted 自动 Spec。
- REQ-019 已更正为 `rejected`，删除不可复现的评测百分比与不实的 PR #18 等待状态。

## 机器证据

`FACTORY_GATES: level=deep status=GREEN passed=6 failed=0 failing=none skipped=mutation misconfigured=none`

GitHub 候选 Check 和全新上下文独立验证完成前，`outcome`、`verifier` 与
`eligible_clean_run` 保持 `pending`。
