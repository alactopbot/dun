import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const macBlender = "/Applications/Blender.app/Contents/MacOS/Blender";
const blender = process.env.BLENDER_BIN || (existsSync(macBlender) ? macBlender : "blender");
for (const animalId of ["triceratops", "stegosaurus", "tyrannosaurus", "smilodon"]) {
  const result = spawnSync(blender, [
    "--background", "--factory-startup", "--disable-autoexec", "--python", "scripts/assets/render_previews.py", "--",
    `public/museum/animals/${animalId}/model/model.glb`, `public/museum/animals/${animalId}`, animalId,
    `content/exhibits/${animalId}/presentation.json`,
  ], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const sync = spawnSync(process.execPath, ["scripts/assets/sync-manifests.mjs"], { stdio: "inherit" });
process.exit(sync.status ?? 1);
