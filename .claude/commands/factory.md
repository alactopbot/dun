---
name: factory
description: 用 GitHub 实时状态展示 DUN Factory 控制台，突出当前需要人的决定。
---

# Factory 控制台

读取契约、章程、项目配置、Pattern，并查询开放 Issue、分支、Draft PR、Review、Checks、最新
Spec Review、`factory-verification:v2` 与 `factory-delivery:v2` 评论。只报告，不替人 Review、不合并、不关闭。

支持：`status`（默认）、`next`、`queue`、`stuck` 或指定 Issue 编号。

报告按以下顺序使用中文输出：

1. 当前需要人在 GitHub PR 完成的 Spec Review、修改反馈或最终合并决定。
2. 等待人工决定的开放需求数量与章程背压状态。
3. 正在执行、可执行、待方案、待信息、待依赖和待评审的需求数量与链接。
4. 默认分支和开放 PR 的 Gate 健康状态。
5. 各 Pattern 的成熟度、连续干净执行次数和降级信号。
6. 一个最有价值的下一步及理由。

数据不完整时明确写“不足以判断”，不得从缺少评论或 Check 推断成功。
