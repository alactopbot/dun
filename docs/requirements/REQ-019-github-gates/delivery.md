# REQ-019 交付证据

```text
requirement: REQ-019
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

- 人工 Gate 的唯一渠道设为 GitHub Draft PR，聊天不再构成批准。
- 监督与启动模式在技术方案提交后创建唯一 Draft PR，后续实现、验证和产品验收复用它。
- `factory-gate:v2` 绑定可信 GitHub 身份、Gate 类型和完整提交 SHA，并定义方案与产品漂移规则。
- 巡检与实现流程可以在原 Agent 会话消失后，根据 GitHub 状态恢复方案批准或产品验收后的工作。
- GitHub 增加方案评审与产品验收 PR 标签，诊断脚本检查这些标签是否存在。

## 证据

- 失败先行：修订前 `tests/factory-v2.test.mjs` 因缺少 `humanPolicy.gateChannel` 失败。
- 契约测试：`node --test tests/factory-v2.test.mjs` 通过。
- 真实 Gate：`FACTORY_GATES: level=deep status=GREEN passed=6 failed=0 failing=none skipped=mutation misconfigured=none`。
- Skill 对照：两个跨会话场景中，新版断言通过率为 100%，修订前版本为 60%；主要差异是
  `factory-gate:v2` 方案状态转换和产品验收后的安全收尾。
- 真实流程验证：剑龙 Issue #17 已创建方案 Draft PR #18，等待在 GitHub 上完成技术方案 Gate。

## 待完成

全新上下文独立验证、候选 PR Check 和最终交付证据尚未完成，因此本文件保持 `pending`。
