import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const animalId of ["triceratops", "stegosaurus"]) {
  const manifestPath = `content/exhibits/${animalId}/asset-manifest.json`;
  const presentation = await readFile(`content/exhibits/${animalId}/presentation.json`);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.presentationSha256 = sha256(presentation);
  for (const asset of manifest.assets) {
    const bytes = await readFile(asset.path);
    asset.bytes = bytes.length;
    asset.runtimeSha256 = sha256(bytes);
    asset.url = `${asset.url.split("?")[0]}?v=${asset.runtimeSha256.slice(0, 12)}`;
  }
  const modelSha256 = manifest.assets.find(({ type }) => type === "model").runtimeSha256;
  for (const asset of manifest.assets.filter(({ type }) => ["poster", "thumbnail"].includes(type))) {
    asset.modelSha256 = modelSha256;
    asset.presentationSha256 = manifest.presentationSha256;
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
