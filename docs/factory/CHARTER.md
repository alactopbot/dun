# 项目 Factory 章程

本文件承载人类确认的项目边界。只有 GitHub PR 的可信人工决定能批准规则变化，聊天不构成授权。

```text
CHARTER_STATUS: ready
TIER: oss
```

## 承重路径

进入这些路径需要 Deep Gate，并且本次 Spec 必须明确包含。按项目替换示例：

```text
LOAD_BEARING:
  - "package.json"
  - "lockfiles"
  - "package-lock.json"
  - "app/**"
  - "content/exhibits/**"
  - "public/media/**"
  - "public/museum/**"
  - "worker/**"
  - "next.config.ts"
  - "vite.config.ts"
  - "docs/MUSEUM_TECHNICAL_PLAN.md"
  - "LICENSE"
  - "CONTENT-LICENSE.md"
  - ".github/workflows/**"
  - ".factory/**"
  - ".agents/**"
  - ".codex/**"
  - "AGENTS.md"

TESTS_ARE_LOAD_BEARING: true
```

既有测试语义变化必须写入统一 Spec 并通过 Draft/Ready 决定；用户显式启用的 Pattern 明确允许时除外。

## 自动化边界

用具体的项目规则替换占位内容：

```text
AUTOMATABLE:
  - 不改变事实、授权、归属或产品行为的低风险文档与格式维护
  - 用户显式启用的 Pattern 明确允许的完整需求

NEEDS_SPEC:
  - 新展品、儿童可见内容、交互、视觉或无障碍行为
  - 3D 模型、背景、音频及其来源、许可、归属、哈希或科学依据
  - 新依赖、公共 API、路由、数据结构、构建链或 Cloudflare 运行时变化
  - 没有显式 Pattern 或超出 Pattern 的变化

NEVER_AUTOMATE:
  - 合并与发布决定
  - 未经批准的架构方向或权限扩大
  - Agent 自行创建、启用或扩大 Pattern
  - 引入来源不明、禁止修改、禁止再分发、非商业或仅限编辑用途的素材
  - 编造科学事实、来源、许可、归属、审查结论或资产证据
  - 引入账户、广告、行为追踪、游戏化排名、自动播放、惊吓效果或运行时 AI 服务
```

## 完成定义与 Gate

```text
DONE:
  - 规定等级 gates.sh 报告 GREEN
  - 行为变化有旧实现失败、新实现通过的证据
  - 完整需求成立且未越出批准范围
  - 显式 Pattern 的全部允许路径和不变量得到验证
  - 隔离的新 Agent 上下文独立验证接受
  - PR 清楚说明结果、风险和证据
  - 儿童体验、键盘操作、响应式和减少动态效果约束得到验证
  - 正式素材的来源、许可、归属、修改记录和运行时哈希完整可追溯

GATES:
  default: full
  load_bearing: deep
  docs_only: fast
```

## 停止与背压

```text
STOP_IF:
  - 同一需求 Gate 连续两次失败
  - 独立验证连续两次拒绝
  - 一次澄清后仍有改变结果的歧义
  - 需要未批准的承重路径、既有测试变化、依赖或范围
  - 超过 3 个开放需求正在等待人工决定
```

范围依据产品结果、允许路径、Pattern 不变量和证据，不依据文件数或代码行数。

```text
LAST_REVIEWED: 2026-08-25
NEXT_REVIEW: 2026-09-25
```
