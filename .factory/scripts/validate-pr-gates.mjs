#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";

const trustedAssociations = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
const protectedPlanPaths = [
  /^docs\/requirements\/REQ-[^/]+\/design\.md$/,
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

function gateError(gate, reason) {
  return `gate:${gate}:${reason}`;
}

export function validateGateContext(context) {
  const errors = [];
  const { pr, issue, issueComments, prComments, openLinkedPrs, comparisons } = context;

  if (pr.state !== "OPEN") errors.push("pr:not-open");
  if (openLinkedPrs.length !== 1 || openLinkedPrs[0] !== pr.number) errors.push("pr:not-unique-open");

  const handoff = latestMarker(issueComments, "factory-handoff:v2");
  if (!handoff || !trusted(handoff.item)) {
    errors.push("handoff:missing-or-untrusted");
    return { ok: false, errors };
  }

  if (handoff.fields.requirement !== `REQ-${issue.number}`) errors.push("handoff:requirement-mismatch");
  if (Number(handoff.fields.review_pr) !== pr.number) errors.push("handoff:review-pr-mismatch");

  const requiredGates = [];
  if ((handoff.fields.human_gates ?? "").includes("technical-plan")) requiredGates.push("technical-plan");
  if (pr.labels.includes("factory:product-review")) requiredGates.push("product-acceptance");

  for (const gate of requiredGates) {
    const evidence = latestMarker(
      prComments,
      "factory-gate:v2",
      (fields) => fields.gate === gate && fields.decision === "approved",
    );
    if (!evidence) {
      errors.push(gateError(gate, "missing"));
      continue;
    }
    if (!trusted(evidence.item)) errors.push(gateError(gate, "untrusted-author"));
    if (evidence.fields.requirement !== `REQ-${issue.number}`) errors.push(gateError(gate, "requirement-mismatch"));
    if (!isFullSha(evidence.fields.approved_sha)) {
      errors.push(gateError(gate, "invalid-sha"));
      continue;
    }
    if (!evidence.item.url) errors.push(gateError(gate, "missing-source"));
    const comparison = comparisons[evidence.fields.approved_sha];
    if (!comparison || !comparison.ancestorOfHead) {
      errors.push(gateError(gate, "sha-not-in-pr-history"));
      continue;
    }
    if (gate === "technical-plan") {
      if (comparison.changedFiles.some((path) => protectedPlanPaths.some((pattern) => pattern.test(path)))) {
        errors.push(gateError(gate, "plan-drift"));
      }
    } else if (comparison.changedFiles.some((path) => !/^docs\/requirements\/REQ-[^/]+\/delivery\.md$/.test(path))) {
      errors.push(gateError(gate, "candidate-drift"));
    }
  }

  if (pr.labels.includes("factory:plan-review")) errors.push("pr:plan-review-pending");
  if (!pr.labels.includes("factory:verified")) errors.push("verification:label-missing");

  const verification = latestMarker(
    prComments,
    "factory-verification:v2",
    (fields) => fields.decision === "accepted",
  );
  if (!verification) {
    errors.push("verification:missing");
  } else {
    if (!trusted(verification.item)) errors.push("verification:untrusted-author");
    if (verification.fields.requirement !== `REQ-${issue.number}`) errors.push("verification:requirement-mismatch");
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

  const [issue, issueComments, prComments, openPulls] = await Promise.all([
    github(`${apiRoot}/issues/${issueNumber}`, token),
    paginate(`${apiRoot}/issues/${issueNumber}/comments`, token),
    paginate(`${apiRoot}/issues/${prNumber}/comments`, token),
    paginate(`${apiRoot}/pulls?state=open`, token),
  ]);
  const openLinkedPrs = openPulls
    .filter((candidate) => linkedIssueNumber(candidate.body ?? "") === issueNumber)
    .map((candidate) => candidate.number);

  const gateShas = prComments
    .map((comment) => parseMarker(comment.body ?? "", "factory-gate:v2")?.approved_sha)
    .filter(isFullSha);
  const comparisons = {};
  for (const sha of new Set(gateShas)) {
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
  return {
    pr: {
      number: pr.number,
      state: pr.state.toUpperCase(),
      headSha: pr.head.sha,
      labels: pr.labels.map((label) => label.name),
    },
    issue: { number: issue.number },
    issueComments: issueComments.map(normalizeComment),
    prComments: prComments.map(normalizeComment),
    openLinkedPrs,
    comparisons,
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
