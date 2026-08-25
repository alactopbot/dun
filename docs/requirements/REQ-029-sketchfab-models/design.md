# REQ-029：将馆内 3D 模型替换为可追溯的 Sketchfab 模型

状态：Draft，等待方案审核  
对应 Issue：[#29 把3D模型改为sketchfab.com](https://github.com/alactopbot/dun/issues/29)  
执行路径：普通需求（Pattern：none）  
Gate：实现阶段 `deep`；本次仅 Spec 的 PR 使用 `fast`

## 1. 目标与完成结果

把默认分支现有的三角龙、剑龙和霸王龙运行时模型替换为来自 Sketchfab、允许下载、修改、商业使用和随网页再分发的固定模型，同时保留已经交付的展品内容、安静交互、性能、无障碍和静态回退。

完成时：

- `/exhibits/triceratops`、`/exhibits/stegosaurus` 和 `/exhibits/tyrannosaurus` 使用本 Spec 固定的三个 Sketchfab 模型，不再把 Quaternius 模型作为运行时模型；
- 每个模型的详情页、UID、作者、下载日期、下载时许可证、许可证 URL、标准署名、原始归档文件名/字节数/SHA-256、处理步骤和最终 GLB SHA-256 都可从仓库追溯；
- 页面来源面板和资产 manifest 从真实数据展示作者、Sketchfab 来源、CC BY 4.0 与 DUN 修改，不再硬编码旧模型归属；
- 模型变化后重新生成 poster 与缩略图，并保持模型、presentation 和派生图像的哈希绑定；
- 三个展品在桌面 Web 满足静态素材预算和浏览器加载/交互检查；移动端保持响应式，并在低性能、无
  WebGL 或模型失败时仍可阅读完整展品和完成导航；
- `./.factory/scripts/gates.sh deep` 为 GREEN，当前 PR head 通过独立验证。
- 当前需求分支包含 main 上已交付的三只动物；Factory hook 允许非受保护需求分支同步默认分支，同时
  继续阻止受保护分支 merge、产品 PR merge、受保护分支 push 与 force push。

## 2. 范围决定

本需求只替换默认分支当前已发布的三角龙、剑龙与霸王龙模型。霸王龙已由 Issue #27 / PR #28 在 2026-08-25 合入 `main`，因此本需求必须把它与另外两只动物作为同一个可验收迁移结果处理。之后才进入 `main` 的动物不属于本需求；它们应在自己的 Issue、分支和 PR 中保持独立授权与证据。

“来自 Sketchfab”指实现阶段从已登录账号通过官方模型页下载选定归档、离线审查和处理后，把允许再分发的自包含 GLB 作为 DUN 静态资产托管。不得在儿童页面嵌入 Sketchfab viewer、运行 Download API、要求访客登录、加载第三方脚本或向 Sketchfab 发送儿童的运行时访问数据。

## 3. 非目标

- 不新增动物、事实、页面、路由、账户、上传、评论、收藏或 Sketchfab API 集成。
- 不改变现有背景的创作归属；只有与新模型绑定的 poster 和缩略图必须重做，背景仅在真实可读性检查失败时才按现有 DUN 流水线重做。
- 不增加声音、自动播放、攻击/奔跑动作、评分、竞争、惊吓效果或运行时 AI。
- 不重写公共 Three.js 展示器、schema 或 catalog；只做承载真实来源数据和新模型所必需的最小修改。
- 不创建或扩大 Factory Pattern，不修改技术计划或项目许可证。Factory 治理修改仅限解决本需求已经
  触发的 base→feature 分支同步误拦截，不扩大 Agent 的产品合并或发布权限。

## 4. 用户可见体验

- 页面结构、双语正文、观察问题、事实卡片、来源链接、馆藏导航和离屏活动保持不变。
- 服务端首帧仍输出背景、poster、文本替代和全部正文；JavaScript、WebGL 或 GLB 失败时仍显示完整静态展品。
- 用户继续通过拖动以及“左转、右转、放大、缩小、恢复初始视角”按钮观察；按钮名称、44×44px 目标和键盘操作不变。
- 新模型如果没有可接受的安静 Idle，就以静态模型按需渲染；不得伪造、循环攻击动作或为满足动画指标强行制作不自然动作。
- 来源面板分别显示：模型标题、作者、Sketchfab 详情页、`CC BY 4.0`、DUN 的修改摘要和运行时 SHA-256；同时明确模型是艺术复原而非科学来源。

## 5. 固定模型与权利决定

### 5.1 选定模型

人类把本 Draft PR 设为 Ready，即只批准以下三个固定 UID 进入下载与审查：

1. 三角龙：[Triceratops](https://sketchfab.com/3d-models/triceratops-27fdbc94f05b4e0c844db6fd679b2265)，UID `27fdbc94f05b4e0c844db6fd679b2265`，作者 `JZG`。页面在 2026-08-25 显示可下载、`CC Attribution`，约 7.2k triangles；作者明确说明自行创作，并列出 ZBrush、Blender、Substance Painter、Marmoset Toolbag 和 Photoshop 的制作流程。
2. 剑龙：[Stegosaurus - Low Poly Dinosaur](https://sketchfab.com/3d-models/stegosaurus-low-poly-dinosaur-9776fff241a54639b184d25a2777f63f)，UID `9776fff241a54639b184d25a2777f63f`，作者 `Billy Jackman`（`billyjackman3d`）。页面在 2026-08-25 显示可下载、`CC Attribution`，约 3.0k triangles；作者明确说明自行制作，并链接了创作过程视频。
3. 霸王龙：[Tyrant King - Tyrannosaurus](https://sketchfab.com/3d-models/tyrant-king-tyrannosaurus-6465a297fa784598adc49f6e0042d449)，UID `6465a297fa784598adc49f6e0042d449`，作者 `Marcel Schanz`（`mschanz`）。页面在 2026-08-25 显示可下载、`CC Attribution`、明确写有 `commercial use permitted`，约 59.3k triangles；作者列出其 ZBrush 雕刻、PBR 贴图和游戏模型制作信息。

三页的许可链接均指向 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)。CC BY 4.0 允许复制、再分发与改编（包括商业用途），条件是提供适当署名、许可证链接并说明修改。DUN 必须把作者与 Sketchfab 来源归属随模型、credits 和可再分发构建产物一起保留。

### 5.2 候选比较

按技术计划的 100 分量表评估；权利不足 25 分即淘汰：

| 候选 | 权利 | 科学 | 视觉 | 性能 | 动画 | 可修复 | 儿童体验 | 合计 | 决定 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| JZG Triceratops | 25 | 12 | 13 | 14 | 0 | 9 | 4 | 77 | 选定 |
| wojciechmiedziocha Triceratops | 25 | 12 | 14 | 7 | 0 | 9 | 4 | 71 | 低于 75，拒绝 |
| Billy Jackman Stegosaurus | 25 | 11 | 12 | 15 | 0 | 9 | 5 | 77 | 选定 |
| Artec 3D Stegosaurus Skeleton | 25 | 20 | 8 | 0 | 0 | 1 | 4 | 58 | 低于 75，拒绝 |
| Marcel Schanz Tyrant King | 25 | 12 | 13 | 12 | 0 | 9 | 4 | 75 | 选定，下载后复核贴图与安静姿态 |
| hsejira Accurate Tyrannosaurus rex | 0 | 12 | 13 | 13 | 0 | 5 | 3 | 46 | 页面声明来自 Prehistoric Kingdom，原权利链不足，拒绝 |
| TimFallas Tyrannosaurus | 0 | 8 | 9 | 13 | 6 | 3 | 2 | 41 | 页面声明来自 ARK: Survival Evolved，原权利链不足，拒绝 |
| IagoMendez Tyrannosaurus rex | 0 | 8 | 10 | 13 | 0 | 3 | 2 | 36 | 页面声明来自 1993 Jurassic Park，原权利链不足，拒绝 |

搜索中还发现多种 `CC BY-NC`、品牌游戏提取、转存、来源链不清或仅 view-only 的候选；即使页面显示“可下载”或上传者自行选择了 CC BY，也不能覆盖原权利人的版权，因此全部拒绝。Smithsonian CC0 三角龙骨架可追溯，但属于装架标本且原始 GLB 约 38 MB、没有安静生命复原，不适合替换当前活体观察模型。

### 5.3 下载与停止边界

实现开始后必须通过三个选定详情页各自的官方 Download 入口取得归档，并在入库前保存页面可见的作者、UID、许可和下载日期证据。不得读取浏览器 cookie、local storage、密码或 token，也不得把账号凭据提交到仓库。

下载后先在隔离工作目录中记录原始文件名、格式、字节数和 SHA-256，并核对归档内部许可证、贴图、名称和来源是否与页面一致。任一选定模型出现以下情况，就停止素材入库、在 Issue 留下证据并把同一 PR 转回 Draft：

- 页面不再可下载或不再是 CC BY 4.0；
- 归档包含未说明的第三方素材、品牌游戏资产、限制性许可证、外链、脚本、Logo 或水印；
- 作者/来源不能支持网页再分发，或无法保存下载时的许可证据；
- 模型形态、儿童体验、技术完整性或优化后质量不能通过审查。

不得自行换用相似模型、商店模型、缓存字节或搜索结果中的另一个 UID。

## 6. 素材处理与 provenance

- 只把允许再分发的证据、处理说明和最终运行时资产提交仓库；临时下载与工作文件留在忽略的 `asset-workbench/`。
- 用隔离的 Blender LTS 导入数据，禁用未知脚本；删除相机、灯光、文字、Logo、外链和不适合儿童的动作。
- 保持 +X 朝向、+Y 竖直、脚底 Y=0、自包含 glTF 2.0 GLB；修复法线、材质、UV 和贴图，并只保留一个合格 `Idle`，否则静态交付。
- 三角龙复核四足体态、三只面角和颈盾；剑龙复核四足体态、背板序列和尾刺；霸王龙复核双足体态、比例、前肢与头骨轮廓，并拒绝张口扑咬、血腥或惊吓姿态。模型不是科学来源，不根据模型颜色、姿态或细节改写儿童事实。
- 最终 GLB 目标 8–12 MiB、硬上限 20 MiB；三角形目标 100k、硬上限 250k；draw calls 目标 12、硬上限 24；纹理最长边不超过 2048；单动物完整包硬上限 23 MiB。
- 按 `docs/MUSEUM_TECHNICAL_PLAN.md`，桌面 Web 是本需求的正式性能基线。实现记录三个最终 GLB 的字节、
  三角形、draw calls、纹理数与最大尺寸，并在桌面浏览器检查加载、首帧和交互；真机 FPS、解析时间和
  内存采样可作为后续优化观察，但不是本需求的交付硬门。
- 每个 `model-source.md`、`model-license.txt`、处理记录和 manifest 保存选定 UID、作者、详情页、许可证 URL、标准署名、下载时间、原始与运行时哈希、允许修改/商业使用/网页再分发的结论及全部修改步骤。
- 由最终 GLB 和现有/调整后的 presentation 重新生成横竖 poster 与 thumbnail；更新派生哈希。背景未改变时保留原文件、哈希和 DUN CC BY-SA 4.0 归属。

## 7. 技术方案与影响范围

- `content/exhibits/{triceratops,stegosaurus,tyrannosaurus}/**`：更新模型 provenance、evidence、manifest，必要时更新 presentation；属于承重路径。
- `public/museum/animals/{triceratops,stegosaurus,tyrannosaurus}/**`：替换三个 GLB 和哈希绑定的 poster/thumbnail；必要时才重做背景；属于承重路径。
- `app/exhibits/[slug]/page.tsx` 与 `lib/exhibits/**`：让来源面板从 manifest/provenance 读取真实模型标题、作者、来源、许可与修改摘要，移除 Quaternius 硬编码；属于承重路径。
- `scripts/assets/**`：仅在现有校验无法 fail closed 检查 CC BY 必需字段、固定 UID、署名或派生哈希时扩展。
- `tests/**`：增加模型来源、许可、UID、credits、哈希、预算、静态模型和回退回归；测试属于承重范围。
- `.factory/hooks/block-merge.sh`、`docs/factory/{CONTRACT,GITHUB}.md`、`tests/factory-hook.test.mjs`：允许非
  受保护需求分支同步默认分支，继续 fail closed 阻止产品合并、受保护分支写入与强推；属于承重范围。

不新增依赖，不修改 `package.json`、lockfile、`docs/MUSEUM_TECHNICAL_PLAN.md`、`LICENSE`、`CONTENT-LICENSE.md`、
除上述 hook 外的 `.factory/**`、`.agents/**`、`.codex/**`、`AGENTS.md` 或发布配置。实现若证明必须越出
以上范围、改变依赖或既有产品/测试语义，先把同一 PR 转回 Draft 审核。

## 8. 必须保持的不变量

- 无账户、广告、行为追踪、自动播放、评分、竞争、惊吓效果或运行时 AI；儿童页面不连接 Sketchfab。
- 三个展品的双语事实、来源映射、观察问题、照护者提示、导航、背景归属和返回路径不丢失。
- Canvas 不承载唯一内容；SSR、无 JavaScript、无 WebGL 和 GLB 失败状态均可完整阅读和导航。
- 单页一个 Canvas/Renderer；不锁定全局滚动；键盘、200% 缩放、响应式和减少动态效果保持可用。
- 第三方模型必须允许修改、商业使用和网页再分发；许可、作者、Sketchfab 来源、修改和哈希完整可追溯。
- 代码继续使用 AGPL-3.0；DUN 原创背景和派生图像继续使用 CC BY-SA 4.0；三个第三方模型及其修改保留 CC BY 4.0。
- feature 分支同步不能获得向受保护分支写入、强推、调用 GitHub merge API 或完成产品合并的权限；仅在
  PR 最终验证前吸收已批准的默认分支历史。

## 9. 实现顺序

1. 用回归测试证明旧 hook 会误拦截 feature 分支同步和正文命令文本；修复 hook 后同步当前 main，并保持
   产品合并、受保护分支与 force push 阻止边界。
2. 增加失败测试，证明当前 manifest/credits 仍指向 Quaternius、当前 poster 与旧模型哈希绑定。
3. 从三个固定 Sketchfab 页面下载归档并保存许可、作者、UID、原始文件和 SHA-256 证据；先做权利与内容审查，任一失败即转回 Draft，不能留下只迁移部分馆藏的结果。
4. 在隔离 Blender 流水线中规范化、清理和优化三只模型；运行现有 inspect、预算和 Khronos Validator。
5. 替换 GLB，更新 provenance、manifest、credits 数据和必要的 presentation；重新生成并绑定 poster/thumbnail。
6. 用公共 viewer 验证静态/动画分支、交互、失败回退、资源释放和单 Renderer，不为单只动物复制展示器逻辑。
7. 完成自动测试、六个已批准视口、200% 缩放、减少动态效果、桌面浏览器加载/交互、移动端响应式与
   降级可用，以及来源面板检查。
8. 运行 `./.factory/scripts/gates.sh deep`，再由隔离的新 Agent 使用 `factory-verify` 对当前完整 SHA 冷读验证。

## 10. 测试与验收

### 10.1 自动与资产测试

- hook 测试覆盖：feature 分支允许 `git merge origin/main`，受保护分支 merge 被阻止，abort/quit 可恢复，
  PR merge/API、受保护分支 push、所有 force push 继续被阻止，Issue/PR/comment 正文提到命令不误判。
- manifest 对缺失/错误 UID、作者、详情页、CC BY 4.0、署名、原始哈希、运行时哈希和再分发结论 fail closed。
- 只允许本 Spec 固定的三个 UID；仍引用 Quaternius、未知 Sketchfab UID、NC/ND/Editorial/view-only 或品牌提取来源时失败。
- GLB 为自包含 glTF 2.0，不含外部资源、相机、灯光、文字/Logo 节点；尺寸、三角形、纹理和 draw call 在预算内。
- poster/thumbnail 的 `modelSha256` 和 `presentationSha256` 与最终文件一致；旧派生图不能通过构建。
- 来源面板对三只动物分别输出正确标题、作者、Sketchfab 链接、CC BY 4.0、修改说明与运行时哈希，不再出现 Quaternius 运行时归属。
- 三个既有路由、首页入口、事实卡片、来源链接、循环导航、键盘控制、失败回退、reduced motion 和资源销毁测试保持通过。

### 10.2 人工与性能验收

- 在 320×568、375×667、390×844、768×1024、1024×768、1440×900 及低高度横屏检查：无裁切/横向滚动，模型轮廓可读，控制至少 44px，poster 到首帧无明显跳位。
- 只用键盘可旋转、缩放、重置和离开舞台；200% 缩放可阅读与导航；减少动态效果下没有自动旋转或淡入。
- 模型加载失败时保留背景、poster、正文和一次主动重试；不循环请求 Sketchfab 或任何第三方域名。
- 在桌面 Web 记录三个最终 GLB 的字节、三角形、draw calls、纹理数/最大尺寸，并检查加载、首帧和交互；
  移动端只要求响应式与完整降级可用，不要求提供真机 FPS、解析时间或内存证据，也不设置 30fps 交付硬门。
- 人工将最终模型与现有权威科学来源支持的可观察形态对照，并确认没有血腥、攻击姿态、品牌标志、水印或惊吓动作。

## 11. 风险与回滚

- 最大风险是上传者误授权、下载时许可漂移和归档内第三方内容；以固定 UID、下载时证据、原创过程说明和 fail-closed 停止处理。
- 静态模型可能降低“生命感”，但比不自然或攻击动画更符合 DUN；交互旋转、缩放和观察引导仍成立。
- 新模型的材质与既有背景可能不协调；先调整 DUN 灯光/presentation，只有必要时才重做背景，且不得改变科学事实。
- hook 解析器若漏拦截真实合并命令或误拦截普通正文，会削弱治理或再次阻塞恢复；用受保护/非受保护分支、
  shell wrapper、API、push 与正文用例回归，GitHub ruleset 继续作为最终保护边界。
- 回滚以模型、manifest、provenance、presentation、poster、thumbnail 和 credits 为一个原子单元恢复到上一组已验证资产；不得留下混合作者、旧哈希或失配派生图。
