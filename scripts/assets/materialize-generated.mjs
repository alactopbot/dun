import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const specPath = resolve(root, "content/exhibits/smilodon/runtime-binaries.json");
const spec = JSON.parse(await readFile(specPath, "utf8"));
for (const [relative, encoding] of Object.entries(spec)) {
  const absolute = resolve(root, relative);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, Buffer.from(encoding, "base64"));
}
