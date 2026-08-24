import assert from "node:assert/strict";
import test from "node:test";

import { validateGateContext } from "../.factory/scripts/validate-pr-gates.mjs";

const specSha = "1".repeat(40);
const headSha = "2".repeat(40);

function comment(body, overrides = {}) {
  return {
    body,
    authorAssociation: "OWNER",
    createdAt: "2026-08-24T00:00:00Z",
    url: "https://github.com/example/dun/pull/8#issuecomment-1",
    ...overrides,
  };
}

function review(state = "APPROVED", overrides = {}) {
  return {
    body: "",
    state,
    commitId: specSha,
    authorAssociation: "OWNER",
    submittedAt: "2026-08-24T00:00:00Z",
    url: "https://github.com/example/dun/pull/8#pullrequestreview-1",
    ...overrides,
  };
}

function verification(sha = headSha, decision = "accepted") {
  return comment(`<!-- factory-verification:v2 -->\nrequirement: REQ-007\ndecision: ${decision}\nverified_sha: ${sha}`);
}

function validContext() {
  return {
    pr: {
      number: 8,
      state: "OPEN",
      headSha,
      labels: ["factory:verified"],
      changedFiles: ["app/exhibits/page.tsx", "docs/requirements/REQ-007-animal/delivery.md"],
    },
    issue: { number: 7 },
    issueComments: [comment("<!-- factory-handoff:v2 -->\nrequirement: REQ-007\nreview_pr: 8")],
    prComments: [verification()],
    reviews: [review()],
    openLinkedPrs: [8],
    comparisons: { [specSha]: { ancestorOfHead: true, changedFiles: ["app/exhibits/page.tsx"] } },
    spec: {
      requirement: "REQ-007",
      issue: 7,
      mode: "supervised",
      pattern: "animal-exhibit-v1",
      reviewPr: 8,
      humanGates: ["spec-review", "merge"],
      allowedPaths: ["app/**", "docs/requirements/REQ-007-animal/**"],
      gateLevel: "deep",
    },
  };
}

test("标准 Approve Review 绑定 Spec 提交并允许实现继续", () => {
  assert.deepEqual(validateGateContext(validContext()), { ok: true, errors: [] });
});

test("同账号可以用带提交绑定的 Comment Review 表达方案通过", () => {
  const context = validContext();
  context.reviews = [review("COMMENTED", { body: "方案通过\n\n设计与范围没有问题。" })];
  assert.equal(validateGateContext(context).ok, true);
});

test("Request changes 或更晚的需要修改会阻止进入实现", () => {
  const nativeRejection = validContext();
  nativeRejection.reviews.push(review("CHANGES_REQUESTED", { submittedAt: "2026-08-24T00:01:00Z" }));
  assert.ok(validateGateContext(nativeRejection).errors.includes("spec-review:changes-requested"));

  const commentRejection = validContext();
  commentRejection.reviews.push(review("COMMENTED", {
    body: "需要修改：补充回退方案",
    submittedAt: "2026-08-24T00:01:00Z",
  }));
  assert.ok(validateGateContext(commentRejection).errors.includes("spec-review:changes-requested"));
});

test("拒绝非可信 Review、错误 SHA、缺失来源和 Spec 漂移", () => {
  const untrusted = validContext();
  untrusted.reviews[0].authorAssociation = "NONE";
  assert.ok(validateGateContext(untrusted).errors.includes("spec-review:missing"));

  const shortSha = validContext();
  shortSha.reviews[0].commitId = "abc123";
  assert.ok(validateGateContext(shortSha).errors.includes("spec-review:invalid-sha"));

  const noSource = validContext();
  noSource.reviews[0].url = "";
  assert.ok(validateGateContext(noSource).errors.includes("spec-review:missing-source"));

  const drift = validContext();
  drift.comparisons[specSha].changedFiles = ["docs/requirements/REQ-007-animal/design.md"];
  assert.ok(validateGateContext(drift).errors.includes("spec-review:spec-drift"));
});

test("机读 Spec 清单约束唯一 PR 与全部变更路径", () => {
  const secondPr = validContext();
  secondPr.openLinkedPrs.push(9);
  assert.ok(validateGateContext(secondPr).errors.includes("pr:not-unique-open"));

  const wrongPr = validContext();
  wrongPr.spec.reviewPr = 9;
  assert.ok(validateGateContext(wrongPr).errors.includes("spec:review-pr-mismatch"));

  const outOfScope = validContext();
  outOfScope.pr.changedFiles.push("package.json");
  assert.ok(validateGateContext(outOfScope).errors.includes("scope:not-allowed:package.json"));

  const merged = validContext();
  merged.pr.state = "MERGED";
  assert.ok(validateGateContext(merged).errors.includes("pr:not-open"));
});

test("拒绝待方案标签、陈旧或更晚拒绝的独立验证", () => {
  const pendingPlan = validContext();
  pendingPlan.pr.labels.push("factory:plan-review");
  assert.ok(validateGateContext(pendingPlan).errors.includes("pr:plan-review-pending"));

  const stale = validContext();
  stale.prComments[0] = verification(specSha);
  assert.ok(validateGateContext(stale).errors.includes("verification:stale-sha"));

  const laterRejected = validContext();
  laterRejected.prComments.push(comment(
    `<!-- factory-verification:v2 -->\nrequirement: REQ-007\ndecision: rejected\nverified_sha: ${headSha}`,
    { createdAt: "2026-08-24T00:01:00Z" },
  ));
  assert.ok(validateGateContext(laterRejected).errors.includes("verification:latest-decision-not-accepted"));

  const conflictingLabels = validContext();
  conflictingLabels.pr.labels.push("factory:rejected");
  assert.ok(validateGateContext(conflictingLabels).errors.includes("verification:rejected-label-present"));
});

test("Trusted Pattern 可以自动通过 Spec，但仍需要独立验证与人工合并", () => {
  const context = validContext();
  context.spec.mode = "trusted";
  context.spec.humanGates = ["merge"];
  context.reviews = [];
  assert.equal(validateGateContext(context).ok, true);
});
