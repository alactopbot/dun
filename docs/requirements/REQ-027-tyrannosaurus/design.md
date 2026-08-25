# REQ-027：把霸王龙加到博物馆

状态：Draft，等待方案审核  
对应 Issue：[#27 把霸王龙加到博物馆](https://github.com/alactopbot/dun/issues/27)  
执行路径：普通需求（Pattern：none）  
Gate：实现阶段 `deep`；本次仅 Spec 的 PR 使用 `fast`

## 1. 目标与完成结果

在现有 DUN 馆藏中增加一个可从首页发现、可通过 `/exhibits/tyrannosaurus` 直接访问的霸王龙展品。2–6 岁儿童和照护者能够先共同观察静态展品，再由用户主动加载和操作安静的 3D 霸王龙；展品包含中英文观察引导、经过权威来源支持的事实、来源与素材归属，并与三角龙、剑龙共用现有 schema、catalog、参数化页面和单渲染器展示器。

本需求完成时：

- 首页和展品导航能发现霸王龙，直接访问 `/exhibits/tyrannosaurus` 返回服务端渲染的完整展品；
- 霸王龙可用鼠标、触摸和键盘按钮旋转、缩放及恢复初始视角，且不把拖动作为唯一交互；
- JavaScript、WebGL、模型下载或解码失败时，背景、poster、全部正文、事实、来源和返回路径仍可用；
- 所有儿童可见事实都关联权威来源，模型、背景、poster 和缩略图具备可审计的来源、许可、归属、修改记录与运行时 SHA-256；
- 现有三角龙、剑龙体验和来源记录不回归；
- `./.factory/scripts/gates.sh deep` 为 GREEN，且当前 PR head 通过独立验证。

## 2. 背景与范围决定

当前 `main` 已有三角龙和剑龙两个正式展品，以及数据驱动的 `MuseumAnimal`、`museumCatalog`、参数化 `/exhibits/[slug]` 页面、公共 `ViewerController`、素材校验和静态降级。本需求消费这套已批准基线，只增加第三个符合相同契约的动物素材包、内容和入口；不复制页面或新建霸王龙专用展示器。

霸王龙是儿童熟悉的肉食恐龙，但 DUN 不把它呈现为攻击、追逐或惊吓角色。观察重点是头、短前肢、两条后腿、长尾和牙齿等可见形状，以及化石能够支持的时间、地点和食性。

## 3. 非目标

- 不建设完整 3D 世界、独立 `/museum` 沉浸入口、WebXR、物理引擎、粒子或后处理。
- 不接入第四只动物，不重写现有展示器或素材流水线。
- 不加入猎食动画、吼叫、追逐、血腥画面、突然转头或其他惊吓效果。
- 不加入账户、广告、行为追踪、积分、排行榜、自动播放音频或运行时 AI。
- 不把 Canvas 作为事实、SEO、名称、来源或无障碍文本的唯一载体。
- 不新增运行时或开发依赖；若现有工具无法完成素材处理，应回到同一 Draft PR 审核。
- 不创建、启用或扩大 Factory Pattern，不修改 Factory 治理文件。
- 不承诺旁白；本次没有音频资产和音频控制。

## 4. 用户可见体验

### 4.1 发现和导航

- 首页“大地展厅”在三角龙、剑龙之外增加“霸王龙”普通链接，服务端 HTML 和禁用 JavaScript 状态均可到达。
- 三个展品沿 catalog 顺序循环提供上一只、下一只导航；当前动物继续通过文本和 `aria-current` 表达，不只依赖颜色。
- `/exhibits/tyrannosaurus` 保留“返回博物馆”、完整来源区和媒体归属。

### 4.2 霸王龙正文

页面延续“先观察，再打开事实卡片”的安静节奏。首版采用以下可审查文案；实现不得根据模型外观新增事实：

- 名称：`霸王龙` / `Tyrannosaurus rex`；学名：`Tyrannosaurus rex`。
- 引导：`先看看它的大头、短前肢和长尾巴，再慢慢打开事实卡片。` / `Look at its large head, short forelimbs, and long tail before opening the fact cards.`
- 三个观察问题：
  1. `从头到尾，你看到了哪些大形状和小形状？` / `What large and small shapes can you see from head to tail?`
  2. `你能在每只短前肢上找到几根手指？` / `How many fingers can you find on each short forelimb?`
  3. `转到侧面看，长尾巴和大头怎样分在身体两边？` / `From the side, how are the long tail and large head arranged on either side of the body?`
- 照护者提示：`先描述看见的形状；它真实的颜色和声音没有被化石完整保存下来。` / `Start with the shapes you can see; its real colours and sounds were not fully preserved as fossils.`
- 三张事实卡片：
  1. `“Tyrannosaurus rex”的名字意为“暴君蜥蜴之王”；它用两条腿行走，尾巴帮助保持平衡。` / `The name Tyrannosaurus rex means “tyrant lizard king”; it walked on two legs and used its tail for balance.`
  2. `霸王龙生活在约 6800 万至 6600 万年前的晚白垩世，化石发现于北美。` / `Tyrannosaurus rex lived in North America about 68–66 million years ago, near the end of the Late Cretaceous.`
  3. `它有尖锐、略向后弯曲并带锯齿的牙齿；这些牙齿帮助它刺入和撕开肉。` / `It had pointed, slightly backward-curving, serrated teeth that helped pierce and tear meat.`
- 离屏问题：`离开屏幕后，找一找一边大、一边长，却仍显得平衡的形状。` / `Away from the screen, look for a shape with something large on one side and something long on the other that still seems balanced.`

### 4.3 事实来源

每条事实必须在 `sourceIds` 中绑定到具体来源，并在页面来源区显示标题、出版机构、HTTPS URL、访问日期、定位说明及“支持什么”：

- American Museum of Natural History，*Tyrannosaurus rex* OLogy card：支持名称含义、两足行走和尾巴平衡；
- American Museum of Natural History，*T. rex: The Ultimate Predator — Educator's Guide*：支持约 6800 万至 6600 万年前、晚白垩世和北美；
- American Museum of Natural History，*Dinosaur Facts* 的 “Teeth, Footprints, and Feathers”：支持兽脚类霸王龙牙齿尖锐、略向后弯曲、带锯齿及其刺入和撕开肉的作用。

照护者提示中的颜色和声音只表达化石证据边界，不推断具体外观或声音。若实施时任一页面不可访问、定位内容改变或不能直接支持文案，先选择同等级博物馆或同行评议来源并更新本 Spec；不得凭记忆、搜索摘要或模型外观补足。

## 5. 素材与权利方案

### 5.1 霸王龙模型

优先从 Quaternius 官方 *Animated Dinosaur Pack* 中选择其霸王龙/T-Rex 源文件。该官方页面标示整包为 CC0、含六个可动画恐龙并提供 Blend 格式，且说明可用于个人和商业项目；实现仍须从官方链接取得具体文件及包内 `License.txt`，记录准确文件名、Drive ID、下载日期、字节数、原始 SHA-256 和许可证文件 SHA-256。

模型进入仓库前必须确认：

- 官方包确实包含可识别为霸王龙的源模型，许可覆盖修改和网页再分发；
- 模型没有第三方品牌、文字、水印、外部纹理依赖或不明来源组件；
- 可移除 Attack、Death、Run、Walk 等不适合 DUN 的动作，只保留并命名一个安静 `Idle`；
- 科学可见特征不与正文冲突；低多边形风格不被当作科学证据；
- 最终 GLB 自包含、面向 +X、Y-up、居中、脚底落在 Y=0，并通过现有 validator、哈希与预算校验。

如果官方源文件、许可或再分发证据无法完整取得，停止并把同一 PR 转回 Draft；不得改用镜像、游戏提取资产、非商业资产、仅限编辑用途资产或来源不明的临时模型。

### 5.2 背景、poster 与缩略图

- 使用现有确定性 Blender 脚本分别制作横版和竖版安静的晚白垩世大地/林缘舞台；背景不含动物、猎物、人物、文字、Logo、水印、脚印、灾难、攻击或烘焙动物阴影。
- poster 和 320×320 缩略图必须由最终 hash-bound GLB 和 `presentation.json` 渲染，不另画一只霸王龙。
- 记录脚本、Blender 版本、日期、构图决定、修改步骤、最终尺寸与 SHA-256；DUN 原创背景和派生预览使用 CC BY-SA 4.0。
- 横竖背景独立构图，保证大头、长尾和脚不被 UI 裁切；模型保持中性站姿，嘴部不以咆哮或扑咬姿态呈现。

### 5.3 Manifest

`asset-manifest.json` 必须完整列出一个模型、横竖背景、横竖 poster 和一个缩略图共六个正式资产。每项包含路径、缓存版本 URL、字节数、尺寸（适用时）、许可证、creator、`redistributionApproved: true` 和运行时 SHA-256；poster/缩略图还绑定模型和 presentation 哈希。证据目录至少包含模型来源、许可证原文、处理报告和背景/预览创建记录。

## 6. 技术方案与影响范围

- `lib/exhibits/schema.ts`：把 `tyrannosaurus` 纳入受控 slug，保持现有字段、三条 prompt、三条 fact、六项素材和 fail-closed 校验；不放宽许可证、来源或哈希规则。
- `content/exhibits/tyrannosaurus/`：新增内容、presentation、manifest 与 evidence；所有双语字段完整，事实引用已有 source ID。
- `lib/exhibits/catalog.ts`：把霸王龙加入唯一 catalog；顺序为三角龙、剑龙、霸王龙。
- `public/museum/animals/tyrannosaurus/`：新增一个自包含 GLB、两张背景、两张 poster 和一张缩略图。
- `app/page.tsx`：增加霸王龙入口并调整“大地展厅”文字，不改变其他展厅或全站信息架构。
- `tests/**`：新增霸王龙内容/路由断言，更新 catalog、正式动物和素材计数，保留现有两只动物的回归语义。
- `scripts/assets/**`：原则上不修改；只有发现第三只动物暴露了通用且已由本 Spec 覆盖的校验缺陷时，才可加强通用 fail-closed 校验，不能增加霸王龙专用例外。
- `lib/viewer/**` 和公共展品页面：原则上不修改。若接入第三只动物必须改变公共行为、测试语义或交互结论，先回到同一 Draft PR 审核。

本需求明确包含 `content/exhibits/**`、`public/museum/**`、`app/**` 和 `tests/**` 承重路径，因此实现使用 Deep Gate。不修改 `package.json`、lockfile、`docs/MUSEUM_TECHNICAL_PLAN.md`、许可证文件、Factory/Agent/Codex 治理或发布配置。

## 7. 必须保持的不变量

- 无账户、广告、行为追踪、评分、竞争、自动播放、惊吓效果或运行时 AI。
- Canvas 不承载唯一内容；SSR、无 JavaScript 和无 WebGL 状态均可完整阅读和导航。
- 每页最多一个 Canvas/renderer；不复制或分叉 `ViewerController`。
- 不在 `html` 或 `body` 锁定滚动；200% 缩放、键盘、移动端和减少动态效果均可用。
- reduced motion 下不自动旋转、不播放位移动画；任何自动旋转都必须在用户主动加载之后且能被交互停止。
- 三角龙和剑龙现有双语事实、来源映射、观察问题、媒体归属、URL 和返回路径不丢失。
- 第三方模型必须允许修改、商业使用与网页再分发；CC BY-NC、CC BY-ND、Editorial、view-only、来源不明资产一律拒绝。
- DUN 原创内容继续使用 CC BY-SA 4.0，代码继续使用 AGPL-3.0，第三方内容保留自身许可和明确归属。
- 运行时哈希与证据一致；必需 Gate 不得跳过或报告 `MISCONFIGURED`。

## 8. 实现顺序

1. 先增加失败测试，证明当前 catalog、首页和 `/exhibits/tyrannosaurus` 尚无霸王龙，并覆盖三只动物/十八项素材的预期。
2. 从 Quaternius 官方包取得并审查霸王龙源文件和 `License.txt`，保存直接来源、许可和原始哈希证据；任一项失败则转回 Draft。
3. 用现有 Blender 导出流水线清理动作、规范化、导出自包含 GLB，并运行 Khronos glTF Validator 和素材预算检查。
4. 建立霸王龙内容包、权威来源映射、presentation 和 manifest，把 slug 加入 schema 与 catalog。
5. 生成独立横竖背景、poster 和缩略图，核对模型/presentation 派生哈希，接入首页和循环导航。
6. 完成自动测试、五个基准视口、低高度横屏、200% 缩放、键盘、失败降级和 reduced motion 检查。
7. 运行 `./.factory/scripts/gates.sh deep`；再由隔离的新 Agent 使用 `factory-verify` 对当前完整 SHA 冷读验证。

## 9. 测试与验证

### 9.1 先失败、后通过

- 路由测试先证明 `/exhibits/tyrannosaurus` 为 404、首页没有霸王龙入口、catalog 不含该 slug；实现后全部通过。
- 素材测试先因缺少霸王龙 manifest/六项资产失败，入库后验证三只动物、十八项资产、真实哈希、预算、许可证和派生关系。
- 内容测试先缺失精确双语文案和来源映射，随后验证三个 prompt、三条 fact、照护者提示和离屏问题。

### 9.2 自动测试

- schema/catalog：三个唯一 slug、完整双语字段、三条 prompt、三条 fact、来源引用、HTTPS URL、许可证白名单和哈希格式。
- 资产：一个自包含 GLB、六项 manifest、Khronos Validator、有限包围盒、Y=0、预算、图像尺寸、provenance 和 poster/presentation 绑定。
- SSR：首页霸王龙链接、霸王龙名称/学名/双语事实/来源/导航/poster/返回路径存在，未知动物仍 404。
- 回归：三角龙和剑龙的内容、来源、路由、静态降级、公共控制和素材验证继续通过。
- 安全体验：无自动播放音频、攻击文案或行为，无账户/追踪/游戏化；可见焦点、44px 目标、响应式 portrait 背景、reduced motion 和不锁滚动保持成立。

### 9.3 手工与视觉检查

在 360×800、390×844、768×1024、1366×768、1920×1080，以及低高度横屏手机检查 poster、模型首帧、旋转后的头/短前肢/脚/长尾、来源区、加载失败和 reduced motion。确认轮廓未被 UI 裁切、脚与地面接触、横竖背景独立、双语不溢出、键盘顺序合理，模型动作安静且没有咆哮或攻击姿态。

记录真实中端手机的 GLB 字节数、解析/首帧时间、三角形、draw calls、纹理数量与最大尺寸、平均帧率和内存观察结果；目标移动端至少 30fps。无法取得章程要求的真实设备证据时，不伪装为完整验收，在 PR 留下可恢复证据并停止交付。

## 10. 验收标准

- 首页、直接 URL 和三个展品间导航均能发现并访问霸王龙。
- 霸王龙页面呈现本 Spec 的双语引导、三个观察问题、照护者提示、三张来源绑定事实卡和离屏问题。
- 三只动物由同一 schema、catalog、参数化页面和 `ViewerController` 驱动；每页只有一个 Canvas/renderer。
- 鼠标、触摸和键盘按钮都能完成观察；reduced motion 下无自动旋转和位移过渡。
- 无 JS、无 WebGL、失败和省流量场景保留静态展品、全部正文和导航。
- 模型及所有媒体满足许可、归属、修改、证据、哈希和预算要求；页面 credits 显示 Quaternius 与 CC0。
- 三角龙、剑龙现有内容、来源、无障碍、SSR 和素材校验无回归。
- 五个视口、200% 缩放、真实移动端性能、自动测试、Deep Gate 和独立验证全部通过。

## 11. 风险与回滚

- **模型权利或官方源失败**：最高风险。停止入库并把同一 PR 转 Draft，不用镜像、品牌资产、非商业资产或临时占位 GLB。
- **模型外观与科学文案冲突**：低多边形模型不作为证据；若两指前肢、两足轮廓等关键可见特征不成立，拒绝模型或回到 Draft，不修改事实迁就模型。
- **捕食者表现惊吓幼儿**：只保留中性站姿和安静 Idle；移除攻击、吼叫、奔跑、张口扑咬及相关文案，视觉检查覆盖各视口首帧。
- **大头长尾导致裁切或相机拟合问题**：先调整该动物的 `presentation.json` 和独立横竖构图；不写 CSS 位移或霸王龙专用查看器。
- **性能或素材预算超限**：优化几何、材质、动画和预览；超过硬上限则拒绝资产并回到 Draft，不放宽全站校验。
- **来源页面或科学结论变化**：更新同一 Spec 和来源映射并重新审核，不静默替换产品文案。

代码回滚可移除 catalog/入口接线并删除完整霸王龙内容包；模型、背景、poster、缩略图、manifest 和 evidence 必须作为一个可追踪单元一起回滚，不能留下失配哈希、缓存 URL、孤立入口或残缺归属。
