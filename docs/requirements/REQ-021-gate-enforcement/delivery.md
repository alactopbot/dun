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
- 人工 Gate 必须由可信人类直接提交，包含完整 SHA；GitHub 评论元数据作为原始来源。
- 独立验证必须使用 `factory-verification:v2` 绑定当前 PR 头。
- 5 组协议测试同时覆盖可信正例与非可信作者、短或错误 SHA、聊天批准、来源缺失、方案漂移、
  产品漂移、第二个 PR、已合并 PR、待方案状态和陈旧验证。
- REQ-019 已更正为 `rejected`，删除不可复现的评测百分比与不实的 PR #18 等待状态。

## 机器证据

`FACTORY_GATES: level=deep status=GREEN passed=6 failed=0 failing=none skipped=mutation misconfigured=none`

GitHub 候选 Check 和全新上下文独立验证完成前，`outcome`、`verifier` 与
`eligible_clean_run` 保持 `pending`。
