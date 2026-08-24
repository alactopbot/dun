export type LocalizedText = Readonly<{ zh: string; en: string }>;
export type EvidenceLevel = "fossil-evidence" | "scientific-consensus" | "hypothesis";
export type SourceReference<Id extends string = string> = Readonly<{
  id: Id;
  title: string;
  publisher: string;
  url: `https://${string}`;
  accessedOn: `${number}-${number}-${number}`;
  locator: string;
  supports: string;
}>;

export const triceratopsSources = [
  {
    id: "nhm-triceratops",
    title: "Triceratops",
    publisher: "Natural History Museum",
    url: "https://www.nhm.ac.uk/discover/dino-directory/triceratops.html",
    accessedOn: "2026-08-24",
    locator: "Name meaning; directory summary; What did Triceratops eat?",
    supports: "支持名称含义、三只面角与大颈盾、植物食性、喙与后排牙齿、四足行走和 6800 万至 6600 万年前的年代。",
  },
  {
    id: "amnh-dinosaur-facts",
    title: "Dinosaur Facts",
    publisher: "American Museum of Natural History",
    url: "https://www.amnh.org/dinosaurs/dinosaur-facts",
    accessedOn: "2026-08-24",
    locator: "Teeth, Footprints, and Feathers",
    supports: "支持三角龙的多排牙齿形成带锋利脊面的齿墙，用来切下植物。",
  },
  {
    id: "smithsonian-last-american-dinosaurs",
    title: "The Last American Dinosaurs: Discovering a Lost World",
    publisher: "Smithsonian National Museum of Natural History",
    url: "https://naturalhistory.si.edu/exhibits/last-american-dinosaurs-discovering-lost-world",
    accessedOn: "2026-08-24",
    locator: "A Glimpse Back in Time",
    supports: "支持非鸟类恐龙生活到白垩纪末约 6600 万年前的时间背景。",
  },
] as const satisfies readonly SourceReference[];

export type TriceratopsSourceId = (typeof triceratopsSources)[number]["id"];
export type ExhibitFact = Readonly<{
  id: string;
  text: LocalizedText;
  sourceIds: readonly TriceratopsSourceId[];
  evidence: EvidenceLevel;
}>;
export type ObservationPrompt = Readonly<{
  id: string;
  prompt: LocalizedText;
  adultNote?: LocalizedText;
}>;
export type MediaCredit = Readonly<{
  path: `/media/${string}`;
  width: number;
  height: number;
  alt: LocalizedText;
  creator: string;
  license: "CC-BY-SA-4.0";
  source?: `https://${string}`;
}>;
export type TriceratopsExhibit = Readonly<{
  slug: "triceratops";
  name: LocalizedText;
  scientificName: "Triceratops";
  introduction: LocalizedText;
  prompts: readonly [ObservationPrompt, ObservationPrompt, ObservationPrompt];
  facts: readonly [ExhibitFact, ExhibitFact, ExhibitFact];
  closingPrompt: ObservationPrompt;
  sources: typeof triceratopsSources;
  media: readonly [MediaCredit];
}>;

const adultNote = {
  zh: "不用立刻告诉孩子答案。先听听孩子怎么说。",
  en: "You do not need to give the answer yet. Listen to what your child notices first.",
} as const;

export const triceratopsExhibit = {
  slug: "triceratops",
  name: { zh: "三角龙", en: "Triceratops" },
  scientificName: "Triceratops",
  introduction: {
    zh: "先不急着读答案。和孩子一起看看这位远古访客，再慢慢打开事实卡片。",
    en: "Look together before reading the answers, then open each fact card slowly.",
  },
  prompts: [
    { id: "shapes", prompt: { zh: "你看到了哪些形状？", en: "What shapes can you see?" }, adultNote },
    { id: "special", prompt: { zh: "它的身体哪里最特别？为什么？", en: "Which part looks most special to you? Why?" } },
    { id: "question", prompt: { zh: "如果能问它一个问题，你会问什么？", en: "If you could ask it one question, what would you ask?" } },
  ],
  facts: [
    { id: "three-horned-face", text: { zh: "“三角龙”的名字意为“三只角的脸”；头上有三只角和一圈大颈盾。", en: "The name means “three-horned face”; it had three facial horns and a large frill." }, sourceIds: ["nhm-triceratops"], evidence: "fossil-evidence" },
    { id: "plant-eater", text: { zh: "三角龙吃植物；喙和后排牙齿帮助剪下、切碎植物。", en: "Triceratops ate plants; its beak and back teeth helped cut plant material." }, sourceIds: ["nhm-triceratops", "amnh-dinosaur-facts"], evidence: "fossil-evidence" },
    { id: "four-legs-late-cretaceous", text: { zh: "它用四条腿行走，生活在约 6800 万至 6600 万年前的晚白垩世。", en: "It walked on four legs and lived about 68–66 million years ago in the Late Cretaceous." }, sourceIds: ["nhm-triceratops", "smithsonian-last-american-dinosaurs"], evidence: "scientific-consensus" },
  ],
  closingPrompt: { id: "away", prompt: { zh: "离开屏幕后，找一找身边的圆形、尖角和扇形。", en: "Away from the screen, look for circles, points, and fan shapes around you." } },
  sources: triceratopsSources,
  media: [{
    path: "/media/triceratops/exhibit.webp",
    width: 1536,
    height: 1024,
    alt: { zh: "一只三角龙站在抽象博物馆背景中的复原想象图", en: "An artist’s reconstruction of a Triceratops in an abstract museum setting" },
    creator: "DUN 项目（使用 OpenAI 图像生成工具创作）",
    license: "CC-BY-SA-4.0",
  }],
} as const satisfies TriceratopsExhibit;

export function validateTriceratopsExhibit(exhibit: TriceratopsExhibit): readonly string[] {
  const errors: string[] = [];
  const unique = (values: readonly string[]) => new Set(values).size === values.length;
  const textPairs = [exhibit.name, exhibit.introduction, exhibit.closingPrompt.prompt,
    ...exhibit.prompts.flatMap((item) => [item.prompt, ...(item.adultNote ? [item.adultNote] : [])]),
    ...exhibit.facts.map((item) => item.text), ...exhibit.media.map((item) => item.alt)];
  if (textPairs.some(({ zh, en }) => !zh.trim() || !en.trim())) errors.push("双语字段不能为空");
  if (exhibit.prompts.length !== 3 || exhibit.facts.length !== 3 || exhibit.media.length !== 1) errors.push("展品数量约束不满足");
  if (!unique(exhibit.sources.map(({ id }) => id)) || !unique(exhibit.facts.map(({ id }) => id)) ||
      !unique(exhibit.prompts.map(({ id }) => id)) || !unique(exhibit.media.map(({ path }) => path))) errors.push("编号或媒体路径必须唯一");
  const sourceIds = new Set(exhibit.sources.map(({ id }) => id));
  if (exhibit.sources.some((source) => !source.url.startsWith("https://") || !/^\d{4}-\d{2}-\d{2}$/.test(source.accessedOn) || !source.locator.trim() || !source.supports.trim())) errors.push("来源记录不完整");
  if (exhibit.facts.some((fact) => !fact.sourceIds.length || fact.sourceIds.some((id) => !sourceIds.has(id)) || fact.evidence === "hypothesis")) errors.push("事实来源或证据级别无效");
  if (exhibit.media.some((media) => media.width <= 0 || media.height <= 0 || media.license !== "CC-BY-SA-4.0")) errors.push("媒体记录无效");
  return errors;
}

const validationErrors = validateTriceratopsExhibit(triceratopsExhibit);
if (validationErrors.length) throw new Error(`三角龙展品内容校验失败：${validationErrors.join("；")}`);
