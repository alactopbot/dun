# REQ-017：剑龙展品技术方案

## 需求与成功标准

在 DUN 的大地展厅加入一个完整剑龙展品。儿童和陪伴者能从博物馆入口发现并进入展品，先观察
剑龙形态，再逐步打开三张双语事实卡片，查看事实来源与原创媒体署名，最后带着一个观察问题离开
屏幕。三角龙的现有内容、路由和用户行为保持不变。

## Pattern 匹配

- Pattern：`animal-exhibit-v1` 第 1 版
- 模式：`supervised`
- 匹配理由：新增一种恐龙展品，并复用三角龙的信息结构、双语层级、安静交互、事实来源、媒体
  署名和无障碍方式。
- 本次人工 Gate：技术方案、最终产品验收。

允许变化：动物身份、教育内容、双语文案、已批准媒体、既有展品布局内的复用，以及入口增加
剑龙访问链接。

必须保持：儿童安全、事实准确、逐事实来源、媒体许可、无障碍、减少动态效果、中文主英文辅、
无自动播放、无账号/推荐/跟踪、无运行时外部请求。

## 内容与来源方案

采用两组博物馆官方页面，每条事实记录具体定位与查阅日期：

1. [Natural History Museum：Stegosaurus](https://www.nhm.ac.uk/discover/dino-directory/Stegosaurus.html)
   用于名称含义、植物食性、晚侏罗世年代、背部骨板和尾刺。
2. [Natural History Museum：A Stegosaurus brought to life](https://www.nhm.ac.uk/discover/stegosaurus-brought-to-life.html)
   用于四足行走、前后肢比例和植物食性研究背景。
3. [American Museum of Natural History：Stegosaurus](https://www.amnh.org/exhibitions/permanent/ornithischian-dinosaurs/stegosaurus)
   用于骨板血管沟槽、皮肤覆盖及展示/同类识别解释。
4. [American Museum of Natural History：Colorful Display](https://www.amnh.org/exhibitions/dinosaurs-ancient-fossils/display-or-defense/colorful-display)
   用于尾刺可能用于防御，以及骨板并非坚固防护板的证据。

计划采用三条儿童事实：

- 名字意为“屋顶蜥蜴”；背部骨板生长在皮肤中，并非直接连在骨架上。
- 剑龙吃植物、用四足行走，前腿比后腿短。
- 剑龙生活在晚侏罗世；尾端尖刺可以帮助防御。

不把骨板的具体用途写成确定事实。若文案提及，只能明确表达“科学家仍不完全确定”，并避免把
推测混入三张确定事实卡片。

## 产品内容

- 名称：剑龙 / `Stegosaurus`
- 三个观察提示：寻找骨板形状；比较前后腿；观察尾巴末端。
- 成人提示：继续沿用“先听孩子怎么说，不急着给答案”。
- 离屏提示：寻找身边重复排列的形状，并比较高低或大小变化。
- 媒体：使用 OpenAI 图像生成工具创作一张原创 `1536 × 1024` WebP；侧视四足剑龙，清楚显示
  交错背板、较短前肢、较长后肢和四根尾刺；抽象安静博物馆背景，无文字、水印、捕食或打斗。
  记录 DUN 项目创作者说明与 `CC-BY-SA-4.0`。

## 技术方案

三角龙已经证明了展品结构，但页面组件、类型、校验和样式仍以三角龙命名。为让本次和后续动物
真正复用同一 Pattern，本需求做一次行为保持的最小共享化：

1. 把通用 `LocalizedText`、来源、事实、观察提示、媒体和 `AnimalExhibit` 类型，以及通用内容
   校验器移到 `content/exhibits/schema.ts`。
2. 把展品渲染移动到 `app/exhibits/animal-exhibit-page.tsx`，样式移动到
   `app/exhibits/animal-exhibit.module.css`。
3. 三角龙内容数据保持原文和来源不变，只改为使用共享 schema；三角龙路由改为调用共享组件。
4. 新增 `content/exhibits/stegosaurus.ts` 和 `app/exhibits/stegosaurus/page.tsx`。
5. 首页大地展厅显示三角龙与剑龙两个独立访问链接，不改变其他展厅。

不引入新依赖，不增加客户端状态、接口、存储或网络请求。

## 预计路径

新增：

- `content/exhibits/schema.ts`
- `content/exhibits/stegosaurus.ts`
- `app/exhibits/animal-exhibit-page.tsx`
- `app/exhibits/animal-exhibit.module.css`
- `app/exhibits/stegosaurus/page.tsx`
- `public/media/stegosaurus/exhibit.webp`
- `tests/stegosaurus-content.test.mjs`
- `tests/stegosaurus-route.test.mjs`
- `docs/requirements/REQ-017-stegosaurus/delivery.md`

修改：

- `content/exhibits/triceratops.ts`
- `app/exhibits/triceratops/page.tsx`
- `app/page.tsx`

三角龙旧样式文件在共享样式成功接管且测试证明行为不变后删除。既有测试文件不修改。

## 内部 work units

1. 新增剑龙路由、内容与入口契约测试，证明当前主分支失败。
2. 提取共享 schema、校验器、页面组件和样式，保持三角龙全部既有测试绿色。
3. 实现剑龙双语内容、逐事实来源和首页入口，让新路由与内容测试通过。
4. 生成并接入原创剑龙媒体，验证尺寸、格式、alt、创作者和许可。
5. 运行快速检查、Deep Gate、负向证明与全新上下文独立验证。
6. 写候选交付并创建唯一 Draft PR；验证接受后只更新最终交付证据。

这些工作单元只用于测试、提交和恢复，不创建额外 Issue、分支、PR 或人工 Gate。

## 测试证明

- 新路由测试：入口含剑龙链接；`/exhibits/stegosaurus` 服务端返回完整展品结构；无音视频、表单、
  自动播放、跟踪或遥测。
- 新内容测试：三条中英文事实、三个提示、成人提示、逐事实来源、英文 `lang`、原创媒体、许可与
  结束提示均渲染。
- schema 校验测试随新内容测试覆盖：双语非空、ID 唯一、来源完整、事实有来源、媒体信息有效。
- 原有三角龙内容、路由和样式测试保持原样并全部通过，证明共享化没有改变既有行为。
- `prove-test.sh` 对新增剑龙测试执行反向证明。

## 风险与回退

- 共享化可能无意改变三角龙 HTML；以现有三角龙测试和完整渲染差异为保护，发现变化时先修复，
  不通过修改既有断言放行。
- 剑龙骨板用途存在科学不确定性；确定事实与推测严格分开。
- 生成插画可能出现板片、尾刺或肢体错误；实施时视觉检查，不合格则重新生成，不降低验收标准。
- 如共享组件证明无法保持三角龙行为，回退共享化提交，剑龙仍在同一需求分支内采用最小独立页面，
  不拆分需求。

## 明确不做

不新增音频、动画、账号、收藏、推荐、分析、遥测、外部运行时请求或生产依赖；不修改三角龙事实
和素材；不改变 Factory 策略；不自动合并或发布。

## 产品验收场景

在手机宽度和桌面宽度下，从首页进入剑龙展品；确认中文是主要阅读层级、英文完整可见；依次使用
鼠标、键盘和触控打开事实与来源；看到准确的剑龙形态和署名；返回首页。整个过程无自动播放、
无催促、无奖励机制。最终由人类按这一完整场景验收一次。

## 本次授权请求

批准后即表示授权上述承重内容、媒体、共享展品路径及首页修改，并预授权新增测试文件；不授权
修改任何既有测试、引入依赖或越出本方案范围。
