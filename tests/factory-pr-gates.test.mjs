import assert from "node:assert/strict";
import test from "node:test";

import { validateGateContext } from "../.factory/scripts/validate-pr-gates.mjs";

const planSha = "1".repeat(40);
const headSha = "2".repeat(40);

function comment(body, overrides = {}) {
  return {
    body,
    authorAssociation: "OWNER",
    createdAt: "2026-08-24T00:00:00Z",
    url: "https://github.com/example/dun/pull/7#issuecomment-1",
    ...overrides,
  };
}

function gate(gateName, sha = planSha) {
  return comment(`<!-- factory-gate:v2 -->\nrequirement: REQ-7\ngate: ${gateName}\ndecision: approved\napproved_sha: ${sha}`);
}

function verification(sha = headSha) {
  return comment(`<!-- factory-verification:v2 -->\nrequirement: REQ-7\ndecision: accepted\nverified_sha: ${sha}`);
}

function validContext() {
  return {
    pr: { number: 8, state: "OPEN", headSha, labels: ["factory:verified"] },
    issue: { number: 7 },
    issueComments: [comment("<!-- factory-handoff:v2 -->\nrequirement: REQ-7\nhuman_gates: technical-plan=approved, product-acceptance=pending\nreview_pr: 8")],
    prComments: [gate("technical-plan"), verification()],
    openLinkedPrs: [8],
    comparisons: { [planSha]: { ancestorOfHead: true, changedFiles: ["app/exhibits/page.tsx"] } },
  };
}

test("可信、绑定 SHA 且未漂移的 Gate 可以通过", () => {
  assert.deepEqual(validateGateContext(validContext()), { ok: true, errors: [] });
});

test("拒绝非可信作者、短 SHA、聊天批准和错误来源", () => {
  const untrusted = validContext();
  untrusted.prComments[0].authorAssociation = "NONE";
  assert.ok(validateGateContext(untrusted).errors.includes("gate:technical-plan:untrusted-author"));

  const shortSha = validContext();
  shortSha.prComments[0] = gate("technical-plan", "abc123");
  assert.ok(validateGateContext(shortSha).errors.includes("gate:technical-plan:invalid-sha"));

  const chatOnly = validContext();
  chatOnly.prComments[0] = comment("我已经在 Agent 会话里批准技术方案");
  assert.ok(validateGateContext(chatOnly).errors.includes("gate:technical-plan:missing"));

  const noSource = validContext();
  noSource.prComments[0].url = "";
  assert.ok(validateGateContext(noSource).errors.includes("gate:technical-plan:missing-source"));
});

test("拒绝错误历史、方案漂移和产品候选漂移", () => {
  const wrongHistory = validContext();
  wrongHistory.comparisons[planSha].ancestorOfHead = false;
  assert.ok(validateGateContext(wrongHistory).errors.includes("gate:technical-plan:sha-not-in-pr-history"));

  const planDrift = validContext();
  planDrift.comparisons[planSha].changedFiles = ["docs/requirements/REQ-7-animal/design.md"];
  assert.ok(validateGateContext(planDrift).errors.includes("gate:technical-plan:plan-drift"));

  const productDrift = validContext();
  productDrift.pr.labels.push("factory:product-review");
  productDrift.prComments.splice(1, 0, gate("product-acceptance"));
  productDrift.comparisons[planSha].changedFiles = ["app/page.tsx"];
  assert.ok(validateGateContext(productDrift).errors.includes("gate:product-acceptance:candidate-drift"));
});

test("拒绝第二个开放 PR、已合并 PR、待方案标签和陈旧验证", () => {
  const secondPr = validContext();
  secondPr.openLinkedPrs.push(9);
  assert.ok(validateGateContext(secondPr).errors.includes("pr:not-unique-open"));

  const merged = validContext();
  merged.pr.state = "MERGED";
  assert.ok(validateGateContext(merged).errors.includes("pr:not-open"));

  const pendingPlan = validContext();
  pendingPlan.pr.labels.push("factory:plan-review");
  assert.ok(validateGateContext(pendingPlan).errors.includes("pr:plan-review-pending"));

  const staleVerification = validContext();
  staleVerification.prComments[1] = verification(planSha);
  assert.ok(validateGateContext(staleVerification).errors.includes("verification:stale-sha"));
});

test("产品验收后只允许最终交付证据变化", () => {
  const finalEvidence = validContext();
  finalEvidence.pr.labels.push("factory:product-review");
  finalEvidence.prComments.splice(1, 0, gate("product-acceptance"));
  finalEvidence.comparisons[planSha].changedFiles = ["docs/requirements/REQ-7-animal/delivery.md"];
  assert.equal(validateGateContext(finalEvidence).ok, true);
});
