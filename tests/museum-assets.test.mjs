import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { fitProjectedBox, projectedBoxFits } from "../lib/viewer/fitCamera.js";

test("正式动物素材通过 fail-closed provenance、哈希和预算校验", async () => {
  const { validateMuseumAssets } = await import("../scripts/assets/validate.mjs");
  const report = await validateMuseumAssets();
  assert.deepEqual(report.errors, []);
  assert.equal(report.animals, 4);
  assert.equal(report.assets, 24);
});

test("三只恐龙运行时模型固定为批准的 Sketchfab CC BY 4.0 来源", async () => {
  const expected = {
    triceratops: ["27fdbc94f05b4e0c844db6fd679b2265", "JZG"],
    stegosaurus: ["9776fff241a54639b184d25a2777f63f", "Billy Jackman"],
    tyrannosaurus: ["6465a297fa784598adc49f6e0042d449", "Marcel Schanz"],
  };
  for (const [animal, [uid, creator]] of Object.entries(expected)) {
    const manifest = JSON.parse(await readFile(new URL(`../content/exhibits/${animal}/asset-manifest.json`, import.meta.url), "utf8"));
    const model = manifest.assets.find(({ type }) => type === "model");
    assert.equal(model.sketchfabUid, uid);
    assert.equal(model.creator, creator);
    assert.equal(model.license, "CC-BY-4.0");
    assert.equal(model.licenseUrl, "https://creativecommons.org/licenses/by/4.0/");
    assert.equal(model.redistributionApproved, true);
    assert.match(model.source, new RegExp(uid));
    assert.doesNotMatch(JSON.stringify(model), /Quaternius/i);
  }
});

test("剑齿虎运行时模型固定为 DUN 原创 CC BY-SA 4.0 来源", async () => {
  const manifest = JSON.parse(await readFile(new URL("../content/exhibits/smilodon/asset-manifest.json", import.meta.url), "utf8"));
  const model = manifest.assets.find(({ type }) => type === "model");
  assert.equal(model.creator, "DUN project");
  assert.equal(model.license, "CC-BY-SA-4.0");
  assert.equal(model.licenseUrl, "https://creativecommons.org/licenses/by-sa/4.0/");
  assert.equal(model.redistributionApproved, true);
  assert.equal(model.sketchfabUid, undefined);
  assert.equal(model.originalSha256, "c8b558967f631818018aa974129f311c0bae53e0c32d971084cd945ec8be1f9f");
});

test("公共查看器只创建一个画布且包含降级与生命周期契约", async () => {
  const source = await readFile(new URL("../lib/viewer/ViewerController.ts", import.meta.url), "utf8");
  assert.match(source, /WebGLRenderer/);
  assert.match(source, /AbortController/);
  assert.match(source, /webglcontextlost/);
  assert.match(source, /visibilitychange/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /dispose\(\)/);
  assert.match(source, /prefers-reduced-motion/);
  assert.doesNotMatch(source, /document\.(?:body|documentElement)\.style\.overflow/);
});

test("公共查看器按最终纵向画布投影完整霸王龙边界", async () => {
  globalThis.ProgressEvent ??= class ProgressEvent {};
  globalThis.self ??= globalThis;
  globalThis.createImageBitmap ??= async () => ({ width: 1, height: 1, close() {} });
  const bytes = await readFile(new URL("../public/museum/animals/tyrannosaurus/model/model.glb", import.meta.url));
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const gltf = await new GLTFLoader().parseAsync(buffer, "");
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = box.getSize(new THREE.Vector3());
  const presentation = JSON.parse(await readFile(new URL("../content/exhibits/tyrannosaurus/presentation.json", import.meta.url), "utf8"));
  const camera = new THREE.PerspectiveCamera(presentation.cameraFov, 360 / 848.34, 0.01, 100);
  const center = box.getCenter(new THREE.Vector3());
  const target = new THREE.Vector3(center.x, box.min.y + size.y * presentation.targetHeightRatio, center.z);
  const [blenderX, blenderY, blenderZ] = presentation.cameraDirection;
  const direction = new THREE.Vector3(blenderX, blenderZ, -blenderY).normalize();
  const vertical = Math.max(size.y * 1.65, size.x / camera.aspect * 0.9);
  const oldDistance = (vertical / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (presentation.cameraDistanceFactor ?? 1.75);
  camera.position.copy(target).addScaledVector(direction, oldDistance);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  assert.equal(projectedBoxFits(camera, box), false, "旧的单轴距离估算应暴露斜向投影裁切");

  const distance = fitProjectedBox(camera, box, target, direction, oldDistance);
  assert.ok(distance > oldDistance);
  assert.equal(projectedBoxFits(camera, box), true);
});

test("预览渲染按最终画幅 fail-closed 保留完整模型轮廓", async () => {
  const source = await readFile(new URL("../scripts/assets/render_previews.py", import.meta.url), "utf8");
  assert.match(source, /world_to_camera_view/);
  assert.match(source, /def enforce_camera_margin/);
  assert.match(source, /margin=0\.08/);
  assert.match(source, /model cannot be framed with margin/);
  assert.match(source, /scene\.render\.resolution_x = width/);
  assert.match(source, /scene\.render\.resolution_y = height/);
});
