import assert from "node:assert/strict";
import test from "node:test";

async function request(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("入口和公共参数化路由服务端渲染三只动物", async () => {
  const entrance = await (await request("/")).text();
  assert.match(entrance, /href="\/exhibits\/triceratops"/i);
  assert.match(entrance, /href="\/exhibits\/stegosaurus"/i);
  assert.match(entrance, /href="\/exhibits\/tyrannosaurus"/i);

  for (const [slug, zh, en] of [["triceratops", "三角龙", "Triceratops"], ["stegosaurus", "剑龙", "Stegosaurus"], ["tyrannosaurus", "霸王龙", "Tyrannosaurus rex"]]) {
    const response = await request(`/exhibits/${slug}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`<h1[^>]*>[^<]*${zh}`, "i"));
    assert.match(html, new RegExp(en));
    assert.match(html, /data-animal-stage/);
    assert.match(html, /<picture/);
    assert.match(html, /data-model-controls/);
    assert.match(html, /左转/);
    assert.match(html, /右转/);
    assert.match(html, /放大/);
    assert.match(html, /缩小/);
    assert.match(html, /恢复初始视角/);
    assert.match(html, /aria-current="page"/);
    assert.match(html, /Sketchfab/);
    assert.match(html, /CC BY 4\.0/);
    assert.doesNotMatch(html, /Quaternius/);
  }

  assert.equal((await request("/exhibits/not-an-animal")).status, 404);
});

test("霸王龙页面保留经批准的双语事实和观察提示", async () => {
  const html = await (await request("/exhibits/tyrannosaurus")).text();
  for (const text of [
    "先看看它的大头、短前肢和长尾巴，再慢慢打开事实卡片。",
    "Look at its large head, short forelimbs, and long tail before opening the fact cards.",
    "“Tyrannosaurus rex”的名字意为“暴君蜥蜴之王”",
    "霸王龙生活在约 6800 万至 6600 万年前的晚白垩世，化石发现于北美。",
    "它有尖锐、略向后弯曲并带锯齿的牙齿",
    "离开屏幕后，找一找一边大、一边长，却仍显得平衡的形状。",
  ]) assert.match(html, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("剑龙页面保留经批准的双语事实和观察提示", async () => {
  const html = await (await request("/exhibits/stegosaurus")).text();
  for (const text of [
    "先看看它背上的板和尾巴，再慢慢打开事实卡片。",
    "Look at the plates along its back and its tail before opening the fact cards.",
    "“剑龙”的名字意为“屋顶蜥蜴”；它是一种吃植物的装甲类恐龙。",
    "它生活在约 1.52 亿至 1.45 亿年前的晚侏罗世，用四条腿行走。",
    "科学家仍不确定这些骨板的用途",
    "离开屏幕后，找一找从小到大排列的形状。",
  ]) assert.match(html, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
