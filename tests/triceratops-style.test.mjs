import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const stylesheetUrl = new URL("../app/exhibits/[slug]/page.module.css", import.meta.url);

test("三角龙展品样式遵守响应式与无障碍契约", async () => {
  const css = await readFile(stylesheetUrl, "utf8");

  assert.match(css, /:focus-visible\s*\{[^}]*outline\s*:\s*(?!none)/is);
  assert.match(css, /(?:a|summary)[^{]*\{[^}]*(?:min-)?height\s*:\s*44px/is);
  assert.match(css, /@media\s*\(max-width\s*:\s*\d+px\)/i);
  assert.match(css, /@media\s*\(prefers-reduced-motion\s*:\s*reduce\)[\s\S]*?transition\s*:\s*none/i);
  assert.match(css, /\[lang=["']en["']\]\s*\{[^}]*(?:color|font-size|font-weight|opacity)\s*:/is);

  assert.doesNotMatch(css, /url\(\s*["']?https?:\/\//i);
  assert.doesNotMatch(css, /animation(?:-[\w-]+)?\s*:[^;{}]*\binfinite\b/i);
  assert.doesNotMatch(css, /(?:html|body)[^{]*\{[^}]*(?:height\s*:\s*100(?:d|s|l)?vh|overflow\s*:\s*hidden)/is);
  assert.doesNotMatch(css, /\[lang=["']en["']\]\s*\{[^}]*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\D|$))/is);
});
