# DUN Factory 章程

本文件承载人类确认过的项目边界。执行规则见 `docs/factory/CONTRACT.md`，可机读配置见
`.factory/project.json`。Agent 可以根据 GitHub Issue 在唯一 Draft PR 提议修改本文件或 Factory
自身规则；只有可信人类把该 PR 标为 Ready for review 才能批准提议，聊天记录不构成授权。

```
CHARTER_STATUS: ready
TIER: greenfield
```

## 承重路径

下列路径需要 Deep Gate 和人类阅读；进入这些路径本身不是错误，但必须已在本次需求中明确批准：

```
LOAD_BEARING:
  - "content/**"
  - "public/media/**"
  - "ATTRIBUTION*"
  - "LICENSE*"
  - "package.json"
  - "package-lock.json"
  - "next.config.*"
  - "vite.config.*"
  - "worker/**"
  - ".github/workflows/**"
  - ".factory/**"
  - ".claude/**"
  - ".agents/**"
  - ".codex/**"
  - "AGENTS.md"
```

```
TESTS_ARE_LOAD_BEARING: true
```

既有测试的语义变化必须写入统一 Spec，并由可信人类将同一 GitHub Draft PR 标为 Ready；成熟
Pattern 明确允许的机械迁移可自动通过。聊天记录不作为授权来源。新增测试文件不受
此限制，但仍需证明它能够在旧行为上失败。

## 可自动处理的工作

```
AUTOMATABLE:
  - 不改变教育事实的格式、文档和注释修正
  - 保持已批准产品行为的无障碍修复
  - 为既有行为增加新的测试文件
  - 有可复现失败证据且不越出已批准 Pattern 的缺陷修复
  - 完整落在成熟 Pattern 允许范围内的产品需求

NEEDS_SPEC:
  - 尚未匹配任何 Pattern 的用户可见能力
  - Pattern 未覆盖的教育事实、叙事、翻译或家长提示
  - 新的图片、三维模型、音频、字体、数据集或外部资产来源
  - 新的账号、存储、网络、分析或遥测行为
  - 新生产依赖、依赖大版本变化、公共 API 或导出类型变化
  - 超出 Pattern 允许变化或可能破坏其不变量的工作

NEVER_AUTOMATE:
  - 合并决定
  - 未经批准的架构方向和依赖选择
  - 广告、参与度排序、自动播放、行为跟踪或儿童画像
  - 移除署名、许可、隐私、无障碍或减少动态效果保护
  - 章程、项目配置和 Pattern 都未覆盖的工作
```

未覆盖意味着停止并请求判断，不代表可以自行扩展权限。

## 完成定义

```
DONE:
  - 规定等级的 gates.sh 最终报告 FACTORY_GATES status=GREEN
  - 行为变化具有能在旧实现上失败的测试或等价证据
  - 既有测试的修改已写入 Spec 并由可信人类将 PR 标为 Ready
  - 完整需求已实现，且没有越出交接与 Pattern 允许范围
  - Pattern 的全部不变量得到验证
  - 全新上下文的独立验证器已接受
  - Draft PR 用中文清楚说明产品结果、证据、风险与人工决策点
```

## Gate 等级

```
GATES:
  default: full
  load_bearing: deep
  docs_only: fast
```

本次 Factory V2 升级触及承重路径，因此必须执行 Deep Gate。

## 停止与背压

```
STOP_IF:
  - 同一需求的 Gate 连续两次失败
  - 独立验证连续两次拒绝
  - 需求在一次澄清后仍有会改变结果的歧义
  - 需要进入未获批准的承重路径、修改既有测试或引入依赖
  - 变化超出交接允许范围或 Pattern 边界
  - 超过 3 个开放需求正在等待人工决策
```

范围控制依据需求语义、允许路径、Pattern 不变量和验证证据，不依据文件数或代码行数。

## Pattern 校准

- 新模式以 `bootstrap` 运行，首个完整需求用于建立规范和验收基线。
- `supervised` 模式只保留统一 Spec 的 Draft/Ready 决定；最终合并同时代表产品验收。
- 达到 Pattern 的连续干净执行条件后可晋级 `trusted`。
- `autonomous` 是可机读的未来级别，当前项目禁用，不能由 Agent 自行启用。
- 任何拒绝、人工纠正、逃逸缺陷、越界或 Pattern 升版都会触发降级评估。
- 自治等级不改变项目级人工合并规则。

```
LAST_REVIEWED: 2026-08-24
NEXT_REVIEW: 2026-09-21
```
