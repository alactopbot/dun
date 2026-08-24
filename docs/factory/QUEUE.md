# Factory queue snapshot

The operational queue lives in GitHub issue labels. This file is a reviewable snapshot
written by `factory-triage` and reported by `/factory`; implementation routines query
GitHub directly.

An unmerged update to this file must never block a later routine from seeing work. Durable
run evidence lives in one file per run under `docs/factory/runs/`.

**Dispositions**

| Disposition | Next stage |
|---|---|
| `ready-to-implement` | factory-implement picks it up |
| `ready-to-spec` | human runs factory-spec |
| `needs-info` | parked, question is on the issue |
| `wait-to-implement` | parked, blocker named below |
| `awaiting-review` | PR open, human owns it |
| `done` | merged by a human |

The corresponding live labels use the `factory:` prefix, for example
`factory:ready-to-implement` and `factory:awaiting-review`. The live issue also carries a
`factory-handoff:v1` comment with the fields needed by implementation.

---

## FQ-3：让 npm test 自动发现项目测试

- disposition: done
- source: https://github.com/alactopbot/dun/issues/3
- last_triaged: 2026-08-24
- files_expected: package.json
- load_bearing: true
- gate_level: deep
- done_when: `scripts.test` 保留先构建再使用标准 `node --test` 发现测试的行为；无关包信息和现有测试不变；包配置断言证明修订有效；`npm test` 能发现入口测试；Deep gates 为绿色
- confidence: high
- notes: 已由人工在 2026-08-24 合并 PR #8 完成。

## FQ-4：连接三角龙探路展品

- disposition: done
- source: https://github.com/alactopbot/dun/issues/4
- last_triaged: 2026-08-24
- files_expected: app/page.tsx, app/exhibits/triceratops/page.tsx, tests/triceratops-route.test.mjs
- load_bearing: false
- gate_level: full
- done_when: 入口链接到服务端渲染的三角龙路由并包含已批准的语义化占位结构；新路由测试和原入口测试都会运行；Full gates 为绿色
- confidence: high
- notes: 已由人工在 2026-08-24 合并 PR #10 完成。

## FQ-5：添加经过核实的中英双语三角龙内容与原创插画

- disposition: done
- source: https://github.com/alactopbot/dun/issues/5
- last_triaged: 2026-08-24
- files_expected: content/exhibits/triceratops.ts, app/exhibits/triceratops/page.tsx, public/media/triceratops/exhibit.webp, tests/triceratops-content.test.mjs
- load_bearing: true
- gate_level: deep
- done_when: 已批准的三条有来源事实、双语提示、来源记录、同步校验和有署名的原创复原图替换所有内容与媒体占位；内容测试证明替换有效；Deep gates 为绿色
- confidence: high
- notes: 已由人工在 2026-08-24 合并 PR #12 完成。

## FQ-6：应用安静、响应式的三角龙展品视觉样式

- disposition: ready-to-implement
- source: https://github.com/alactopbot/dun/issues/6
- last_triaged: 2026-08-24
- repro: not-attempted（视觉切片依据已批准规格，不是缺陷复现）
- files_expected: app/exhibits/triceratops/page.module.css, app/exhibits/triceratops/page.tsx, tests/triceratops-style.test.mjs
- load_bearing: false
- gate_level: full
- done_when: 页面在不改变事实、来源、媒体和行为的情况下应用已批准的安静响应式视觉契约；样式契约测试证明变更有效；现有路由和内容测试保持绿色；Full gates 为绿色
- confidence: medium
- notes: FQ-5 已由人工合并，唯一依赖已解除；这是当前唯一 ready 项，草稿 PR 仍须人工完成触控与键盘检查。

---
