# DUN · 史前动物博物馆

DUN 是面向 2–6 岁儿童及陪伴者的安静、开源史前动物博物馆。教育事实、儿童安全、无障碍和
素材许可属于必须保持的产品不变量。

## 常用命令

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
./.claude/scripts/gates.sh fast
./.claude/scripts/gates.sh full
./.claude/scripts/gates.sh deep
```

## 产品约定

- TypeScript、React 19、vinext 与 CSS 位于 `app/`，Cloudflare 入口位于 `worker/`。
- 优先使用语义化服务端 HTML 和 CSS，仅为明确交互增加客户端 JavaScript。
- 面向儿童与陪伴者共同使用：节奏安静、点击目标大、表达清楚，并支持减少动态效果。
- 禁止自动播放、广告、参与度排序、行为跟踪和儿童画像。
- 不编造科学事实，不直接复用外部文字或媒体；增加内容前记录来源和许可。
- 产品中文为主、英文为辅；代码标识使用英文。

## Factory V2

执行前读取 `docs/factory/CONTRACT.md`、`docs/factory/CHARTER.md`、`.factory/project.json` 和适用
Pattern。一个完整产品需求对应一个 Issue、一个分支、一个 Draft PR；内部 work units 只负责
实现、测试、提交和恢复，不产生额外流程对象。

GitHub Issue、标签、分支和 PR 是实时状态。需求方案和最终交付进入 `docs/requirements/`，机器
证据进入 GitHub Checks 与 V2 结构化评论。

必须遵守：

1. Agent 永不合并；所有交付先创建 Draft PR。
2. Agent 在唯一 Draft PR 提交统一 Spec；有问题时人类留下普通评论并保持 Draft，没有问题时点击
   Ready for review，聊天不批准流程。
3. GitHub Ready 时间线自动绑定 Spec 提交；人类不填写关键词、SHA、摘要或结构化协议，Agent 不替人
   点击 Ready for review。
4. 既有测试语义变化必须进入 Spec 并通过 Ready 状态确认，或属于成熟 Pattern 的明确允许变化。
5. Gate 失败关闭；`MISCONFIGURED` 和必需检查跳过都不算通过。
6. 写作者不能给自己验收，必须使用全新上下文独立验证。
7. 范围由完整需求、允许路径、Pattern 不变量、风险和证据控制。
8. 最终人工合并同时代表产品验收，不增加独立产品验收确认。
9. 面向人的工作文档、Issue/PR 和结论使用中文。

以下情况停止并明确交还人类：需求一次澄清后仍有关键歧义；需要未经批准的承重路径、既有测试
或新依赖；变化越出 Pattern；同一需求连续两次 Gate 失败或验证拒绝；等待人工决策的开放需求
超过章程阈值。
