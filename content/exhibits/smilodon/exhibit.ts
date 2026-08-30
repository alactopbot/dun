import manifestJson from "./asset-manifest.json";
import presentationJson from "./presentation.json";
import type { AssetManifest, MuseumAnimal, Presentation } from "../../../lib/exhibits/schema";

export const smilodonExhibit = {
  slug: "smilodon", status: "published", name: { zh: "剑齿虎", en: "Smilodon" }, scientificName: "Smilodon",
  introduction: { zh: "先看看它的长牙和壮壮的身体，再慢慢打开事实卡片。", en: "Look at its long teeth and sturdy body before opening the fact cards." },
  stageAlt: { zh: "一只低多边形剑齿虎安静地站在展台上；可见两颗长长的上门牙、四条腿和较短的尾巴。", en: "A low-poly Smilodon stands quietly on a stage, with two long upper teeth, four legs, and a short tail visible." },
  adultNote: { zh: "先描述看见的形状。毛色和叫声没有被化石保存下来；展台上的模型是安静的艺术复原。", en: "Start with the shapes you can see. Fur colour and voice were not preserved as fossils; the model is a quiet artistic reconstruction." },
  prompts: [
    { id: "long-teeth", prompt: { zh: "你能找到它的两颗长牙吗？", en: "Can you find its two long teeth?" } },
    { id: "sturdy-body", prompt: { zh: "它的身体哪里看起来又壮又稳？", en: "Which part of its body looks sturdy and steady?" } },
    { id: "other-side", prompt: { zh: "如果转到另一边，你想先看哪里？", en: "If you turn to the other side, what would you look at first?" } },
  ],
  facts: [
    { id: "knife-tooth", text: { zh: "人们常叫它剑齿虎，科学家叫它 Smilodon。它的上门牙像一把长长的刀；它是一种猫科动物，并不是今天的老虎。", en: "People often call it a saber-toothed tiger; scientists call it Smilodon. Its upper teeth look like long knives. It was a cat, not a living tiger." }, sourceIds: ["mv-smilodon"], evidence: "scientific-consensus" },
    { id: "long-canines", text: { zh: "它有两颗很长、像短剑一样的上门牙；其中一种剑齿虎的犬齿大约有 18 厘米长。", en: "It had two very long, dagger-like upper teeth; one kind of Smilodon had canines about 18 centimetres long." }, sourceIds: ["amnh-smilodon-teeth"], evidence: "fossil-evidence" },
    { id: "ice-age-americas", text: { zh: "它生活在冰河时期的美洲，大约 250 万年前到 1 万多年前。", en: "It lived in the Americas during the Ice Age, from about 2.5 million years ago until a little more than 10,000 years ago." }, sourceIds: ["nhm-sabre-tooths", "amnh-smilodon-teeth"], evidence: "scientific-consensus" },
  ],
  closingPrompt: { zh: "离开屏幕后，找一找又长又弯的形状。", en: "Away from the screen, look for a long, curved shape." },
  sources: [
    { id: "mv-smilodon", title: "Fossil — Sabre-toothed Tiger skull, Smilodon", publisher: "Museums Victoria", url: "https://collections.museumsvictoria.com.au/specimens/1045165", accessedOn: "2026-08-30", locator: "Specimen narrative: common name, knife-like canines, not closely related to tigers", supports: "支持人们常称剑齿虎、上门牙呈刀状，以及它与今天的老虎并非近亲。" },
    { id: "amnh-smilodon-teeth", title: "How the Smilodon Got Its Teeth", publisher: "American Museum of Natural History", url: "https://www.amnh.org/explore/news-blogs/smilodon-teeth-evolution", accessedOn: "2026-08-30", locator: "Smilodon fatalis range, extinction, and canine length", supports: "支持 Smilodon fatalis 生活在北美和南美、大约 1 万年前灭绝，以及犬齿大约 18 厘米长。" },
    { id: "nhm-sabre-tooths", title: "One of the earliest sabre-toothed mammals discovered in the USA", publisher: "Natural History Museum", url: "https://www.nhm.ac.uk/discover/news/2022/march/one-of-earliest-sabre-toothed-mammals-discovered-usa.html", accessedOn: "2026-08-30", locator: "What are sabre-tooths?: Smilodon in the Pleistocene Americas", supports: "支持 Smilodon 是猫科近亲、生活在更新世美洲，大约 250 万年前到 1.2 万年前。" },
  ],
  manifest: manifestJson as AssetManifest, presentation: presentationJson as unknown as Presentation,
} as const satisfies MuseumAnimal;
