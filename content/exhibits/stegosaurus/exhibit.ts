import manifestJson from "./asset-manifest.json";
import presentationJson from "./presentation.json";
import type { AssetManifest, MuseumAnimal, Presentation } from "../../../lib/exhibits/schema";

export const stegosaurusExhibit = {
  slug: "stegosaurus", status: "published", name: { zh: "剑龙", en: "Stegosaurus" }, scientificName: "Stegosaurus",
  introduction: { zh: "先看看它背上的板和尾巴，再慢慢打开事实卡片。", en: "Look at the plates along its back and its tail before opening the fact cards." },
  stageAlt: { zh: "一只低多边形剑龙站在安静的大地展台上；背板从颈部延伸到尾部，尾端可见尖刺。", en: "A low-poly Stegosaurus stands on a quiet earth stage, with plates along its back and spikes visible near the end of its tail." },
  adultNote: { zh: "先描述看见的形状和位置；背板有什么用途，科学家还没有确定答案。", en: "Start with the shapes and positions you can see; scientists are still uncertain what the plates were for." },
  prompts: [
    { id: "plates", prompt: { zh: "它背上的板，从头到尾有什么变化？", en: "How do the plates change from head to tail?" } },
    { id: "tail-spikes", prompt: { zh: "你能找到尾巴末端的尖刺吗？", en: "Can you find the spikes at the end of its tail?" } },
    { id: "other-side", prompt: { zh: "如果从另一边看，你想先观察哪里？", en: "What would you look at first from the other side?" } },
  ],
  facts: [
    { id: "roof-lizard", text: { zh: "“剑龙”的名字意为“屋顶蜥蜴”；它是一种吃植物的装甲类恐龙。", en: "The name Stegosaurus means “roof lizard”; it was a plant-eating armoured dinosaur." }, sourceIds: ["nhm-stegosaurus"], evidence: "fossil-evidence" },
    { id: "late-jurassic", text: { zh: "它生活在约 1.52 亿至 1.45 亿年前的晚侏罗世，用四条腿行走。", en: "It lived about 152–145 million years ago in the Late Jurassic and walked on four legs." }, sourceIds: ["nhm-stegosaurus", "nhm-stegosaurus-life"], evidence: "scientific-consensus" },
    { id: "plates", text: { zh: "它背上的骨板竖立在皮肤里；科学家仍不确定这些骨板的用途。", en: "The bony plates stood upright in the skin; scientists are still uncertain what the plates were used for." }, sourceIds: ["nhm-stegosaurus", "nhm-stegosaurus-life"], evidence: "fossil-evidence" },
  ],
  closingPrompt: { zh: "离开屏幕后，找一找从小到大排列的形状。", en: "Away from the screen, look for shapes arranged from small to large." },
  sources: [
    { id: "nhm-stegosaurus", title: "Stegosaurus", publisher: "Natural History Museum", url: "https://www.nhm.ac.uk/discover/dino-directory/Stegosaurus.html", accessedOn: "2026-08-25", locator: "Dino directory: name, diet, period and plates", supports: "支持名称含义、装甲类植物食性、晚侏罗世 152–145 Ma、背板位于皮肤中且用途仍不确定。" },
    { id: "nhm-stegosaurus-life", title: "A Stegosaurus brought to life", publisher: "Natural History Museum", url: "https://www.nhm.ac.uk/discover/stegosaurus-brought-to-life.html", accessedOn: "2026-08-25", locator: "Movement, diet and plate hypotheses", supports: "支持约 1.5 亿年前、四足行走、植物食性，以及背板功能仍属多个假说。" },
    { id: "amnh-colorful-display", title: "Colorful Display", publisher: "American Museum of Natural History", url: "https://www.amnh.org/exhibitions/dinosaurs-ancient-fossils/display-or-defense/colorful-display", accessedOn: "2026-08-25", locator: "Stegosaurus plate blood-vessel grooves and hypotheses", supports: "作为照护者资料的交叉来源，支持背板有血管沟槽、可能用于展示或体温调节，但不把任一假说写成儿童事实。" },
  ],
  manifest: manifestJson as AssetManifest, presentation: presentationJson as unknown as Presentation,
} as const satisfies MuseumAnimal;
