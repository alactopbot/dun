export type LocalizedText = Readonly<{ zh: string; en: string }>;
export type EvidenceLevel = "fossil-evidence" | "scientific-consensus";
export type AssetType = "model" | "background" | "poster" | "thumbnail";
export type ScientificSource = Readonly<{ id: string; title: string; publisher: string; url: `https://${string}`; accessedOn: `${number}-${number}-${number}`; locator: string; supports: string }>;
export type RuntimeAsset = Readonly<{ type: AssetType; variant?: "landscape" | "portrait"; path: string; url: string; bytes: number; width?: number; height?: number; runtimeSha256: string; originalSha256?: string; modelSha256?: string; presentationSha256?: string; license: "CC0-1.0" | "CC-BY-4.0" | "CC-BY-SA-4.0"; creator: string; title?: string; source?: string; sketchfabUid?: string; licenseUrl?: string; attribution?: string; modifications?: string; downloadedAt?: `${number}-${number}-${number}`; redistributionApproved: boolean }>;
export type AssetManifest = Readonly<{ animalId: string; presentationSha256: string; assets: readonly RuntimeAsset[] }>;
export type Presentation = Readonly<{ cameraFov: number; cameraDirection: readonly [number, number, number]; cameraDistanceFactor?: number; targetHeightRatio: number; minDistanceFactor: number; maxDistanceFactor: number; autoRotateRadiansPerSecond: number }>;
export type MuseumAnimal = Readonly<{
  slug: "triceratops" | "stegosaurus" | "tyrannosaurus" | "smilodon"; status: "published"; name: LocalizedText; scientificName: string;
  introduction: LocalizedText; stageAlt: LocalizedText; adultNote: LocalizedText;
  prompts: readonly Readonly<{ id: string; prompt: LocalizedText }>[];
  facts: readonly Readonly<{ id: string; text: LocalizedText; sourceIds: readonly string[]; evidence: EvidenceLevel }>[];
  closingPrompt: LocalizedText; sources: readonly ScientificSource[]; manifest: AssetManifest; presentation: Presentation;
}>;

export function asset(animal: MuseumAnimal, type: AssetType, variant?: RuntimeAsset["variant"]) {
  const match = animal.manifest.assets.find((item) => item.type === type && item.variant === variant);
  if (!match) throw new Error(`${animal.slug}: missing ${type}${variant ? `/${variant}` : ""}`);
  return match;
}

export function validateAnimal(animal: MuseumAnimal): readonly string[] {
  const errors: string[] = [];
  const nonempty = (text: LocalizedText) => text.zh.trim() && text.en.trim();
  if (!/^[a-z]+$/.test(animal.slug) || animal.status !== "published") errors.push("invalid publication state");
  if (![animal.name, animal.introduction, animal.stageAlt, animal.adultNote, animal.closingPrompt].every(nonempty)) errors.push("localized copy is incomplete");
  if (animal.prompts.length !== 3 || animal.facts.length !== 3 || animal.manifest.assets.length !== 6) errors.push("required item count is not met");
  const sourceIds = new Set(animal.sources.map(({ id }) => id));
  if (sourceIds.size !== animal.sources.length || animal.facts.some((fact) => !fact.sourceIds.length || fact.sourceIds.some((id) => !sourceIds.has(id)))) errors.push("fact source mapping is invalid");
  if (animal.sources.some((source) => !source.url.startsWith("https://") || !/^\d{4}-\d{2}-\d{2}$/.test(source.accessedOn) || !source.locator || !source.supports)) errors.push("source evidence is incomplete");
  if (animal.manifest.animalId !== animal.slug || animal.manifest.assets.some((item) => !item.redistributionApproved || !/^[a-f0-9]{64}$/.test(item.runtimeSha256))) errors.push("asset provenance is invalid");
  return errors;
}
