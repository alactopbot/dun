import manifestJson from "./asset-manifest.json";
import presentationJson from "./presentation.json";
import type { AssetManifest, MuseumAnimal, Presentation } from "../../../lib/exhibits/schema";

export const triceratopsExhibit = {
  slug: "triceratops", status: "published", name: { zh: "三角龙", en: "Triceratops" }, scientificName: "Triceratops",
  introduction: { zh: "先不急着读答案。和孩子一起看看这位远古访客，再慢慢打开事实卡片。", en: "Look together before reading the answers, then open each fact card slowly." },
  stageAlt: { zh: "一只低多边形三角龙站在安静的大地展台上；可见三只面角和大颈盾。", en: "A low-poly Triceratops stands on a quiet earth stage, with three facial horns and a large frill visible." },
  adultNote: { zh: "不用立刻告诉孩子答案。先听听孩子怎么说。", en: "You do not need to give the answer yet. Listen to what your child notices first." },
  prompts: [
    { id: "shapes", prompt: { zh: "你看到了哪些形状？", en: "What shapes can you see?" } },
    { id: "special", prompt: { zh: "它的身体哪里最特别？为什么？", en: "Which part looks most special to you? Why?" } },
    { id: "question", prompt: { zh: "如果能问它一个问题，你会问什么？", en: "If you could ask it one question, what would you ask?" } },
  ],
  facts: [
    { id: "three-horned-face", text: { zh: "“三角龙”的名字意为“三只角的脸”；头上有三只角和一圈大颈盾。", en: "The name means “three-horned face”; it had three facial horns and a large frill." }, sourceIds: ["nhm-triceratops"], evidence: "fossil-evidence" },
    { id: "plant-eater", text: { zh: "三角龙吃植物；喙和后排牙齿帮助剪下、切碎植物。", en: "Triceratops ate plants; its beak and back teeth helped cut plant material." }, sourceIds: ["nhm-triceratops", "amnh-dinosaur-facts"], evidence: "fossil-evidence" },
    { id: "four-legs-late-cretaceous", text: { zh: "它用四条腿行走，生活在约 6800 万至 6600 万年前的晚白垩世。", en: "It walked on four legs and lived about 68–66 million years ago in the Late Cretaceous." }, sourceIds: ["nhm-triceratops", "smithsonian-last-american-dinosaurs"], evidence: "scientific-consensus" },
  ],
  closingPrompt: { zh: "离开屏幕后，找一找身边的圆形、尖角和扇形。", en: "Away from the screen, look for circles, points, and fan shapes around you." },
  sources: [
    { id: "nhm-triceratops", title: "Triceratops", publisher: "Natural History Museum", url: "https://www.nhm.ac.uk/discover/dino-directory/triceratops.html", accessedOn: "2026-08-24", locator: "Name meaning; introductory anatomy; directory summary; What did Triceratops eat?", supports: "支持名称含义、三只面角与大颈盾、植物食性、喙与后排牙齿、四足行走和 6800 万至 6600 万年前的年代。" },
    { id: "amnh-dinosaur-facts", title: "Dinosaur Facts", publisher: "American Museum of Natural History", url: "https://www.amnh.org/dinosaurs/dinosaur-facts", accessedOn: "2026-08-24", locator: "Teeth, Footprints, and Feathers", supports: "支持三角龙的多排牙齿形成带锋利脊面的齿墙，用来切下植物。" },
    { id: "smithsonian-last-american-dinosaurs", title: "The Last American Dinosaurs: Discovering a Lost World", publisher: "Smithsonian National Museum of Natural History", url: "https://naturalhistory.si.edu/exhibits/last-american-dinosaurs-discovering-lost-world", accessedOn: "2026-08-24", locator: "A Glimpse Back in Time", supports: "支持非鸟类恐龙生活到白垩纪末约 6600 万年前的时间背景。" },
  ],
  manifest: manifestJson as AssetManifest, presentation: presentationJson as unknown as Presentation,
} as const satisfies MuseumAnimal;
