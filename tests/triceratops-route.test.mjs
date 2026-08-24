import assert from "node:assert/strict";
import test from "node:test";

async function request(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, {
    headers: { accept: "text/html" },
  }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

function count(html, pattern) {
  return [...html.matchAll(pattern)].length;
}

function renderedBody(html) {
  const bodyStart = html.indexOf("<body");
  const hydrationStart = html.indexOf('<script type="module"', bodyStart);
  return html.slice(bodyStart, hydrationStart === -1 ? undefined : hydrationStart);
}

test("入口链接到服务端渲染的三角龙占位展品", async () => {
  const entranceResponse = await request("/");
  assert.equal(entranceResponse.status, 200);
  const entrance = await entranceResponse.text();
  assert.match(entrance, /<a\b[^>]*href="\/exhibits\/triceratops"[^>]*>/i);

  const exhibitResponse = await request("/exhibits/triceratops");
  assert.equal(exhibitResponse.status, 200);
  assert.match(exhibitResponse.headers.get("content-type") ?? "", /^text\/html\b/i);
  const exhibit = await exhibitResponse.text();
  const body = renderedBody(exhibit);

  assert.match(exhibit, /<title>三角龙展品 · DUN<\/title>/i);
  assert.match(body, /<h1\b[^>]*>[^<]*三角龙/i);
  assert.match(body, /<a\b[^>]*href="\/"[^>]*>[^<]*返回博物馆/i);
  assert.equal(count(body, /<figure\b[^>]*data-exhibit-figure(?:="")?[^>]*>/gi), 1);
  assert.equal(count(body, /data-observation-prompt(?:="")?/gi), 3);
  assert.equal(count(body, /<details\b[^>]*data-fact-placeholder(?:="")?[^>]*>/gi), 3);
  assert.equal(count(body, /<details\b[^>]*data-source-credit(?:="")?[^>]*>/gi), 1);
  assert.equal(count(body, /data-closing-section(?:="")?/gi), 1);
  assert.doesNotMatch(body, /<details\b[^>]*\bopen(?:\s|=|>)/i);
  assert.doesNotMatch(
    body,
    /<(?:audio|video|form)\b|\bautoplay\b|登录|注册|账号|积分|奖励|analytics|tracking|telemetry/i,
  );
});
