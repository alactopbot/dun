import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("正式动物素材通过 fail-closed provenance、哈希和预算校验", async () => {
  const { validateMuseumAssets } = await import("../scripts/assets/validate.mjs");
  const report = await validateMuseumAssets();
  assert.deepEqual(report.errors, []);
  assert.equal(report.animals, 3);
  assert.equal(report.assets, 18);
});

test("三只运行时模型固定为批准的 Sketchfab CC BY 4.0 来源", async () => {
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

test("预览渲染按最终画幅 fail-closed 保留完整模型轮廓", async () => {
  const source = await readFile(new URL("../scripts/assets/render_previews.py", import.meta.url), "utf8");
  assert.match(source, /world_to_camera_view/);
  assert.match(source, /def enforce_camera_margin/);
  assert.match(source, /margin=0\.08/);
  assert.match(source, /model cannot be framed with margin/);
  assert.match(source, /scene\.render\.resolution_x = width/);
  assert.match(source, /scene\.render\.resolution_y = height/);
});
