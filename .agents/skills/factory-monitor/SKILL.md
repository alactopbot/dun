---
name: factory-monitor
description: 巡检并恢复 GitHub 实时状态、Draft/Ready Spec 状态、证据缺口、停滞认领和 Pattern 退化信号。
---

# Codex Factory 巡检适配器

读取共享契约、项目配置和 `.claude/skills/factory-monitor/SKILL.md`。只根据 GitHub 实时对象与
最终交付证据判断，不依赖 Agent 会话，也不实现产品修复或替人点击 Ready。
