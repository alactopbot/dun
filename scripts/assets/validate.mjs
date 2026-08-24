import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateBytes as validateGltfBytes, version as gltfValidatorVersion } from "gltf-validator";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function inspectGlb(bytes, errors, label) {
  if (bytes.length < 20 || bytes.toString("ascii", 0, 4) !== "glTF") {
    errors.push(`${label}: invalid GLB header`);
    return;
  }
  const jsonLength = bytes.readUInt32LE(12);
  let gltf;
  try { gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8")); }
  catch { errors.push(`${label}: unreadable GLB JSON`); return; }
  if (gltf.asset?.version !== "2.0") errors.push(`${label}: not glTF 2.0`);
  if ((gltf.buffers ?? []).some((item) => item.uri)) errors.push(`${label}: external buffer URI`);
  if ((gltf.images ?? []).some((item) => item.uri)) errors.push(`${label}: external image URI`);
  if ((gltf.cameras ?? []).length) errors.push(`${label}: camera embedded in runtime model`);
  const nodeNames = (gltf.nodes ?? []).map((item) => item.name ?? "");
  if (nodeNames.some((name) => /camera|light|text|logo|watermark/i.test(name))) errors.push(`${label}: forbidden scene node`);
  const animationNames = (gltf.animations ?? []).map((item) => item.name);
  if (animationNames.length > 1 || (animationNames.length === 1 && animationNames[0] !== "Idle")) errors.push(`${label}: only Idle animation is allowed`);
  const drawCalls = (gltf.meshes ?? []).reduce((sum, mesh) => sum + (mesh.primitives?.length ?? 0), 0);
  if (drawCalls > 24) errors.push(`${label}: ${drawCalls} draw calls exceeds 24`);
  let triangles = 0;
  for (const mesh of gltf.meshes ?? []) for (const primitive of mesh.primitives ?? []) {
    const accessor = gltf.accessors?.[primitive.indices ?? primitive.attributes?.POSITION];
    triangles += Math.floor((accessor?.count ?? 0) / 3);
  }
  if (triangles > 250000) errors.push(`${label}: ${triangles} triangles exceeds 250000`);
  const khronos = await validateGltfBytes(new Uint8Array(bytes), { uri: label, writeTimestamp: false, maxIssues: 0 });
  if (khronos.issues.numErrors || khronos.issues.numWarnings) errors.push(`${label}: Khronos Validator reported ${khronos.issues.numErrors} errors and ${khronos.issues.numWarnings} warnings`);
}

export async function validateMuseumAssets() {
  const errors = [];
  const exhibitsDir = resolve(root, "content/exhibits");
  const animals = (await readdir(exhibitsDir, { withFileTypes: true })).filter((entry) => entry.isDirectory());
  let assets = 0;
  const seenPaths = new Set();
  for (const animal of animals) {
    const packageDir = resolve(exhibitsDir, animal.name);
    let manifest;
    try { manifest = JSON.parse(await readFile(resolve(packageDir, "asset-manifest.json"), "utf8")); }
    catch { errors.push(`${animal.name}: missing or invalid asset-manifest.json`); continue; }
    const presentationBytes = await readFile(resolve(packageDir, "presentation.json")).catch(() => null);
    if (!presentationBytes || sha256(presentationBytes) !== manifest.presentationSha256) errors.push(`${animal.name}: presentation hash mismatch`);
    if (manifest.assets?.length !== 6) errors.push(`${animal.name}: exactly six runtime assets are required`);
    let packageBytes = 0;
    const model = manifest.assets?.find((asset) => asset.type === "model");
    for (const asset of manifest.assets ?? []) {
      assets += 1;
      if (!asset.path?.startsWith(`public/museum/animals/${animal.name}/`) || seenPaths.has(asset.path)) errors.push(`${animal.name}: invalid or duplicate asset path`);
      seenPaths.add(asset.path);
      const bytes = await readFile(resolve(root, asset.path)).catch(() => null);
      if (!bytes) { errors.push(`${asset.path}: missing runtime file`); continue; }
      packageBytes += bytes.length;
      if (bytes.length !== asset.bytes || sha256(bytes) !== asset.runtimeSha256) errors.push(`${asset.path}: size or SHA-256 mismatch`);
      if (!asset.redistributionApproved || !["CC0-1.0", "CC-BY-SA-4.0"].includes(asset.license)) errors.push(`${asset.path}: redistribution not approved`);
      if (!asset.url?.includes(`?v=${asset.runtimeSha256.slice(0, 12)}`)) errors.push(`${asset.path}: cache version is not hash-bound`);
      if (["poster", "thumbnail"].includes(asset.type) && (asset.modelSha256 !== model?.runtimeSha256 || asset.presentationSha256 !== manifest.presentationSha256)) errors.push(`${asset.path}: preview is stale`);
      if (asset.type === "model") {
        if (!asset.originalSha256 || bytes.length > 20 * 1024 * 1024) errors.push(`${asset.path}: model provenance or budget failure`);
        await inspectGlb(bytes, errors, asset.path);
      }
    }
    if (packageBytes > 23 * 1024 * 1024) errors.push(`${animal.name}: complete package exceeds 23 MiB`);
    for (const evidence of ["model-source.md", "model-license.txt", "processing.md", "background-creation.md"]) {
      const info = await stat(resolve(packageDir, "evidence", evidence)).catch(() => null);
      if (!info?.size) errors.push(`${animal.name}: missing evidence/${evidence}`);
    }
  }
  return { errors, animals: animals.length, assets, gltfValidator: gltfValidatorVersion() };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await validateMuseumAssets();
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length) process.exitCode = 1;
}
