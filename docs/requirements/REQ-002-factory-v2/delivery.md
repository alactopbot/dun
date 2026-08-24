# REQ-002 候选交付

```
<!-- factory-delivery:v2 -->
requirement: REQ-002
outcome: pending
pattern: new
pattern_version: pending
gates: deep GREEN
verifier: pending
human_plan_change: true
human_product_change: false
eligible_clean_run: pending
completed_at: pending
```

## 产品结果

- DUN 以一个完整需求对应一个 Issue、一个分支和一个 Draft PR。
- 实现切分只作为内部 work units，不增加 Issue、PR 或人工 Gate。
- `animal-exhibit-v1` 以监督模式开始，连续 3 次干净执行后具备晋级可信模式的条件。
- `autonomous` 作为未来成熟度保留，但当前明确禁用；自动合并和自动发布关闭。
- 实时状态、机器证据和产品决策分别由 GitHub、Checks/结构化评论与需求文档承载。
- V1 队列、状态、逐暂停记录和三角龙分阶段方案已完整归档。
- 面向人的 Factory 文档与输出改为中文，产品与代码语言策略保持不变。
- 范围控制改为需求语义、允许路径、Pattern 不变量、测试、Gate、独立验证和人工合并。

## 验证证据

- `FACTORY_GATES: level=deep status=GREEN passed=6 failed=0 failing=none skipped=mutation misconfigured=none`
- `PROOF: status=PROVEN signal=assertion test_exit=1`
- Factory V2 契约测试通过；DUN 原有 4 项产品测试全部通过。
- 新旧 Skill 对照评测：V2 通过 10/10 条断言，V1 基线通过 4/10 条。
- Doctor 配置检查无失败；GitHub 已要求 PR 和 `factory-gates`，并启用合并后删除分支。

## 待完成

- 全新上下文验证器冷读 Draft PR、完整差异并复跑证据。
- 验证接受后仅更新本文件中的结果字段和完成时间，再确认最终 PR Check。
- 最终合并由人类决定。
