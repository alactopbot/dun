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
