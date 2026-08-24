#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import process from "node:process";

const trustedAssociations = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
const protectedPlanPaths = [
  /^docs\/requirements\/REQ-[^/]+\/design\.md$/,
  /^docs\/requirements\/REQ-[^/]+\/factory\.json$/,
  /^\.factory\/patterns\//,
  /^\.factory\/project\.json$/,
  /^docs\/factory\/CHARTER\.md$/,
];

const fieldLine = /^([a-z_]+):\s*(.+)$/;

export function parseMarker(body, marker) {
  const start = body.indexOf(`<!-- ${marker} -->`);
  if (start < 0) return null;
  const fields = {};
  for (const line of body.slice(start).split("\n").slice(1)) {
    if (line.startsWith("<!-- ") || line.startsWith("```")) break;
    const match = line.trim().match(fieldLine);
    if (!match) {
      if (line.trim()) break;
      continue;
    }
    fields[match[1]] = match[2].trim();
  }
  return fields;
}

function isFullSha(value) {
  return /^[0-9a-f]{40}$/.test(value ?? "");
}

function trusted(item) {
  return trustedAssociations.has(item.authorAssociation);
}

function latestMarker(items, marker, predicate = () => true) {
  return items
    .map((item) => ({ item, fields: parseMarker(item.body ?? "", marker) }))
    .filter(({ fields, item }) => fields && predicate(fields, item))
    .sort((a, b) => new Date(a.item.createdAt) - new Date(b.item.createdAt))
    .at(-1);
}

function requirementId(issueNumber) {
  return `REQ-${String(issueNumber).padStart(3, "0")}`;
}

function reviewDecision(review) {
  if (review.state === "APPROVED") return "approved";
  if (review.state === "CHANGES_REQUESTED") return "changes-requested";
  if (review.state !== "COMMENTED") return null;
  const firstLine = (review.body ?? "").trim().split("\n")[0];
  if (firstLine === "方案通过") return "approved";
  if (firstLine === "需要修改" || firstLine.startsWith("需要修改：")) return "changes-requested";
  return null;
}

function pathMatches(pattern, path) {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === "*" && pattern[index + 1] === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`${source}$`).test(path);
}

export function validateGateContext(context) {
  const errors = [];
  const { pr, issue, issueComments, prComments, reviews, openLinkedPrs, comparisons, spec } = context;

  if (pr.state !== "OPEN") errors.push("pr:not-open");
  if (openLinkedPrs.length !== 1 || openLinkedPrs[0] !== pr.number) errors.push("pr:not-unique-open");

  const handoff = latestMarker(issueComments, "factory-handoff:v2");
  if (!handoff || !trusted(handoff.item)) {
    errors.push("handoff:missing-or-untrusted");
    return { ok: false, errors };
  }

  if (handoff.fields.requirement !== requirementId(issue.number)) errors.push("handoff:requirement-mismatch");
  if (Number(handoff.fields.review_pr) !== pr.number) errors.push("handoff:review-pr-mismatch");

  if (!spec || spec.requirement !== requirementId(issue.number) || spec.issue !== issue.number) {
    errors.push("spec:missing-or-mismatched-manifest");
  } else {
    if (spec.reviewPr !== pr.number) errors.push("spec:review-pr-mismatch");
    for (const path of pr.changedFiles) {
      if (!spec.allowedPaths.some((pattern) => pathMatches(pattern, path))) errors.push(`scope:not-allowed:${path}`);
    }

    if (spec.humanGates.includes("spec-review")) {
      const review = reviews
        .filter((item) => trusted(item) && reviewDecision(item))
        .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
        .at(-1);
      if (!review) {
        errors.push("spec-review:missing");
      } else if (reviewDecision(review) !== "approved") {
        errors.push("spec-review:changes-requested");
      } else if (!isFullSha(review.commitId)) {
        errors.push("spec-review:invalid-sha");
      } else if (!review.url) {
        errors.push("spec-review:missing-source");
      } else {
        const comparison = comparisons[review.commitId];
        if (!comparison || !comparison.ancestorOfHead) {
          errors.push("spec-review:sha-not-in-pr-history");
        } else if (comparison.changedFiles.some((path) => protectedPlanPaths.some((pattern) => pattern.test(path)))) {
          errors.push("spec-review:spec-drift");
        }
      }
    }
  }

  if (pr.labels.includes("factory:plan-review")) errors.push("pr:plan-review-pending");
  if (pr.labels.includes("factory:rejected")) errors.push("verification:rejected-label-present");
  if (!pr.labels.includes("factory:verified")) errors.push("verification:label-missing");

  const verification = latestMarker(prComments, "factory-verification:v2", (_fields, item) => trusted(item));
  if (!verification) {
    errors.push("verification:missing");
  } else {
    if (verification.fields.decision !== "accepted") errors.push("verification:latest-decision-not-accepted");
    if (verification.fields.requirement !== requirementId(issue.number)) errors.push("verification:requirement-mismatch");
    if (!isFullSha(verification.fields.verified_sha)) errors.push("verification:invalid-sha");
    if (verification.fields.verified_sha !== pr.headSha) errors.push("verification:stale-sha");
    if (!verification.item.url) errors.push("verification:missing-source");
  }

  return { ok: errors.length === 0, errors };
}

async function github(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
  return response.json();
}

async function paginate(path, token) {
  const separator = path.includes("?") ? "&" : "?";
  return github(`${path}${separator}per_page=100`, token);
}

function linkedIssueNumber(body) {
  const match = body.match(/(?:close[sd]?|fixe[sd]?|resolve[sd]?)\s+#(\d+)/i);
  return match ? Number(match[1]) : null;
}

async function liveContext(event, token, repository) {
  const prNumber = event.pull_request?.number;
  if (!prNumber) throw new Error("只支持 pull_request 事件；评论后由 Agent 更新标签触发重新检查");
  const [owner, repo] = repository.split("/");
  const apiRoot = `/repos/${owner}/${repo}`;
  const pr = await github(`${apiRoot}/pulls/${prNumber}`, token);
  const issueNumber = linkedIssueNumber(pr.body ?? "");
  if (!issueNumber) throw new Error("PR 正文缺少 Closes #<issue>");

  const [issue, issueComments, prComments, reviews, prFiles, openPulls] = await Promise.all([
    github(`${apiRoot}/issues/${issueNumber}`, token),
    paginate(`${apiRoot}/issues/${issueNumber}/comments`, token),
    paginate(`${apiRoot}/issues/${prNumber}/comments`, token),
    paginate(`${apiRoot}/pulls/${prNumber}/reviews`, token),
    paginate(`${apiRoot}/pulls/${prNumber}/files`, token),
    paginate(`${apiRoot}/pulls?state=open`, token),
  ]);
  const openLinkedPrs = openPulls
    .filter((candidate) => linkedIssueNumber(candidate.body ?? "") === issueNumber)
    .map((candidate) => candidate.number);

  const reviewShas = reviews.map((review) => review.commit_id).filter(isFullSha);
  const comparisons = {};
  for (const sha of new Set(reviewShas)) {
    const comparison = await github(`${apiRoot}/compare/${sha}...${pr.head.sha}`, token);
    comparisons[sha] = {
      ancestorOfHead: ["identical", "ahead"].includes(comparison.status),
      changedFiles: (comparison.files ?? []).map((file) => file.filename),
    };
  }

  const normalizeComment = (comment) => ({
    body: comment.body,
    authorAssociation: comment.author_association,
    createdAt: comment.created_at,
    url: comment.html_url,
  });
  const requirementPrefix = requirementId(issueNumber);
  const requirementDirectories = await readdir("docs/requirements", { withFileTypes: true });
  const requirementDirectory = requirementDirectories.find(
    (entry) => entry.isDirectory() && entry.name.startsWith(`${requirementPrefix}-`),
  );
  const spec = requirementDirectory
    ? JSON.parse(await readFile(`docs/requirements/${requirementDirectory.name}/factory.json`, "utf8"))
    : null;
  return {
    pr: {
      number: pr.number,
      state: pr.state.toUpperCase(),
      headSha: pr.head.sha,
      labels: pr.labels.map((label) => label.name),
      changedFiles: prFiles.map((file) => file.filename),
    },
    issue: { number: issue.number },
    issueComments: issueComments.map(normalizeComment),
    prComments: prComments.map(normalizeComment),
    reviews: reviews.map((review) => ({
      body: review.body,
      state: review.state,
      commitId: review.commit_id,
      authorAssociation: review.author_association,
      submittedAt: review.submitted_at,
      url: review.html_url,
    })),
    openLinkedPrs,
    comparisons,
    spec,
  };
}

async function main() {
  const fixtureIndex = process.argv.indexOf("--fixture");
  const context = fixtureIndex >= 0
    ? JSON.parse(await readFile(process.argv[fixtureIndex + 1], "utf8"))
    : await liveContext(
      JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8")),
      process.env.GITHUB_TOKEN,
      process.env.GITHUB_REPOSITORY,
    );
  const result = validateGateContext(context);
  for (const error of result.errors) console.error(`FACTORY_PR_GATE_ERROR: ${error}`);
  console.log(`FACTORY_PR_GATES: status=${result.ok ? "GREEN" : "RED"} errors=${result.errors.join(",") || "none"}`);
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    console.error(`FACTORY_PR_GATES: status=MISCONFIGURED error=${error.message}`);
    process.exitCode = 2;
  });
}
