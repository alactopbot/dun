import manifestJson from "./asset-manifest.json";
import presentationJson from "./presentation.json";
import type { AssetManifest, MuseumAnimal, Presentation } from "../../../lib/exhibits/schema";

export const smilodonExhibit = {
  slug: "smilodon", status: "published", name: { zh: "剑齿虎", en: "Smilodon" }, scientificName: "Smilodon fatalis",
  introduction: { zh: "先看看它的长牙、短尾巴和强壮的前腿，再慢慢打开事实卡片。", en: "Look at its long teeth, short tail, and strong front legs before opening the fact cards." },
  stageAlt: { zh: "一只低多边形剑齿虎安静地站在大地展台上；可见两颗长犬齿、强壮前腿和短尾巴。", en: "A low-poly Smilodon stands quietly on an earth stage, with two long canine teeth, strong front legs, and a short tail visible." },
  adultNote: { zh: "先描述看见的长牙、短尾巴和前腿；真实的毛色没有被化石保存下来。", en: "Start with the long teeth, short tail, and front legs you can see; its real fur colour was not preserved as fossils." },
  prompts: [
    { id: "long-teeth", prompt: { zh: "你能找到那两颗特别长的牙吗？", en: "Can you find the two extra-long teeth?" } },
    { id: "front-legs", prompt: { zh: "它的前腿看起来怎样？和后腿比一比。", en: "How do the front legs look compared with the back legs?" } },
    { id: "short-tail", prompt: { zh: "转到侧面看，它的尾巴是长还是短？", en: "From the side, is the tail long or short?" } },
  ],
  facts: [
    { id: "not-a-tiger", text: { zh: "人们常叫它“剑齿虎”，但它并不是真正的老虎；它是已经消失的剑齿猫，和现在的老虎关系很远。", en: "It is often called a saber-toothed tiger, but it was not a true tiger; it was an extinct saber-toothed cat only distantly related to living tigers." }, sourceIds: ["geokansas-smilodon"], evidence: "scientific-consensus" },
    { id: "ice-age-americas", text: { zh: "剑齿虎生活在北美和南美，大约在一万年前消失；许多化石发现于洛杉矶的拉布雷亚沥青坑。", en: "Smilodon lived in North and South America and disappeared about 10,000 years ago; many fossils come from the La Brea Tar Pits in Los Angeles." }, sourceIds: ["amnh-smilodon-teeth", "labrea-here-kitty"], evidence: "scientific-consensus" },
    { id: "long-canines", text: { zh: "它上颌有两颗特别长的犬齿，可以长到大约 18 厘米；科学家还不知道它真实的毛色。", en: "It had two extra-long upper canine teeth that could grow to about 18 centimetres; scientists do not know its real fur colour." }, sourceIds: ["amnh-smilodon-teeth", "labrea-here-kitty"], evidence: "fossil-evidence" },
  ],
  closingPrompt: { zh: "离开屏幕后，找一找又长又弯的形状。", en: "Away from the screen, look for a shape that is both long and curved." },
  sources: [
    { id: "geokansas-smilodon", title: "Saber-Toothed Cat (Smilodon)", publisher: "University of Kansas GeoKansas", url: "https://geokansas.ku.edu/saber-toothed-cat-smilodon", accessedOn: "2026-08-30", locator: "Name and relationship to living cats; Pleistocene extinction about 10,000 years ago", supports: "支持剑齿虎名称具有误导性、并非真正的老虎，以及约一万年前消失。" },
    { id: "amnh-smilodon-teeth", title: "How the Smilodon Got Its Teeth", publisher: "American Museum of Natural History", url: "https://www.amnh.org/explore/news-blogs/smilodon-teeth-evolution", accessedOn: "2026-08-30", locator: "Smilodon fatalis in North and South America until about 10,000 years ago; canines about 18 centimetres", supports: "支持北美和南美分布、约一万年前消失，以及上犬齿可达约 18 厘米。" },
    { id: "labrea-here-kitty", title: "Here, Kitty, Kitty", publisher: "La Brea Tar Pits", url: "https://tarpits.org/stories/here-kitty-kitty", accessedOn: "2026-08-30", locator: "Smilodon fatalis at La Brea; no preserved fur", supports: "支持拉布雷亚化石记录，以及没有保存下来的毛皮因而真实毛色未知。" },
  ],
  manifest: manifestJson as AssetManifest, presentation: presentationJson as unknown as Presentation,
} as const satisfies MuseumAnimal;
