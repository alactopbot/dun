import manifestJson from "./asset-manifest.json";
import presentationJson from "./presentation.json";
import type { AssetManifest, MuseumAnimal, Presentation } from "../../../lib/exhibits/schema";

export const smilodonExhibit = {
  slug: "smilodon", status: "published", name: { zh: "剑齿虎", en: "Smilodon" }, scientificName: "Smilodon",
  introduction: { zh: "先看看它的长牙和短尾巴，再慢慢打开事实卡片。", en: "Look at its long teeth and short tail before opening the fact cards." },
  stageAlt: { zh: "一只低多边形剑齿虎站在安静的大地展台上；可见向下伸出的长牙和短尾巴。", en: "A low-poly Smilodon stands on a quiet earth stage, with long downward teeth and a short tail visible." },
  adultNote: { zh: "先听孩子说看见的牙齿和尾巴。名字里的“虎”是俗称；它是猫科动物，不是老虎。", en: "Start with the teeth and tail your child notices. The word “tiger” is a nickname; Smilodon is a cat, not a tiger." },
  prompts: [
    { id: "teeth", prompt: { zh: "你看到它向下伸出的长牙了吗？", en: "Can you see the long teeth pointing down?" } },
    { id: "tail", prompt: { zh: "它的尾巴长还是短？", en: "Is its tail long or short?" } },
    { id: "side", prompt: { zh: "如果从旁边看，你想先观察哪里？", en: "What would you look at first from the side?" } },
  ],
  facts: [
    { id: "saber-teeth", text: { zh: "“剑齿”说的是它很长的上门牙；你可以看见两颗向下伸出的长牙。", en: "The name points to its long upper teeth; you can see two long teeth pointing down." }, sourceIds: ["nhm-smilodon-sabre"], evidence: "fossil-evidence" },
    { id: "ice-age-americas", text: { zh: "它生活在大约 250 万到 1.2 万年前；人们在美洲找到过它的骨头，很多来自沥青坑。", en: "It lived about 2.5 million to 12,000 years ago; people found its bones in the Americas, many in asphalt seeps." }, sourceIds: ["nhm-smilodon-sabre", "tarpits-here-kitty"], evidence: "scientific-consensus" },
    { id: "cat-not-tiger", text: { zh: "它用四条腿走路；大家常叫它剑齿虎，其实它是猫科动物，不是老虎。", en: "It walked on four legs; people often say “saber-toothed tiger,” but it is a cat, not a tiger." }, sourceIds: ["tarpits-not-tiger", "tarpits-here-kitty"], evidence: "fossil-evidence" },
  ],
  closingPrompt: { zh: "离开屏幕后，找一找又长又弯的形状。", en: "Away from the screen, look for long, curved shapes." },
  sources: [
    { id: "nhm-smilodon-sabre", title: "One of the earliest sabre-toothed mammals discovered in the USA", publisher: "Natural History Museum", url: "https://www.nhm.ac.uk/discover/news/2022/march/one-of-earliest-sabre-toothed-mammals-discovered-usa.html", accessedOn: "2026-08-30", locator: "Smilodon, the sabre-toothed tiger; Pleistocene 2.5 million to 12,000 years ago; large canine teeth", supports: "支持剑齿虎生活在更新世约 250 万至 1.2 万年前的美洲，并以很长的犬齿为显著特征。" },
    { id: "tarpits-not-tiger", title: "Smilodon, Saber-Tooths, and Tigers…Oh My!", publisher: "La Brea Tar Pits", url: "https://tarpits.org/stories/smilodon-saber-tooths-and-tigersoh-my", accessedOn: "2026-08-30", locator: "Why we don’t call Smilodon a Saber-toothed Tiger; Felidae; asphaltic deposits", supports: "支持剑齿虎属于猫科、不是老虎；沥青坑出土过大量 Smilodon 化石。不把捕猎场面写成儿童事实。" },
    { id: "tarpits-here-kitty", title: "Here, Kitty, Kitty", publisher: "La Brea Tar Pits / Natural History Museum of Los Angeles County", url: "https://nhm.org/stories/here-kitty-kitty", accessedOn: "2026-08-30", locator: "Smilodon fatalis bio: more than 2,000 individuals; extinct around 11,000 years ago; size and paws", supports: "支持在沥青坑发现两千具以上个体、约 1.1 万年前消失，以及用四足站立、行走的猫科身体形态。" },
  ],
  manifest: manifestJson as AssetManifest, presentation: presentationJson as unknown as Presentation,
} as const satisfies MuseumAnimal;
