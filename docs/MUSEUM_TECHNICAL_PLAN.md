# DUN 互动史前动物博物馆技术方案

状态：可实施基线<br>
版本：1.0<br>
日期：2026-08-25<br>
适用范围：DUN 的所有史前动物展品、动物切换体验和后续素材入馆流程

## 1. 方案目标

本方案定义一套可以长期扩展的互动博物馆实现方式。后续 Agent 应当按照本方案完成动物模型选取、授权审查、Blender 处理、GLB 优化、原创背景制作、Three.js 展示、内容接入、测试和发布。

最终体验应当满足：

- 每只动物都是真正可旋转、缩放并可播放安静 Idle 动画的 3D 模型。
- 场景有空间感，但不构建高成本的完整 3D 森林、海洋或天空。
- 视觉资产和代码均为 DUN 自主实现，不复制参考项目的品牌、界面、文本、背景或专有素材。
- 每只动物的来源、许可证、修改过程、科学依据和文件哈希都可以追溯。
- 新增动物不修改核心展示器，只需增加一个符合契约的动物素材包。
- 首屏即使尚未加载 WebGL，也能看到完整、可读、可访问的静态展品。
- 继续遵守 DUN 的安静体验：无自动播放、无惊吓、无输赢、无追踪。

## 2. 不做什么

- 第一阶段不制作可以行走的全 3D 开放世界。
- 不为每只动物重新开发一个展示器。
- 不把动物直接画进背景图。
- 不使用来源不明、仅可查看、禁止修改、禁止再分发或带编辑用途限制的模型。
- 不依赖运行时 AI 服务。
- 不让 3D Canvas 承担事实内容、SEO 和无障碍文本。
- 不以复杂后处理、真实动态阴影或粒子特效换取视觉效果。

## 3. 核心视觉方法

DUN 采用混合场景，而不是全 3D 场景：

    原创横版或竖版 2D 场景背景
      + 少量 CSS 氛围层
      + 透明 Three.js Canvas
      + 一只自包含 GLB 动物
      + 程序生成的柔和接触阴影
      + React 信息面板与导航

这套结构的价值在于：

- 2D 背景负责世界观、色彩、时代环境和构图。
- 3D 模型只负责动物本身的体积、材质、观察角度和轻微生命感。
- 接触阴影负责把动物视觉上放到地面。
- 相机跟随的灯光负责让不同来源的模型保持稳定可读。
- React UI 负责儿童内容、家长资料、来源和控制。

看起来像完整场景，但 GPU 只需要渲染一只动物和一块阴影平面。

## 4. 当前项目约束

DUN 当前使用：

- React 19
- vinext、Vite 和 Cloudflare 运行环境
- Next 风格 App Router
- TypeScript
- 代码许可证 AGPL-3.0
- 原创内容许可证 CC BY-SA 4.0
- 服务端渲染的展品正文
- 已有键盘焦点、44px 点击目标、响应式和减少动态效果测试

3D 改造必须保留这些约束。尤其不能为了沉浸感把所有正文塞进 Canvas，也不能在 html 或 body 上全局锁定滚动。

## 5. 总体系统架构

### 5.1 页面层

建议保留现有路径语义：

- 首页：/
- 动物展品：/exhibits/[slug]
- 后续可选的沉浸式馆藏入口：/museum

每个动物展品页包含：

1. 服务端渲染的名称、引导语、文本替代和关键事实。
2. 视口内的互动舞台。
3. 静态 poster，作为加载占位和 WebGL 失败降级。
4. 可展开的观察问题、家长资料和来源。
5. 上一只、下一只及馆藏导航。

第一阶段先在现有 /exhibits/triceratops 路由完成垂直切片。验证后再迁移为参数化路由，避免同时引入路由和 3D 两类风险。

### 5.2 React 与 Three.js 的职责边界

React 负责：

- 路由和服务端内容。
- 当前动物状态。
- 加载进度和错误信息。
- 展品卡片、按钮、抽屉、导航和来源。
- 决定何时加载、切换和销毁模型。

Three.js 负责：

- 单个透明 Canvas。
- 相机、灯光、模型、接触阴影。
- GLB 加载、动画、旋转缩放。
- 模型切换过渡和 GPU 资源释放。

不建议使用 React Three Fiber。DUN 的核心需求是一个长期存在的单渲染器、清晰的缓存与销毁生命周期、可控的渐进增强。原生 Three.js 控制器更直接，也减少了额外运行时抽象。

### 5.3 单渲染器原则

整个互动舞台只创建一个 WebGLRenderer。动物切换时替换 Scene 中的模型组，不重新创建 Canvas 和 WebGL 上下文。

禁止：

- 为导航中的每个缩略图创建 Canvas。
- 每次切换动物都重新创建 Renderer。
- 同时把多个完整模型长期留在 GPU 中。

## 6. 技术选型

### 6.1 运行时依赖

必须：

- three
- @types/three

Three.js 内置 addon：

- GLTFLoader：加载 glTF 2.0 / GLB。
- OrbitControls：拖动旋转、滚轮或双指缩放。
- MeshoptDecoder：解码 EXT_meshopt_compression。
- AnimationMixer：播放 Idle 动画。

第一版不引入：

- React Three Fiber
- Drei
- 后处理框架
- 物理引擎
- 全局状态库
- WebXR

### 6.2 素材处理依赖

建议作为固定版本的开发依赖：

- @gltf-transform/cli
- gltf-validator 或 Khronos glTF Validator CLI
- sharp
- Blender LTS，作为人工或脚本化 DCC 处理工具

可选：

- meshoptimizer，用于更深度的 Meshopt 处理。
- KTX-Software，用于后续 KTX2/Basis 纹理路线。

首版采用 Meshopt + WebP 纹理。KTX2 能进一步降低 GPU 纹理内存，但会增加转码器、兼容性和构建复杂度，应在真实手机性能数据证明有必要后再引入。

## 7. 素材来源策略

### 7.1 动物模型来源优先级

按以下顺序选择：

1. DUN 自建或委托制作的模型。
2. Smithsonian Open Access 中明确标记 CC0 的 3D 标本。
3. Sketchfab 中明确可下载并标记 CC0 或 CC BY 4.0 的模型。
4. 其他博物馆或研究机构明确允许修改和再分发的开放模型。
5. 商业模型仅在许可证明确允许网页将 GLB 发送给最终用户时使用。

注意：浏览器显示 GLB 就意味着用户设备会下载模型文件。因此，普通的“可用于渲染成品、但不可再分发源资产”商业许可证通常不适合本项目。

### 7.2 不同素材源的适用范围

| 来源 | 适合内容 | 许可证策略 | 使用说明 |
| --- | --- | --- | --- |
| Smithsonian Open Access | 化石、骨架、扫描标本 | 仅选 CC0 标记项目 | 科学依据强，但通常不是带皮肤的生命复原 |
| Sketchfab 免费下载 | 带材质的动物复原、骨架、动画模型 | 优先 CC0，其次 CC BY 4.0 | 必须保存下载时的作者、页面、许可和归属文本 |
| DUN 自制或委托 | 重点动物、统一艺术风格模型 | 书面约定 CC BY-SA 4.0 或完整权利转让 | 成本高，但长期风险最低 |
| Poly Haven | HDRI、PBR 纹理、环境素材 | CC0 | 适合灯光和地面材质，不是史前动物主模型库 |
| ambientCG | PBR 地面和自然材质 | CC0 | 可用于模型材质修复或离线背景制作 |
| AI 图像生成 | 原创 2D 场景背景 | 记录工具、日期、提示词和人工修改 | 不生成可旋转模型；不仿特定在世艺术家风格 |

### 7.3 默认可接受许可证

优先接受：

- CC0-1.0
- Public Domain
- CC-BY-4.0
- DUN 自有的 CC-BY-SA-4.0

需专项评估：

- CC-BY-SA-4.0：衍生素材必须保持相同许可证。
- 自定义商业许可证：必须允许修改、网页交付和随站点下载。

默认拒绝：

- CC-BY-NC 或其他非商业限制。
- CC-BY-ND 或其他禁止修改限制。
- Editorial Use Only。
- View only 或不可下载模型。
- 无法确认作者或直接来源的转存文件。
- 从网页缓存、演示视频、他人项目构建产物中提取的模型。
- 许可证描述含糊或下载时许可证证据缺失的素材。

许可证必须在每次下载时重新核对。平台当前规则不能替代具体模型下载时的许可证。

### 7.4 模型候选评分

每个候选模型按 100 分评估：

| 维度 | 分值 | 说明 |
| --- | ---: | --- |
| 权利清晰度 | 25 | 作者、直链、许可、可下载和可修改均明确 |
| 科学可信度 | 20 | 形态与当前共识没有明显冲突 |
| 视觉质量 | 15 | 轮廓、比例、材质适合近距离观察 |
| 网页性能 | 15 | 面数、贴图、draw call 和文件体积可控制 |
| 动画可用性 | 10 | 有安静 Idle，或容易绑定骨骼 |
| 技术可修复性 | 10 | 拓扑、UV、法线和材质可以处理 |
| 儿童体验 | 5 | 无血腥、攻击姿态和惊吓表现 |

权利清晰度低于 25 分直接淘汰。总分低于 75 分不得进入正式制作。

## 8. 素材权利与来源记录

### 8.1 每只动物必须记录

- 动物 ID。
- 原始模型标题。
- 原作者或机构。
- 原始详情页 URL。
- 下载日期。
- 下载时许可证及许可证 URL。
- 原始文件名、字节数和 SHA-256。
- 最终文件字节数和 SHA-256。
- 从原始文件到最终 GLB 的每一步修改。
- 是否允许修改。
- 是否允许商业使用。
- 是否允许把 GLB 交付给网站用户。
- 标准署名文本。
- 科学审查状态。
- 背景生成工具、日期、提示词摘要和人工修改。
- poster、缩略图和音频的派生关系。

### 8.2 推荐数据结构

    export type AssetLicense =
      | "CC0-1.0"
      | "CC-BY-4.0"
      | "CC-BY-SA-4.0"
      | "PUBLIC-DOMAIN"
      | "CUSTOM";

    export interface AssetProvenance {
      assetPath: string;
      assetType: "model" | "background" | "poster" | "thumbnail" | "audio";
      sourceTitle: string;
      sourceCreator: string;
      sourceUrl?: string;
      accessedOn: string;
      license: AssetLicense;
      licenseUrl: string;
      attribution: string;
      modifications: readonly string[];
      originalSha256?: string;
      runtimeSha256: string;
      redistributionApproved: boolean;
      evidenceFiles: readonly string[];
    }

构建必须验证所有正式运行时资产都有对应 provenance 记录，并验证运行时哈希与记录相符。

## 9. 动物素材包目录规范

建议从当前单文件内容迁移为：

    content/exhibits/<animal-id>/
      exhibit.ts
      content.zh-CN.ts
      content.en.ts
      presentation.ts
      provenance.ts
      sources.ts
      assets/
        model.glb
        background-landscape.webp
        background-portrait.webp
        poster-landscape.webp
        poster-portrait.webp
        thumbnail.webp
        narration.zh-CN.mp3
        narration.en.mp3
      evidence/
        model-source.md
        model-license.txt
        background-generation.md
        scientific-review.md

如果大型资产放在 public 中，则内容包保留 manifest：

    public/museum/animals/<animal-id>/
      model/model.glb
      backgrounds/landscape.webp
      backgrounds/portrait.webp
      images/poster.webp
      images/poster-portrait.webp
      images/thumbnail.webp
      audio/narration.zh-CN.mp3
      audio/narration.en.mp3

    content/exhibits/<animal-id>/asset-manifest.ts

首版建议使用 public 路径，降低 vinext、RSC 和二进制 import 的不确定性。manifest 必须保存每个文件的内容哈希，并在 URL 后增加版本查询参数，避免 Cloudflare 缓存旧资产。

## 10. 模型处理流水线

### 10.1 入库前保存

原始下载文件不直接成为运行时文件。

建议工作区：

    asset-workbench/<animal-id>/
      source/
      blender/
      intermediate/
      reports/
      output/

asset-workbench 默认加入 gitignore。仓库只提交：

- 允许再分发的最终运行时 GLB。
- 必需的许可证和来源证据。
- 处理报告。
- 可复现脚本。

如果具体许可证要求同时提供原始文件，则按许可证单独处理，不能一概而论。

### 10.2 Blender 规范化

每个模型进入 Blender 后执行：

1. 确认模型朝向和单位。
2. 将动物头部朝 +X，竖直轴为 +Y。
3. 应用 Rotation 和 Scale。
4. 将脚底最低点放到 Y=0。
5. 水生或飞行动物以视觉中心为基准，不强制地面接触。
6. 将水平包围盒中心放到 X=0、Z=0。
7. 移除相机、灯光、无关场景、展示台、文字和水印几何体。
8. 清理重复材质、无用骨骼、空节点和不可见网格。
9. 修复反转法线、零面积三角形和明显穿插。
10. 保留有意义的 UV、法线、切线和 skin 数据。
11. 将 specular/glossiness 材质转换为 metallic/roughness。
12. 在不破坏轮廓的前提下降低面数和材质数量。
13. 输出一个自包含 glTF 2.0 GLB。

所有可见修改都写入处理报告。

### 10.3 材质和纹理

默认规则：

- Base Color 使用 sRGB。
- Normal、Roughness、Metalness、AO 使用线性色彩空间。
- 动物通常 metalness 为 0。
- 纹理最长边目标 1024，复杂大型动物最多 2048。
- 不允许 4K 或 8K 纹理直接进入网页。
- ORM 可以合并为 Occlusion、Roughness、Metalness 三通道纹理。
- 删除无实际视觉贡献的贴图。
- Base Color 和 Normal 优先保真，其他通道可以更激进压缩。
- 嵌入 GLB，避免外部纹理路径失效。

若原始材质质量差，可使用 DUN 自制或 CC0 PBR 纹理修复，但必须保留来源记录。

### 10.4 动画

正式模型只允许一个默认 Idle：

- 名称固定为 Idle。
- 循环时长建议 6 至 10 秒。
- 首尾姿态完全闭合。
- 陆生动物的脚和下肢不得滑动。
- 不播放行走位移动画。
- 不做吼叫、扑咬、追逐和突然转头。
- 头、胸腔、尾端可以有小幅运动。
- 动画速度可以在 presentation 中按动物微调。

可接受来源：

1. 原模型已有安静 Idle，清理后保留。
2. 原模型有骨骼，重新制作 Idle。
3. 静态模型增加简化骨架和确定性权重。
4. 只做少量 morph target 动画。
5. 无法可靠绑定时保持静态，不用低质量动画冒险。

减少动态效果开启时：

- 不自动旋转。
- 动画保持在稳定参考帧，或以极低幅度运行。
- 所有切换使用无位移或直接替换。

### 10.5 GLB 优化

优化前先检查：

    npx gltf-transform inspect input.glb
    npx gltf-transform validate input.glb

基础处理应包含：

- dedup
- prune
- weld
- reorder
- resample
- Meshopt 压缩
- WebP 纹理压缩

示意命令：

    npx gltf-transform optimize input.glb optimized.glb \
      --compress meshopt \
      --texture-compress webp

不能盲目接受 optimize 默认结果。处理后必须在 Three.js、Khronos Viewer 和真实手机上检查：

- 法线是否错误。
- 透明材质是否变化。
- 动画是否抖动。
- 四元数轨道是否出现翻转。
- 贴图是否过度模糊。
- 接缝是否分离。
- 脚是否穿地。

### 10.6 运行时预算

| 指标 | 目标 | 硬上限 |
| --- | ---: | ---: |
| 最终 GLB | 8–12 MiB | 20 MiB |
| 三角形 | 100,000 | 250,000 |
| draw calls | 12 | 24 |
| 骨骼 | 120 | 200 |
| 单张纹理最长边 | 1024 | 2048 |
| 单只动物完整素材包 | 15 MiB | 23 MiB |
| 横版背景 | 350 KiB | 600 KiB |
| 竖版背景 | 350 KiB | 600 KiB |
| 单张 poster | 300 KiB | 500 KiB |
| 缩略图 | 80 KiB | 120 KiB |
| 单语言旁白 | 350 KiB | 600 KiB |

超过目标需要在处理报告中解释；超过硬上限构建失败。

## 11. 原创背景生产规范

### 11.1 背景的职责

背景只负责：

- 时代和栖息环境的感觉。
- 明暗、色彩和空间层次。
- 为动物提供平整、干净的视觉舞台。
- 为界面留出可读区域。

背景禁止包含：

- 动物。
- 人物。
- 文字。
- Logo 或水印。
- 已经画好的动物阴影。
- 展示按钮和卡片。
- 需要与 3D 动物精确对应的前景遮挡物。

### 11.2 横竖版必须独立构图

每只动物至少制作：

- landscape：16:9，建议源文件 1920×1080 或更高。
- portrait：9:16，建议源文件 1080×1920 或更高。

不能把横版简单裁成竖版。两个版本必须保持相同：

- 色板。
- 光线方向。
- 地面材质。
- 时代植物或地貌。
- 视觉风格。

同时分别保证：

- 动物中心安全区没有高对比细节。
- 横版侧边给信息面板留空间。
- 竖版上方和下方给标题、控制和抽屉留空间。
- 陆生动物脚底对应区域是连续平地。

### 11.3 构图基准

横版建议：

- 地平线或植被边界位于画面高度 42% 至 55%。
- 动物可见区域位于宽度 28% 至 82%。
- 脚底带位于高度 60% 至 72%。
- 信息面板侧保持低对比。

竖版建议：

- 主要环境层次放在上半部。
- 动物可见区域位于宽度 6% 至 94%。
- 脚底带位于高度 58% 至 70%。
- 底部 18% 避免高对比细节，为移动端控制留空间。

这些比例只是默认值，最终由模型实际包围盒和五个测试视口共同验证。

### 11.4 背景来源

优先级：

1. DUN 原创插画。
2. DUN 使用图像生成工具生成，并经过人工选择和修改。
3. 使用 CC0 HDRI、纹理和植物素材在 Blender 中离线渲染成 2D 背景。
4. 委托插画师按 DUN 艺术规范制作。

不直接使用参考项目的背景。

### 11.5 图像生成提示词模板

提示词必须描述 DUN 自己的风格规范，而不是要求复制某个网站或艺术家：

    面向幼儿自然历史博物馆的安静场景插画。
    主题：<地质时期与环境>。
    视觉：温和、克制、纸张与水粉质感、低饱和自然色、
    清晰大形状、柔和日光、前中后景层次。
    构图：<横版或竖版要求>，中央保留完整动物安全区，
    地面在 <比例> 处连续且平整。
    不包含动物、人物、文字、Logo、水印、脚印、
    展示台、已烘焙阴影、戏剧性灾难或攻击场面。

每张正式背景保存：

- 完整提示词。
- 工具和模型名称。
- 生成日期。
- 原始候选哈希。
- 选择理由。
- 编辑步骤。
- 最终哈希。

### 11.6 背景图处理

- 人工确认没有残留动物或不合理化石。
- 检查时代植物和地貌，不把生成图当成科学证据。
- 去除元数据。
- 转为 WebP。
- 默认质量 80–84。
- 保留原始高分辨率母版于工作区。
- 最终画面不在运行时叠加重滤镜，以避免模型和背景色彩失配。

## 12. Poster、缩略图和加载体验

poster 不是另一张绘制的动物图，而是用最终 Three.js 展示参数离线渲染出的透明模型静帧。

每只动物生成：

- 横版透明模型静帧。
- 竖版透明模型静帧。
- 320×320 馆藏缩略图。
- 可选的多视口预览图。

加载顺序：

1. SSR 输出背景 picture、poster 和文本。
2. 浏览器水合后动态导入 ViewerController。
3. 创建透明 Canvas。
4. 下载和解析 GLB。
5. 编译材质并渲染第一帧。
6. poster 在 300–450ms 内淡出。
7. 如果失败，poster 保留，文字和内容仍可正常使用。

poster 必须与最终模型使用同一：

- 模型文件。
- 初始角度。
- 相机拟合规则。
- 灯光。
- 色调映射。
- 阴影参数。

否则加载完成会出现明显跳变。

## 13. Three.js 展示器设计

### 13.1 推荐文件结构

    components/museum/
      AnimalStage.client.tsx
      AnimalStageFallback.tsx
      AnimalControls.tsx
      AnimalNavigation.tsx
      ExhibitPanel.tsx

    lib/viewer/
      ViewerController.ts
      model-cache.ts
      model-descriptor.ts
      camera-fit.ts
      contact-shadow.ts
      dispose.ts
      capability.ts

    lib/exhibits/
      catalog.ts
      schema.ts
      load-exhibit.ts

    scripts/assets/
      inspect-model.mjs
      optimize-model.mjs
      validate-model.mjs
      generate-previews.mjs
      validate-provenance.mjs

### 13.2 ViewerController 职责

ViewerController 是与 React 分离的命令式类：

    interface ViewerController {
      load(descriptor: ViewerModelDescriptor, signal?: AbortSignal): Promise<void>;
      resetView(): void;
      rotateBy(deltaRadians: number): void;
      zoomBy(factor: number): void;
      setReducedMotion(value: boolean): void;
      resize(): void;
      destroy(): void;
    }

React 不直接操作 Three.js Scene 中的对象，只调用控制器方法并接收事件：

- onProgress
- onFirstFrame
- onFailure
- onInteractionStart
- onInteractionEnd

### 13.3 Renderer 基线

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

推荐设置：

- 透明清屏。
- outputColorSpace 为 SRGBColorSpace。
- toneMapping 为 ACESFilmicToneMapping。
- 默认 exposure 1.0，动物可在 0.85–1.25 范围微调。
- devicePixelRatio 上限桌面和高端设备 2，普通移动设备 1.5。
- ResizeObserver 驱动尺寸变化。
- 不启用 preserveDrawingBuffer。
- 第一版不启用后处理。

Three.js 当前 WebGLRenderer 使用 WebGL 2。创建失败时立即进入 poster 降级，不反复重试。

### 13.4 灯光

使用稳定的展示灯光，不追求完整环境物理真实性：

1. HemisphereLight：暖色天空光和灰绿色地面反射。
2. Camera-relative key light：从相机上方侧面照亮动物。
3. Camera-relative fill light：降低另一侧死黑。
4. 可选 scene accent：从背景光线方向提供弱轮廓。

灯光随相机观察方向更新，但强度保持稳定。这样动物旋转时仍然可读，也不会因为不同模型原始灯光设置差异过大。

不默认启用实时 shadow map。动物和背景的融合主要靠接触阴影。

### 13.5 接触阴影

接触阴影使用一块水平 PlaneGeometry 和程序生成的径向透明纹理：

- 中心较深，边缘柔和衰减。
- 根据动物包围盒的宽度和深度缩放。
- 放在 Y=0 上方极小偏移处，避免 z-fighting。
- 水生和飞行动物默认关闭。
- 每只动物可以调整 opacity、scale、offset 和 depthScale。

这比实时灯光阴影成本低，也更容易与绘制背景一致。

### 13.6 模型加载

加载流程：

1. fetch GLB，并通过 AbortController 支持快速切换。
2. 读取 ArrayBuffer。
3. 放入有上限的内存缓存。
4. 使用 GLTFLoader 和 MeshoptDecoder 解析。
5. 应用初始 yaw。
6. 播放 Idle 的第 0 帧，计算准确包围盒。
7. 水平居中并地面归零。
8. 创建 presentation group。
9. 增加接触阴影。
10. 自动拟合相机。
11. compileAsync 或预渲染一帧。
12. 通知 React 第一帧已准备完成。

模型切换时：

- 新模型先在不可见组中完成解析和拟合。
- 准备好后做 200–300ms 的透明度交叉过渡。
- reduced motion 下直接替换。
- 旧模型在过渡结束后完整 dispose。

### 13.7 相机拟合

禁止为每个动物手写 CSS 位移。默认根据模型包围盒计算。

计算原则：

- 取得动画参考帧的 Box3。
- 根据纵向 FOV 和当前宽高比计算水平 FOV。
- 分别计算容纳模型高度和宽度所需距离。
- 取较大值，再加入 safeAreaPadding。
- controls.target 默认位于动物高度的 42% 附近。
- 设置合理的 minDistance 和 maxDistance。

每只动物允许少量 presentation 覆盖：

    interface AnimalPresentation {
      initialYawDegrees: number;
      safeAreaPadding: number;
      portraitSafeAreaPadding?: number;
      horizontalOffset?: number;
      verticalOffset?: number;
      cameraLightScale?: number;
      toneMappingExposure?: number;
      shadow: "ground" | "none";
      shadowOpacity?: number;
      shadowScale?: number;
      animationSpeed?: number;
    }

覆盖只能用于真实形态差异，不能用来掩盖模型没有规范化的问题。

### 13.8 交互控制

OrbitControls 设置：

- enablePan 为 false。
- enableDamping 为 true。
- 限制 minDistance 和 maxDistance。
- 限制垂直旋转，避免钻到地面下。
- 不允许翻转相机。
- 用户操作时暂停自动旋转。
- 用户停止 4 秒后可以恢复非常缓慢的自动旋转。
- reduced motion 时永不自动旋转。

UI 必须同时提供按钮：

- 左转。
- 右转。
- 放大。
- 缩小。
- 恢复初始视角。
- 专注查看或退出专注。

按钮最小 44×44px，并有中文可访问名称。不能把拖动作为唯一操作方式。

### 13.9 动画循环

- 使用 AnimationMixer。
- 页面不可见时暂停 requestAnimationFrame。
- Canvas 不在视口时可以降低到按需渲染或暂停。
- 用户正在旋转、Idle 动画运行或过渡期间持续渲染。
- 静态模型停止交互后使用按需渲染。
- reduced motion 下优先按需渲染。

## 14. 响应式场景和 UI

### 14.1 桌面横屏

- 舞台最小高度 100svh，但不锁 body 滚动。
- 2D 背景铺满舞台。
- 信息面板位于左侧或右侧低对比安全区。
- 3D 模型占主要视觉区域。
- 馆藏导航位于底部，但不遮挡脚底。

### 14.2 平板

- 信息面板更窄。
- 模型安全区增大。
- 馆藏导航可横向滚动。
- 关键控制靠近舞台边缘。

### 14.3 手机竖屏

- 切换到独立 portrait 背景。
- 模型舞台位于中上部。
- 名称和引导保持简短。
- 家长资料使用底部抽屉。
- 馆藏导航默认折叠。
- 不能通过把桌面布局整体缩小来适配。

### 14.4 测试视口

每只动物至少验证：

- 360×800
- 390×844
- 768×1024
- 1366×768
- 1920×1080

额外验证：

- 低高度横屏手机。
- 200% 浏览器缩放。
- 中文和英文较长文本。

## 15. 数据模型

展示器不读取散落常量。每只动物由统一定义驱动：

    interface MuseumAnimal {
      id: string;
      status: "draft" | "review" | "published";
      habitat: "land" | "sea" | "air" | "ice";
      scientificName: string;
      names: LocalizedText;
      introduction: LocalizedText;
      visibleFeature: LocalizedText;
      prompts: readonly ObservationPrompt[];
      facts: readonly ExhibitFact[];
      sources: readonly ScientificSource[];
      assets: {
        modelUrl: string;
        backgroundLandscapeUrl: string;
        backgroundPortraitUrl: string;
        posterLandscapeUrl: string;
        posterPortraitUrl: string;
        thumbnailUrl: string;
        narrationZhCNUrl?: string;
        narrationEnUrl?: string;
      };
      presentation: AnimalPresentation;
      provenance: readonly AssetProvenance[];
    }

发布条件：

- 中英文名称和引导完整。
- 至少一个可观察特征。
- 事实来源完整。
- 模型和背景通过审查。
- 所有资产有 provenance。
- poster 和当前模型哈希一致。
- 五个视口截图通过。

## 16. 科学与儿童内容规范

- 模型是艺术复原，不作为事实来源。
- 颜色、软组织、姿态和叫声必须明确存在不确定性。
- 事实优先引用自然历史博物馆、大学、同行评审论文或权威数据库。
- 不根据模型外观推断食性、性别、群居、攻击行为或声音。
- 对幼儿只展示一个明显观察点，更多事实放入家长资料。
- 不自动播放音频。
- 音频按钮必须清楚显示当前语言。
- 所有旁白发布前需要完整人工试听。

## 17. 渐进增强与错误处理

以下情况仍必须提供可用展品：

- JavaScript 未加载。
- WebGL 2 不可用。
- GLB 下载失败。
- Meshopt 解码失败。
- WebGL context lost。
- 用户开启省流量模式。
- 网络很慢。

降级体验包括：

- 原创背景。
- 与 3D 初始状态一致的 poster。
- 全部展品文本。
- 观察问题和事实卡片。
- 来源和许可。
- 明确但不惊慌的提示：“这次模型没有来到展台，可以先看静态展品。”

失败后可提供一次“重新加载模型”按钮，但不能自动无限重试。

## 18. 缓存与加载策略

- 背景和当前动物 poster 作为首屏资源优先加载。
- GLB 在客户端水合后加载。
- 当前动物模型优先级最高。
- 上一只和下一只模型仅在浏览器空闲、非省流量模式下预取。
- ArrayBuffer 内存缓存设置上限。
- 移动端建议只保留当前和一个相邻模型。
- 桌面端最多保留当前和两个相邻模型。
- GPU 中只保留当前模型和过渡中的一个模型。
- GLB、背景和 poster 使用长缓存，并通过内容哈希或版本参数失效。
- HTML 和内容数据使用较短缓存，保证来源修订可以及时发布。

## 19. GPU 资源释放

切换或销毁时递归处理：

- BufferGeometry.dispose。
- Material.dispose。
- 所有 Texture.dispose。
- Skeleton 相关引用。
- AnimationMixer.stopAllAction 和 uncacheRoot。
- Renderer renderLists.dispose。
- 删除事件监听器和 ResizeObserver。
- 取消 requestAnimationFrame。
- 中止未完成 fetch。

GLTFLoader 创建的 ImageBitmap 不一定会被自动回收，必须在实现和设备测试中验证释放行为。

## 20. 无障碍要求

- Canvas 不承载唯一信息。
- Canvas 可以 aria-hidden，旁边提供当前动物的文字替代。
- 提供键盘可操作的旋转、缩放和重置按钮。
- 所有控制有可见焦点。
- 点击目标最小 44px。
- 不依赖颜色表达加载、选择或错误状态。
- 加载进度使用克制的 aria-live。
- 模型切换完成只播报一次。
- reduced motion 下关闭自动旋转、强制动画和位移过渡。
- 200% 缩放不丢失内容和控制。
- 事实、来源和返回路径在 SSR HTML 中存在。

## 21. 性能目标

以中端移动设备为主要基准：

- poster 的 LCP 目标小于 2.5 秒。
- 首只 GLB 在普通 4G 下可理解地显示进度。
- 模型显示后平均帧率目标不低于 30fps。
- 桌面目标 60fps。
- 首屏主线程不因同步解析模型长时间冻结。
- Canvas DPR 有上限。
- 单帧 draw call 和三角形符合素材预算。
- 页面隐藏时停止动画循环。
- 不为背景使用实时 3D 植物。
- 不在第一版使用屏幕空间环境光遮蔽、景深、Bloom 或动态粒子。

每只动物发布报告应包含：

- GLB 文件大小。
- 解析时间。
- 首帧时间。
- 三角形。
- draw calls。
- 纹理数量和最大尺寸。
- 移动端帧率。
- 峰值 GPU/页面内存的观察结果。

## 22. 测试和质量门

### 22.1 静态资产测试

- GLB 通过 Khronos Validator。
- 不存在外部 buffer 或纹理引用。
- 只有允许的动画 clip。
- 包围盒有限且不含 NaN。
- 陆生动物最低点接近 Y=0。
- 纹理尺寸和文件预算合格。
- provenance 完整。
- 运行时哈希匹配。
- 背景尺寸和方向正确。
- poster manifest 与模型和 presentation 哈希一致。

### 22.2 单元测试

- 相机拟合算法。
- presentation 默认值。
- 模型缓存 LRU。
- 动物目录唯一性。
- 来源引用存在。
- 许可证白名单。
- 失败降级状态。
- reduced motion 状态。

### 22.3 组件测试

- poster 在模型首帧前可见。
- 模型成功后 poster 淡出。
- 加载失败时 poster 保留。
- 控制按钮调用正确方法。
- 切换动物中止旧请求。
- 音频不自动播放。

### 22.4 SSR 测试

继续保证：

- 标题、名称、事实和来源存在于服务端 HTML。
- 展品页无 JavaScript 时可读。
- 无登录、追踪、自动播放和游戏化元素。
- 返回博物馆链接存在。

现有测试中的 figure 数量和具体 DOM 契约需要在 3D 垂直切片中有计划地迁移，而不是简单删除。

### 22.5 端到端和视觉测试

五个基准视口截图：

- 初始 poster。
- 模型第一帧。
- 旋转后。
- 家长资料打开。
- 模型加载失败。
- reduced motion。

检查：

- 脚与地面接触。
- 轮廓没有被 UI 裁切。
- 模型和背景光线大致一致。
- 横竖版切换没有跳变。
- 中文和英文都不溢出。

## 23. CI 脚本建议

package.json 最终增加：

    "assets:inspect": "node scripts/assets/inspect-model.mjs",
    "assets:validate": "node scripts/assets/validate-all.mjs",
    "assets:optimize": "node scripts/assets/optimize-model.mjs",
    "assets:previews": "node scripts/assets/generate-previews.mjs",
    "assets:credits": "node scripts/assets/generate-credits.mjs"

正式 test 流程：

1. typecheck
2. lint
3. assets:validate
4. 内容单元测试
5. build
6. SSR 测试
7. 关键 E2E

预览图、模型或 presentation 任一变化后，如果没有重新生成 poster manifest，构建必须失败。

## 24. 实施阶段

### 阶段 0：架构和来源基线

交付：

- 安装并固定 Three.js 与素材工具版本。
- 建立动物 schema。
- 建立 provenance schema。
- 建立目录和资产预算验证。
- 添加第三方素材总览页面或自动生成 credits。

完成标准：

- 空素材包能被验证器识别。
- 缺许可证、哈希或来源时构建失败。

### 阶段 1：三角龙垂直切片

交付：

- 只为三角龙选择一份非参考项目素材。
- 完成来源审查和 Blender 规范化。
- 制作 DUN 原创横竖背景。
- 实现 ViewerController。
- 实现 poster 降级。
- 保留现有教育内容和来源。

完成标准：

- 五个视口通过。
- 模型可旋转、缩放、重置。
- 模型失败时页面仍完整。
- 性能预算通过。
- 无障碍和 SSR 测试通过。

### 阶段 2：数据驱动与馆藏切换

交付：

- 提取公共 AnimalStage。
- 建立 catalog。
- 参数化展品路由。
- 加入上一只、下一只和缩略图导航。
- 单 Renderer 切换模型。
- 加入缓存、预取和过渡。

完成标准：

- 新增第二只动物不修改 ViewerController。
- 快速切换不会显示过期模型。
- 旧模型资源会释放。

### 阶段 3：标准化入馆工具

交付：

- 模型 inspect、optimize、validate 脚本。
- poster 和 thumbnail 自动生成。
- provenance 与 credits 自动生成。
- 处理报告模板。

完成标准：

- Agent 按模板可以把第三只动物从候选文件处理到 review 状态。
- 发布必须通过自动质量门。

### 阶段 4：扩展全部展厅

按类别逐批加入：

1. 陆地动物。
2. 海洋动物。
3. 空中动物。
4. 冰期动物。

每批只复用展示器，不增加新的渲染架构。海洋和天空通过背景、氛围层、模型姿态和 shadow=none 表达，不另建全 3D 世界。

## 25. 单只动物入馆 SOP

后续 Agent 必须按顺序执行：

1. 创建候选 Issue，写明动物和目标观察点。
2. 搜索至少两个合法候选模型。
3. 记录直接来源和下载时许可证。
4. 对候选进行权利、科学、视觉和性能评分。
5. 人工确认选中模型。
6. 保存原始哈希和许可证证据。
7. 在 Blender 中规范化模型。
8. 修复材质和贴图。
9. 清理或制作安静 Idle。
10. 导出自包含 GLB。
11. glTF Transform 优化。
12. Khronos Validator 验证。
13. 在 Three.js 基准 viewer 中复核。
14. 制作原创横竖背景。
15. 配置 presentation。
16. 自动生成 poster 和 thumbnail。
17. 填写中英文内容和科学来源。
18. 生成 provenance 和 credits。
19. 跑五个视口视觉检查。
20. 跑真实移动设备性能检查。
21. 进入 review。
22. 人工批准后改为 published。

任何一步缺少证据，都不能跳到 published。

## 26. Agent 执行约束

后续 Agent 读取本方案后应遵守：

- 先做一个三角龙垂直切片，不一次性导入大量模型。
- 未经用户确认，不替用户选择许可证有争议或需要付费的模型。
- 不从参考网站下载素材或构建产物。
- 不把参考项目代码直接复制进 DUN。
- 可以学习其公开方法，但实现命名、组件、样式和视觉资产必须属于 DUN。
- 不更换 DUN 的 AGPL-3.0 和 CC BY-SA 4.0 基线。
- 不删除现有内容来源和无障碍测试来让 3D 页面通过。
- 对第三方资产的修改必须写入 attribution。
- 模型不是科学来源。
- 所有生成式背景都必须人工审查。
- 所有音频必须人工试听。
- 任何运行时失败都必须保留静态展品。

## 27. 关键验收标准

整个博物馆技术基线完成时，应满足：

- 核心展示器只有一套。
- 新动物通过数据和素材包接入。
- 每只动物都可从来源追溯到运行时文件。
- 背景是 DUN 原创，并与动物分离。
- GLB 可以被旋转、缩放和重置。
- Idle 安静且不滑步。
- 横屏和竖屏分别使用独立背景。
- 低性能或无 WebGL 设备仍有完整展品。
- SSR、SEO、无障碍、减少动态效果和无自动播放均通过。
- 关键移动端达到 30fps。
- 所有资产满足预算或有批准记录。
- credits 页面能自动列出第三方模型、作者、来源、许可证和修改。

## 28. 参考资料与许可证基线

以下资料用于制定本方案。实施时应重新核对最新版本。

### 3D 素材

- Sketchfab Creative Commons 说明：
  https://www.sketchfab.com/blogs/community/an-introduction-to-creative-commons-licenses/
- Smithsonian Open Access FAQ：
  https://www.si.edu/openaccess/faq
- Smithsonian Open Access 3D 示例：
  https://www.si.edu/spotlight/openaccesshighlights
- Poly Haven CC0 许可证：
  https://polyhaven.com/license
- ambientCG CC0 许可证：
  https://docs.ambientcg.com/license/
- Creative Commons CC BY 4.0：
  https://creativecommons.org/licenses/by/4.0/

### 运行时和处理

- Three.js GLTFLoader：
  https://threejs.org/docs/pages/GLTFLoader.html
- Three.js OrbitControls：
  https://threejs.org/docs/pages/OrbitControls.html
- Three.js WebGLRenderer：
  https://threejs.org/docs/pages/WebGLRenderer.html
- glTF Transform CLI：
  https://gltf-transform.dev/cli
- Khronos glTF Validator：
  https://github.khronos.org/glTF-Validator/

### 研究参考

公开项目可以作为方法研究对象，但不是 DUN 的素材来源或复制模板：

- Prehistoric Animal Museum：
  https://github.com/s010s/prehistoric-animal-museum

DUN 的实现、视觉资产、品牌和内容必须保持独立。
