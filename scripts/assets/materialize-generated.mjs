import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const runtimeDir = resolve(root, "content/exhibits/smilodon/runtime");
const index = JSON.parse(await readFile(resolve(runtimeDir, "index.json"), "utf8"));
for (const [relative, parts] of Object.entries(index)) {
  const encoding = (await Promise.all(parts.map((name) => readFile(resolve(runtimeDir, name), "utf8")))).join("");
  const absolute = resolve(root, relative);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, Buffer.from(encoding, "base64"));
}
