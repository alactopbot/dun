import assert from "node:assert/strict";
import test from "node:test";

async function renderExhibit() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/exhibits/triceratops", {
    headers: { accept: "text/html" },
  }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} });
}

test("三角龙展品渲染经过核实的双语内容、来源和原创媒体", async () => {
  const response = await renderExhibit();
  assert.equal(response.status, 200);
  const html = await response.text();
  const body = html.slice(html.indexOf("<body"), html.indexOf('<script type="module"', html.indexOf("<body")));

  for (const text of [
    "“三角龙”的名字意为“三只角的脸”；头上有三只角和一圈大颈盾。",
    "The name means “three-horned face”; it had three facial horns and a large frill.",
    "三角龙吃植物；喙和后排牙齿帮助剪下、切碎植物。",
    "Triceratops ate plants; its beak and back teeth helped cut plant material.",
    "它用四条腿行走，生活在约 6800 万至 6600 万年前的晚白垩世。",
    "It walked on four legs and lived about 68–66 million years ago in the Late Cretaceous.",
    "你看到了哪些形状？", "What shapes can you see?",
    "它的身体哪里最特别？为什么？", "Which part looks most special to you? Why?",
    "如果能问它一个问题，你会问什么？", "If you could ask it one question, what would you ask?",
    "不用立刻告诉孩子答案。先听听孩子怎么说。",
    "You do not need to give the answer yet. Listen to what your child notices first.",
  ]) assert.match(body, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  for (const text of ["Natural History Museum", "American Museum of Natural History",
    "Smithsonian National Museum of Natural History", "Name meaning", "Teeth, Footprints, and Feathers",
    "A Glimpse Back in Time", "introductory anatomy", "2026-08-24", "DUN 项目（使用 OpenAI 图像生成工具创作）",
    "CC BY-SA 4.0", "复原想象", "artist’s reconstruction",
    "离开屏幕后，找一找身边的圆形、尖角和扇形。"])
    assert.match(body, new RegExp(text));

  const image = body.match(/<img\b[^>]*>/i)?.[0] ?? "";
  assert.match(image, /src="\/media\/triceratops\/exhibit\.webp"/i);
  assert.match(image, /width="1536"/i);
  assert.match(image, /height="1024"/i);
  assert.match(image, /alt="[^"]+"/i);
  assert.equal([...body.matchAll(/data-fact-id=/g)].length, 3);
  for (const [factId, sourceIds] of [["three-horned-face", ["nhm-triceratops"]],
    ["plant-eater", ["nhm-triceratops", "amnh-dinosaur-facts"]],
    ["four-legs-late-cretaceous", ["nhm-triceratops", "smithsonian-last-american-dinosaurs"]]]) {
    const fact = body.match(new RegExp(`<details[^>]*data-fact-id="${factId}"[\\s\\S]*?<\\/details>`))?.[0] ?? "";
    for (const sourceId of sourceIds) assert.match(fact, new RegExp(`data-source-id="${sourceId}"`));
  }
  assert.doesNotMatch(body, /data-fact-placeholder/i);
  assert.ok([...body.matchAll(/data-source-link=/g)].length >= 3);
  for (const link of body.matchAll(/<a\b[^>]*data-source-link[^>]*>/gi)) {
    assert.match(link[0], /target="_blank"/i);
    assert.match(link[0], /rel="noreferrer"/i);
  }
  for (const link of body.matchAll(/<a\b[^>]*data-source-id[^>]*>/gi)) assert.match(link[0], /lang="en"/i);
  for (const value of ["Triceratops", "Natural History Museum", "Dinosaur Facts", "introductory anatomy"])
    assert.match(body, new RegExp(`lang="en"[^>]*>[^<]*${value}`));
  assert.doesNotMatch(body, /审核中|under review/i);
});
