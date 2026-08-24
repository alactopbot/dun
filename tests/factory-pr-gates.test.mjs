import assert from "node:assert/strict";
import test from "node:test";

import {
  paginate,
  readyRunForTransition,
  validateGateContext,
} from "../.factory/scripts/validate-pr-gates.mjs";

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

function transition(event = "ready_for_review", overrides = {}) {
  return {
    event,
    commitId: specSha,
    authorAssociation: "OWNER",
    createdAt: "2026-08-24T00:00:00Z",
    url: "https://api.github.com/repos/example/dun/issues/events/1",
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
      isDraft: false,
      headSha,
      labels: ["factory:verified"],
      changedFiles: ["app/exhibits/page.tsx", "docs/requirements/REQ-007-animal/delivery.md"],
    },
    issue: { number: 7 },
    issueComments: [comment(`<!-- factory-handoff:v2 -->\nrequirement: REQ-007\nreview_pr: 8\napproved_plan_sha: ${specSha}`)],
    prComments: [verification()],
    specTransitions: [transition()],
    openLinkedPrs: [8],
    comparisons: { [specSha]: { ancestorOfHead: true, changedFiles: ["app/exhibits/page.tsx"] } },
    spec: {
      requirement: "REQ-007",
      issue: 7,
      mode: "supervised",
      pattern: "animal-exhibit-v1",
      reviewPr: 8,
      humanGates: ["spec-ready", "merge"],
      allowedPaths: ["app/**", "docs/requirements/REQ-007-animal/**"],
      gateLevel: "deep",
    },
  };
}

test("Ready for review 事件绑定 Spec 提交并允许实现继续", () => {
  assert.deepEqual(validateGateContext(validContext()), { ok: true, errors: [] });
});

test("GitHub Ready 事件缺少 commit_id 时使用 Actions 运行记录的不可变 PR 头", () => {
  const context = validContext();
  context.specTransitions[0].commitId = null;
  context.specTransitions[0].runHeadSha = specSha;
  context.specTransitions[0].runUrl = "https://github.com/example/dun/actions/runs/1";
  assert.equal(validateGateContext(context).ok, true);
});

test("可编辑 handoff 不能把 Ready 批准移动到 Spec 漂移后的新头", () => {
  const context = validContext();
  context.specTransitions[0].commitId = null;
  context.specTransitions[0].runHeadSha = specSha;
  context.specTransitions[0].runUrl = "https://github.com/example/dun/actions/runs/1";
  context.issueComments[0] = comment(`<!-- factory-handoff:v2 -->\nrequirement: REQ-007\nreview_pr: 8\napproved_plan_sha: ${headSha}`);
  context.comparisons[specSha].changedFiles = ["docs/requirements/REQ-007-animal/design.md"];
  const result = validateGateContext(context);
  assert.ok(result.errors.includes("handoff:approved-plan-sha-mismatch"));
  assert.ok(result.errors.includes("spec-ready:spec-drift"));
});

test("Draft 状态表示方案尚未通过", () => {
  const context = validContext();
  context.pr.isDraft = true;
  context.specTransitions = [];
  assert.ok(validateGateContext(context).errors.includes("spec-ready:missing"));
});

test("Convert to draft 会撤销更早的方案通过", () => {
  const context = validContext();
  context.pr.isDraft = true;
  context.specTransitions.push(transition("convert_to_draft", { createdAt: "2026-08-24T00:01:00Z" }));
  assert.ok(validateGateContext(context).errors.includes("spec-ready:pr-is-draft"));
});

test("Convert 后再次 Ready 会以最新提交重新通过", () => {
  const context = validContext();
  context.specTransitions.push(
    transition("convert_to_draft", { createdAt: "2026-08-24T00:01:00Z" }),
    transition("ready_for_review", { createdAt: "2026-08-24T00:02:00Z" }),
  );
  assert.equal(validateGateContext(context).ok, true);
});

test("拒绝非可信 Ready 操作者、错误 SHA、缺失来源和 Spec 漂移", () => {
  const untrusted = validContext();
  untrusted.specTransitions[0].authorAssociation = "NONE";
  assert.ok(validateGateContext(untrusted).errors.includes("spec-ready:untrusted-actor"));

  const shortSha = validContext();
  shortSha.specTransitions[0].commitId = "abc123";
  assert.ok(validateGateContext(shortSha).errors.includes("spec-ready:invalid-sha"));

  const noSource = validContext();
  noSource.specTransitions[0].url = "";
  assert.ok(validateGateContext(noSource).errors.includes("spec-ready:missing-source"));

  const drift = validContext();
  drift.comparisons[specSha].changedFiles = ["docs/requirements/REQ-007-animal/design.md"];
  assert.ok(validateGateContext(drift).errors.includes("spec-ready:spec-drift"));
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
  context.specTransitions = [];
  context.pr.isDraft = false;
  assert.equal(validateGateContext(context).ok, true);
});

test("GitHub 分页读取第 101 项及后续页面", async () => {
  const originalFetch = globalThis.fetch;
  const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: index + 1 }));
  globalThis.fetch = async (url) => {
    const page = new URL(url).searchParams.get("page");
    return new Response(JSON.stringify(page === "1" ? firstPage : [{ id: 101 }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const result = await paginate("/repos/example/dun/pulls/8/files", "token");
    assert.equal(result.length, 101);
    assert.equal(result.at(-1).id, 101);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Ready 只绑定事件之后最早的同 PR Factory Gates 运行头", () => {
  const transition = { created_at: "2026-08-24T00:00:00Z" };
  const runs = [
    { name: "Factory Gates", event: "pull_request", created_at: "2026-08-23T23:59:59Z", head_sha: "old", pull_requests: [{ number: 8 }] },
    { name: "Other", event: "pull_request", created_at: "2026-08-24T00:00:01Z", head_sha: "other", pull_requests: [{ number: 8 }] },
    { name: "Factory Gates", event: "pull_request", created_at: "2026-08-24T00:00:02Z", head_sha: specSha, pull_requests: [{ number: 8 }] },
    { name: "Factory Gates", event: "pull_request", created_at: "2026-08-24T00:00:03Z", head_sha: headSha, pull_requests: [{ number: 8 }] },
    { name: "Factory Gates", event: "pull_request", created_at: "2026-08-24T00:00:01Z", head_sha: "wrong-pr", pull_requests: [{ number: 9 }] },
  ];
  assert.equal(readyRunForTransition(transition, runs, 8).head_sha, specSha);
});
