# REQ-025：把剑龙加到博物馆

状态：Draft，等待方案审核  
对应 Issue：[#25 把剑龙加到博物馆](https://github.com/alactopbot/dun/issues/25)  
执行路径：普通需求（Pattern：none）  
Gate：实现阶段 `deep`；本次仅 Spec 的 PR 使用 `fast`

## 1. 目标与完成结果

在 DUN 中增加一个可从博物馆入口发现、可通过 `/exhibits/stegosaurus` 直接访问的剑龙展品。2–6 岁儿童和照护者能够先共同观察静态展品，再由用户主动加载和操作安静的 3D 剑龙；展品包含中英文观察引导、经过来源支持的事实、来源与素材归属，并能从剑龙与三角龙之间导航。

本需求完成时：

- 首页和展品导航能发现剑龙，直接访问 `/exhibits/stegosaurus` 返回服务端渲染的完整展品；
- 剑龙可用鼠标、触摸和键盘按钮旋转、缩放及恢复初始视角，且不把拖动作为唯一交互；
- JavaScript、WebGL、模型下载或解码失败时，背景、poster、全部正文、事实、来源和返回路径仍可用；
- 剑龙与为其建立的公共展示器均符合响应式、键盘、44px 点击目标和减少动态效果约束；
- 所有儿童可见事实都关联权威来源，模型、背景、poster 和缩略图都具备可审计的来源、许可、归属、修改记录与运行时 SHA-256；
- 三角龙被迁移到同一动物 schema、catalog 和展示器契约，证明新增第二只动物不需要复制或分叉核心展示器；
- `./.factory/scripts/gates.sh deep` 为 GREEN，且当前 PR head 通过独立验证。

## 2. 背景与范围决定

当前仓库只有静态的 `/exhibits/triceratops` 页面、单文件三角龙内容和一张展示图；尚无 `three` 依赖、统一动物 schema、素材 provenance 校验、公共展示器、参数化路由或馆藏切换。

`docs/MUSEUM_TECHNICAL_PLAN.md` 要求先完成三角龙 3D 垂直切片，再数据驱动并接入第二只动物。因此“加入剑龙”不能通过复制现有静态页面完成。本需求把以下工作视为同一产品结果的内部顺序：建立素材和 schema 基线、把三角龙迁移为公共展示器的首个垂直切片、再用同一展示器接入剑龙并开放双向导航。它们一起交付、一起验收，不拆分第二套 Issue、分支或 PR。

## 3. 非目标

- 不建设完整 3D 世界、独立 `/museum` 沉浸入口、WebXR、物理引擎、粒子或后处理。
- 不接入第三只动物，不批量迁移整个馆藏。
- 不加入账户、广告、行为追踪、积分、排行榜、自动播放音频、突然动作或攻击演出。
- 不把 Canvas 作为事实、SEO、名称、来源或无障碍文本的唯一载体。
- 不引入 React Three Fiber、Drei、全局状态库或运行时 AI 服务。
- 本需求不创建、启用或扩大 Factory Pattern，不修改 Factory 治理文件。
- 不承诺旁白；本次没有音频资产和音频控制。

## 4. 用户可见体验

### 4.1 发现和导航

- 首页“大地展厅”显示三角龙与剑龙两个明确可聚焦的展品入口，不把整个卡片做成含糊的唯一点击区。
- `/exhibits/triceratops` 与 `/exhibits/stegosaurus` 均保留“返回博物馆”，并提供上一只/下一只动物导航；当前动物通过文本和 `aria-current` 表达，不只依赖颜色。
- 导航使用普通链接，服务端 HTML 中存在，浏览器禁用 JavaScript 时仍可到达。

### 4.2 剑龙展品正文

页面延续“先观察，再打开事实卡片”的安静节奏。首版采用以下可审查文案；实现不得根据模型外观新增事实：

- 名称：`剑龙` / `Stegosaurus`；学名：`Stegosaurus`。
- 引导：`先看看它背上的板和尾巴，再慢慢打开事实卡片。` / `Look at the plates along its back and its tail before opening the fact cards.`
- 三个观察问题：
  1. `它背上的板，从头到尾有什么变化？` / `How do the plates change from head to tail?`
  2. `你能找到尾巴末端的尖刺吗？` / `Can you find the spikes at the end of its tail?`
  3. `如果从另一边看，你想先观察哪里？` / `What would you look at first from the other side?`
- 照护者提示：`先描述看见的形状和位置；背板有什么用途，科学家还没有确定答案。` / `Start with the shapes and positions you can see; scientists are still uncertain what the plates were for.`
- 三张事实卡片：
  1. `“剑龙”的名字意为“屋顶蜥蜴”；它是一种吃植物的装甲类恐龙。` / `The name Stegosaurus means “roof lizard”; it was a plant-eating armoured dinosaur.`
  2. `它生活在约 1.52 亿至 1.45 亿年前的晚侏罗世，用四条腿行走。` / `It lived about 152–145 million years ago in the Late Jurassic and walked on four legs.`
  3. `它背上的骨板竖立在皮肤里；科学家仍不确定这些骨板的用途。` / `The bony plates stood upright in the skin; scientists are still uncertain what the plates were used for.`
- 离屏问题：`离开屏幕后，找一找从小到大排列的形状。` / `Away from the screen, look for shapes arranged from small to large.`

事实 1–3 由 Natural History Museum 的 Stegosaurus 目录页支持；四足行走和背板用途的不确定性同时由该馆的 “A Stegosaurus brought to life” 支持。文案刻意不把颜色、叫声、群居、性别、背板功能或模型姿态表述为确定事实。

### 4.3 舞台与渐进增强

- SSR 首帧输出 `<picture>` 背景、与最终模型参数一致的 poster、文本替代和全部正文。
- 水合后才动态加载 WebGL 展示器；Canvas 透明且 `aria-hidden="true"`。
- 用户可拖动观察，也可使用“左转、右转、放大、缩小、恢复初始视角”按钮；所有按钮具备中文可访问名称和至少 44×44px 目标。
- 模型第一帧准备好后，poster 在 300–450ms 内淡出；减少动态效果下直接替换。
- 加载、解析或 context 失败时保留 poster，并显示克制提示：`这次模型没有来到展台，可以先看静态展品。` 用户可主动重试一次；系统不自动循环重试。
- 不自动播放音频。正常模式只允许非常缓慢的自动旋转，且用户开始操作即暂停；用户停止 4 秒后才可恢复。减少动态效果、省流量模式或页面不可见时永不自动旋转。

## 5. 科学来源

实现时在内容数据中保存来源标题、机构、URL、查阅日期、定位和支持范围；事实卡片必须引用对应 `sourceIds`。

1. Natural History Museum, [Stegosaurus](https://www.nhm.ac.uk/discover/dino-directory/Stegosaurus.html)，查阅日期 2026-08-25。支持名称含义、装甲类植物食性、晚侏罗世 152–145 Ma、美国发现、背板位于皮肤中且竖立、背板用途仍不确定。
2. Natural History Museum, [A Stegosaurus brought to life](https://www.nhm.ac.uk/discover/stegosaurus-brought-to-life.html)，查阅日期 2026-08-25。支持约 1.5 亿年前、四足行走、植物食性，以及背板功能仍属多个假说。
3. American Museum of Natural History, [Colorful Display](https://www.amnh.org/exhibitions/dinosaurs-ancient-fossils/display-or-defense/colorful-display)，查阅日期 2026-08-25。作为照护者资料的交叉来源，支持背板有血管沟槽、可能用于展示或体温调节，但不把任一假说写成儿童事实。

模型和生成背景不是科学来源。来源内容发生实质变化或不能支持上述文案时，回到同一 Draft PR 修订 Spec。

## 6. 模型候选与权利决定

### 6.1 已比较候选

按照技术计划的 100 分候选量表，在只依据公开页面元数据的 Spec 阶段做预评分；下载后的几何、材质、动画和权利证据仍须由验证脚本及人工查看确认。

| 候选 | 权利 | 科学 | 视觉 | 性能 | 动画 | 可修复 | 儿童体验 | 合计 | 决定 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Ferocious Industries, [PBR Stegasaurus (Animated)](https://sketchfab.com/3d-models/pbr-stegasaurus-animated-ec254ea1554941fe8a131f62db0faf3d) | 25 | 10 | 12 | 15 | 8 | 6 | 4 | 80 | 首选入库候选 |
| Artec 3D, [Stegosaurus Skeleton](https://sketchfab.com/3d-models/stegosaurus-skeleton-dc6e1c748484449587b81426d41da6cb) | 25 | 18 | 8 | 0 | 0 | 2 | 4 | 57 | 不作为运行时候选 |

首选页面在 2026-08-25 显示可下载、CC Attribution、约 19.8k 三角面、2K PBR 纹理及动画，满足进入下载审查的最低条件。Artec 候选虽是 Denver Museum of Nature & Science 装架骨架扫描且页面标记 CC Attribution，但约 570 万三角面、包含装架结构且无安静生命复原动画，低于 75 分并超过运行时硬上限，不进入正式制作。

搜索中出现的 CC BY-NC 候选全部拒绝；来自游戏、电影或其他品牌且无法证明上传者拥有再授权权利的模型，即使页面显示 CC BY，也不得使用。

三角龙垂直切片使用同一量表比较以下候选：

| 候选 | 权利 | 科学 | 视觉 | 性能 | 动画 | 可修复 | 儿童体验 | 合计 | 决定 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| JZG, [Triceratops](https://sketchfab.com/3d-models/triceratops-27fdbc94f05b4e0c844db6fd679b2265) | 25 | 10 | 12 | 15 | 0 | 10 | 5 | 77 | 首选入库候选 |
| toaste, [Triceratops Skeleton](https://sketchfab.com/3d-models/triceratops-skeleton-4f4e38e8c70a42f391ed2353a7b4c091) | 25 | 16 | 7 | 15 | 0 | 7 | 4 | 74 | 不作为运行时候选 |

JZG 页面在 2026-08-25 显示模型由上传者使用 ZBrush、Blender、Substance Painter、Marmoset Toolbag 和 Photoshop 创作，可下载、CC Attribution，约 7.2k 三角面；它达到 75 分并避免采用搜索中明确来自 LEGO、Jurassic World、Prehistoric Kingdom 或其他游戏/品牌的上传物。静态模型是允许的：若无法制作可信的安静 Idle，就保持静态并按需渲染。toaste 候选页面虽标记 CC Attribution、约 21.9k 三角面并称为 Melbourne Museum 展品的扫描，但上传者不是馆方且属于装架骨架，不满足本次安静生命复原的产品角色。

### 6.2 首选候选的批准边界

人类把本 Draft PR 设为 Ready，即同意将 Ferocious Industries 剑龙候选与 JZG 三角龙候选作为本需求各自唯一允许下载和审查的模型，但不等于提前认定其可发布。实现开始后必须先：

1. 从直接详情页下载，保存下载日期、原始文件名、字节数、原始 SHA-256、作者、详情页、下载时许可证文本/截图和许可证 URL；
2. 确认许可证为允许修改、商业使用和随网页交付原始/衍生 GLB 的 CC BY 4.0，且页面与归档中没有冲突条款或上游版权风险；
3. 将模型与 NHM 的可观察骨骼特征对照，检查四足姿态、背板排列、尾刺和不带攻击/惊吓动作；
4. 检查所有动画，只保留或制作一个 6–10 秒、首尾闭合、无滑步的 `Idle`；不能可靠修复时保持静态；
5. 在运行时和 poster 中明确称为艺术复原，不把颜色、软组织或动作作为事实。

上述规则同样适用于 JZG 三角龙候选；两者任一项失败就停止素材入库，把 PR 转回 Draft 并报告证据。不得自行换用另一个模型。这样避免在实现中新增未审核的素材决定。

## 7. 背景、poster、缩略图与 provenance

- 为剑龙制作相同色板和光向、但分别构图的 16:9 横版与 9:16 竖版原创环境背景；背景不包含动物、人物、文字、Logo、水印、脚印或烘焙动物阴影。
- 背景若由图像生成工具协助制作，证据必须记录工具/模型、日期、完整提示词、候选哈希、选择理由、人工修改和最终哈希；人工检查地貌/植物合理性，背景不得充当科学证据。
- poster 必须由最终 GLB、presentation、相机拟合、灯光和阴影参数离线生成，而不是另画一只剑龙；另生成 320×320 馆藏缩略图。
- 运行时文件放在 `public/museum/animals/<animal-id>/`，内容包在 `content/exhibits/<animal-id>/` 保存 manifest、provenance、来源和 evidence。
- 每个运行时模型、背景、poster、缩略图都有 `runtimeSha256`；URL 使用哈希或版本查询参数。构建对缺失 provenance、未批准再分发、哈希不匹配或超预算 fail closed。
- 剑龙 GLB 目标 8–12 MiB、硬上限 20 MiB；三角形目标 100k、硬上限 250k；draw calls 目标 12、硬上限 24；纹理最长边不超过 2048。单动物完整包硬上限 23 MiB，其他图像遵守技术计划第 10.6 节预算。

三角龙现有 `public/media/triceratops/exhibit.webp` 可在迁移期间作为降级参考，但正式 3D poster 必须从最终三角龙模型重新生成；其现有 OpenAI 图像生成创作归属和 CC BY-SA 4.0 记录不得删除或错误改写。

## 8. 技术方案

### 8.1 数据和路由

- 建立 `lib/exhibits/schema.ts`，定义统一 `MuseumAnimal`、本地化文本、事实、科学来源、presentation、资产 manifest 和 provenance 类型与运行时校验。
- 在 `lib/exhibits/catalog.ts` 注册唯一的 `triceratops` 与 `stegosaurus`；校验 slug、来源 ID 和资产路径唯一，只有满足发布条件的动物可进入公共 catalog。
- 把三角龙与剑龙内容分别迁移到 `content/exhibits/<slug>/` 包；不复制页面组件或展示器逻辑。
- 使用 `app/exhibits/[slug]/page.tsx` 参数化路由生成 metadata 和页面。已存在的 `/exhibits/triceratops` URL、标题语义、正文、来源及返回路径保持有效；未知 slug 返回 404。

### 8.2 公共 React 组件

- `AnimalStageFallback` 服务端输出背景、poster、文本替代和失败时仍完整的结构。
- `AnimalStage.client` 只在客户端创建/销毁 `ViewerController` 并呈现进度、失败与首次渲染状态。
- `AnimalControls` 提供转向、缩放、重置控制；`AnimalNavigation` 输出 SSR 普通链接；内容面板继续使用原生 heading、list、`details` 和 `summary`。
- 每个展品页面只创建一个 Canvas 和一个 `WebGLRenderer`。缩略图与导航不创建 Canvas。

### 8.3 ViewerController

- 使用原生 Three.js `WebGLRenderer`、`GLTFLoader`、`MeshoptDecoder`、`OrbitControls` 和 `AnimationMixer`；新增固定版本 `three` 与 `@types/three`，不引入 React Three Fiber。
- 加载支持 `AbortController`；缓存有明确上限；切换/卸载时释放 geometry、material、texture、mixer、ImageBitmap、监听器、ResizeObserver 和 animation frame。
- 相机通过模型参考帧 `Box3` 和视口宽高比自动拟合；仅用 `presentation` 处理真实形态差异，不使用逐动物 CSS 位移修补模型。
- 禁止平移和相机翻转，限制上下观察和缩放；相机相对主光/补光保持轮廓可读，接触阴影使用程序生成纹理，不启用实时 shadow map。
- 页面不可见或 Canvas 离开视口时暂停；静态/减少动态效果状态按需渲染。WebGL 2 创建失败立即进入 poster 降级。

### 8.4 素材工具

- 增加固定版本的 glTF inspect/validate/optimize、provenance/hash 校验和 preview 生成脚本，并通过 `package.json` 暴露 `assets:inspect`、`assets:validate`、`assets:previews` 等命令。
- GLB 必须自包含、朝向 +X、竖直 +Y、陆生动物最低点接近 Y=0；不含外部 buffer/纹理、相机、灯光、展示台、文字或水印几何。
- poster manifest 绑定模型哈希与 presentation 哈希；任一变化但未重生成 poster 时构建失败。

## 9. 影响范围与承重路径

预计涉及：

- `package.json`、`package-lock.json`：Three.js 与素材校验/处理工具，属于承重路径；
- `app/**`：参数化展品路由、首页发现入口和样式，属于承重路径；
- `components/museum/**`、`lib/viewer/**`、`lib/exhibits/**`：公共展示器、schema 与 catalog；
- `content/exhibits/**`：三角龙迁移、剑龙内容、来源、provenance 和 evidence，属于承重路径；
- `public/museum/**`、必要时保留的 `public/media/**`：模型、背景、poster、缩略图，属于承重路径；
- `scripts/assets/**`：资产校验、优化和预览生成；
- `tests/**`：迁移并扩展现有测试，测试语义属于承重范围；
- `.gitignore`：忽略本地 `asset-workbench/`，不提交无权再分发的源文件。

不修改 `docs/MUSEUM_TECHNICAL_PLAN.md`、`LICENSE`、`CONTENT-LICENSE.md`、`.factory/**`、`.agents/**`、`.codex/**`、`AGENTS.md` 或发布配置。若实现证明必须修改这些路径、改变既有测试语义、增加未列依赖或改变产品结论，先回到同一 Draft PR 重新审核。

## 10. 必须保持的不变量

- 无账户、广告、行为追踪、评分、竞争、自动播放、惊吓效果或运行时 AI。
- 三角龙现有已核实双语事实、来源映射、观察问题、照护者提示、媒体归属与返回路径不丢失。
- Canvas 不承载唯一内容；SSR、无 JavaScript 和无 WebGL 状态均可完整阅读和导航。
- 不在 `html` 或 `body` 锁定滚动；200% 缩放、键盘、移动端和减少动态效果均可用。
- 第三方模型必须允许修改、商业使用与网页再分发；CC BY-NC、CC BY-ND、Editorial、view-only、来源不明或品牌游戏提取资产一律拒绝。
- DUN 原创内容继续使用 CC BY-SA 4.0；代码继续使用 AGPL-3.0；第三方内容保留自身许可和明确归属。
- 运行时哈希与证据一致；需要的 Gate 不得跳过或报告 `MISCONFIGURED`。

## 11. 实现顺序

1. 在任何模型入库前，锁定依赖并建立 schema、provenance、预算和哈希的 fail-closed 测试。
2. 分别下载并审查本 Spec 唯一允许的 JZG 三角龙与 Ferocious Industries 剑龙候选；保存直接来源、许可和原始哈希证据。任一失败则转回 Draft。
3. 按技术计划处理两个 GLB：Blender 规范化、材质/动画清理、Meshopt + WebP 优化、Khronos Validator 和真实查看器复核。
4. 建立统一 schema、catalog、素材校验脚本和公共 ViewerController，以三角龙完成垂直切片并迁移既有内容测试。
5. 用同一 schema 和展示器接入剑龙；若需要修改核心 ViewerController 才能接入，先修正通用契约和测试，不复制动物专用展示器。
6. 制作并记录横竖背景、poster、缩略图及 manifests，接入首页与展品导航。
7. 完成自动测试、五个基准视口、低高度横屏、200% 缩放、真实手机性能与降级检查。
8. 运行 `./.factory/scripts/gates.sh deep`；再由隔离的新 Agent 使用 `factory-verify` 对当前完整 SHA 冷读验证。

## 12. 测试与验证

### 12.1 先失败、后通过的证据

- 新测试先证明当前 `/exhibits/stegosaurus` 不存在、catalog 不含剑龙、首页无剑龙入口且没有公共 3D 展示器。
- 新资产校验测试先以缺 provenance、错误哈希、超预算或外部纹理的 fixture 失败，再以完整素材包通过。
- Viewer 单元测试先覆盖失败降级、reduced motion、请求中止、相机拟合与销毁，再实现行为。

### 12.2 自动测试

- schema/catalog：slug、来源引用、许可证白名单、状态、路径和哈希唯一；缺字段 fail closed。
- 资产：GLB Validator、自包含引用、动画 clip、有限包围盒、Y=0、预算、图像尺寸、provenance 和 poster manifest。
- Viewer：相机拟合、presentation 默认值、缓存 LRU、AbortController、防过期结果、资源 dispose、WebGL/context failure。
- 组件：首帧前 poster 可见、成功后淡出、失败后保留、按钮调用正确、aria-live 克制、无音频自动播放。
- SSR：两个展品的标题、名称、双语事实、来源、导航、poster 和返回路径存在；未知动物 404；无账户/追踪/游戏化/自动播放。
- 回归：现有三角龙事实与来源测试迁移而不是删除；现有 figure/DOM 契约按统一舞台有计划改写，仍验证唯一舞台、完整正文和静态降级。
- 样式：可见焦点、44px 目标、响应式 portrait 背景、reduced motion、200% 缩放和不锁 body 滚动。

### 12.3 手工与视觉检查

在 360×800、390×844、768×1024、1366×768、1920×1080，以及低高度横屏手机检查 poster、模型首帧、旋转后、来源面板打开、加载失败和 reduced motion。确认动物轮廓未被 UI 裁切、脚与地面接触、横竖背景独立、双语不溢出、键盘顺序合理。

真实中端手机记录每只动物的 GLB 字节数、解析/首帧时间、三角形、draw calls、纹理数量与最大尺寸、平均帧率和内存观察结果；目标移动端至少 30fps。无法取得真实设备证据时 Gate 不应伪装为完整验收，需在 PR 中标明并停止交付。

## 13. 验收标准

- 首页、直接 URL 和展品导航均能发现并访问剑龙。
- 剑龙页面呈现本 Spec 的双语引导、三个观察问题、照护者提示、三张来源绑定事实卡和离屏问题。
- 三角龙与剑龙由同一 schema、catalog、参数化页面和 ViewerController 驱动；每页只有一个 Canvas/renderer。
- 鼠标、触摸和键盘按钮都能完成观察；reduced motion 下无自动旋转和位移过渡。
- 无 JS、无 WebGL、失败和省流量场景保留静态展品、全部正文和导航。
- 模型及所有媒体满足许可、归属、修改、证据、哈希和预算要求；credits 可列出第三方模型信息。
- 三角龙现有内容、来源、无障碍和 SSR 语义无回归。
- 五个视口、200% 缩放、真实移动端性能、自动测试、Deep Gate 和独立验证全部通过。

## 14. 风险与回滚

- **模型权利或上游来源失败**：最高风险。停止入库并把同一 PR 转 Draft；不替换候选、不提交无法再分发的原文件。
- **三角龙模型权利或质量失败**：与剑龙使用相同的 fail-closed 处理；转回 Draft，不以品牌资产、非商业资产或临时占位 GLB 绕过。
- **3D 依赖、Cloudflare 或 vinext 不兼容**：保留 SSR 静态页面，回退客户端增强提交；不牺牲正文或降级体验来保住 Canvas。
- **模型性能超预算**：先优化纹理、材质、draw calls 和几何；超过硬上限则拒绝资产并回到 Draft，而非降低全站 DPR 或删除测试。
- **科学复原与来源冲突**：把不确定性写入说明或拒绝模型；模型不能覆盖机构来源。
- **路由迁移回归**：保留 `/exhibits/triceratops` URL 和 SSR 契约，参数化路由通过后才删除旧的重复页面文件。

代码回滚可以恢复到本需求前的静态三角龙页面和入口；二进制素材、生成背景及其 evidence 必须作为一个可追踪单元一起回滚，不能留下失配 manifest、缓存 URL 或残缺归属。
