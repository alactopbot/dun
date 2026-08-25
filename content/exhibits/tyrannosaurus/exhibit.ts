import manifestJson from "./asset-manifest.json";
import presentationJson from "./presentation.json";
import type { AssetManifest, MuseumAnimal, Presentation } from "../../../lib/exhibits/schema";

export const tyrannosaurusExhibit = {
  slug: "tyrannosaurus", status: "published", name: { zh: "霸王龙", en: "Tyrannosaurus rex" }, scientificName: "Tyrannosaurus rex",
  introduction: { zh: "先看看它的大头、短前肢和长尾巴，再慢慢打开事实卡片。", en: "Look at its large head, short forelimbs, and long tail before opening the fact cards." },
  stageAlt: { zh: "一只低多边形霸王龙安静地站在大地展台上；可见大头、两根手指的短前肢、两条后腿和长尾巴。", en: "A low-poly Tyrannosaurus rex stands quietly on an earth stage, with a large head, two-fingered short forelimbs, two hind legs, and a long tail visible." },
  adultNote: { zh: "先描述看见的形状；它真实的颜色和声音没有被化石完整保存下来。", en: "Start with the shapes you can see; its real colours and sounds were not fully preserved as fossils." },
  prompts: [
    { id: "large-small-shapes", prompt: { zh: "从头到尾，你看到了哪些大形状和小形状？", en: "What large and small shapes can you see from head to tail?" } },
    { id: "forelimb-fingers", prompt: { zh: "你能在每只短前肢上找到几根手指？", en: "How many fingers can you find on each short forelimb?" } },
    { id: "balance", prompt: { zh: "转到侧面看，长尾巴和大头怎样分在身体两边？", en: "From the side, how are the long tail and large head arranged on either side of the body?" } },
  ],
  facts: [
    { id: "name-and-balance", text: { zh: "“Tyrannosaurus rex”的名字意为“暴君蜥蜴之王”；它用两条腿行走，尾巴帮助保持平衡。", en: "The name Tyrannosaurus rex means “tyrant lizard king”; it walked on two legs and used its tail for balance." }, sourceIds: ["amnh-ology-trex"], evidence: "fossil-evidence" },
    { id: "time-and-place", text: { zh: "霸王龙生活在约 6800 万至 6600 万年前的晚白垩世，化石发现于北美。", en: "Tyrannosaurus rex lived in North America about 68–66 million years ago, near the end of the Late Cretaceous." }, sourceIds: ["amnh-trex-educator-guide"], evidence: "scientific-consensus" },
    { id: "teeth", text: { zh: "它有尖锐、略向后弯曲并带锯齿的牙齿；这些牙齿帮助它刺入和撕开肉。", en: "It had pointed, slightly backward-curving, serrated teeth that helped pierce and tear meat." }, sourceIds: ["amnh-dinosaur-facts"], evidence: "fossil-evidence" },
  ],
  closingPrompt: { zh: "离开屏幕后，找一找一边大、一边长，却仍显得平衡的形状。", en: "Away from the screen, look for a shape with something large on one side and something long on the other that still seems balanced." },
  sources: [
    { id: "amnh-ology-trex", title: "Tyrannosaurus rex OLogy card", publisher: "American Museum of Natural History", url: "https://www.amnh.org/explore/ology/ology-cards/003-tyrannosaurus-rex?view=modal", accessedOn: "2026-08-25", locator: "Card 003: name, locomotion and tail balance", supports: "支持 Tyrannosaurus rex 名称含义、两足行走和尾巴帮助平衡。" },
    { id: "amnh-trex-educator-guide", title: "T. rex: The Ultimate Predator — Educator's Guide", publisher: "American Museum of Natural History", url: "https://www.amnh.org/content/download/242887/4197931/file/Trex_EducatorsGuide.pdf", accessedOn: "2026-08-25", locator: "Exhibition overview and map: 68–66 million years ago, Late Cretaceous North America", supports: "支持霸王龙生活在约 6800 万至 6600 万年前、晚白垩世和北美。" },
    { id: "amnh-dinosaur-facts", title: "Dinosaur Facts", publisher: "American Museum of Natural History", url: "https://www.amnh.org/dinosaurs/dinosaur-facts", accessedOn: "2026-08-25", locator: "Teeth, Footprints, and Feathers", supports: "支持霸王龙等兽脚类牙齿尖锐、略向后弯曲、带锯齿，并用于刺入和撕开肉。" },
  ],
  manifest: manifestJson as AssetManifest, presentation: presentationJson as unknown as Presentation,
} as const satisfies MuseumAnimal;
