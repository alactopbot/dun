import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const stateScript = join(root, ".factory/scripts/set-issue-state.sh");

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function fakeGhRun(t, args, options = {}) {
  const fixture = mkdtempSync(join(tmpdir(), "dun-factory-state-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));

  const calls = join(fixture, "calls.log");
  const fakeGh = join(fixture, "gh");
  writeFileSync(
    fakeGh,
    `#!/usr/bin/env bash
set -u
printf '%s\n' "$*" >> "$GH_CALL_LOG"
if [ "\${1:-}" = auth ] && [ "\${2:-}" = status ]; then
  exit "\${FAKE_AUTH_STATUS:-0}"
fi
if [ "\${1:-}" = issue ] && [ "\${2:-}" = view ]; then
  [ "\${FAKE_VIEW_STATUS:-0}" -eq 0 ] || exit "$FAKE_VIEW_STATUS"
  printf '%s\n' "\${FAKE_LABELS:-}"
  exit 0
fi
if [ "\${1:-}" = api ]; then
  exit "\${FAKE_API_STATUS:-0}"
fi
exit 97
`,
  );
  chmodSync(fakeGh, 0o755);

  const result = spawnSync(stateScript, args, {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${fixture}:${process.env.PATH}`,
      GH_CALL_LOG: calls,
      FAKE_LABELS: options.labels ?? "",
      FAKE_AUTH_STATUS: String(options.authStatus ?? 0),
      FAKE_VIEW_STATUS: String(options.viewStatus ?? 0),
      FAKE_API_STATUS: String(options.apiStatus ?? 0),
    },
  });

  let recorded = [];
  try {
    recorded = readFileSync(calls, "utf8").trim().split("\n").filter(Boolean);
  } catch {
    // Invalid input can fail before gh is invoked.
  }
  return { ...result, calls: recorded };
}

test("Deep Gate is deterministic and keeps audit explicit", () => {
  const config = read(".factory/gates.conf");
  const gates = read(".factory/scripts/gates.sh");
  const packageJson = JSON.parse(read("package.json"));

  assert.match(config, /REQUIRED_DEEP="types lint test"/);
  assert.doesNotMatch(config, /REQUIRED_DEEP=.*audit/);
  assert.doesNotMatch(gates, /\brun audit\b/);
  assert.doesNotMatch(gates, /REQUIRED_DEEP=.*audit/);
  assert.match(packageJson.scripts.audit, /npm audit/);
});

test("state script is valid shell and wired into Factory authorities", () => {
  assert.equal(spawnSync("bash", ["-n", stateScript]).status, 0);
  assert.match(read(".factory/scripts/doctor.sh"), /set-issue-state\.sh/);
  assert.match(read("docs/factory/CONTRACT.md"), /set-issue-state\.sh/);

  for (const skill of ["factory-triage", "factory-spec", "factory-implement", "factory-monitor"]) {
    const source = read(`.agents/skills/${skill}/SKILL.md`);
    assert.match(source, /set-issue-state\.sh/, `${skill} must use the state script`);
    assert.doesNotMatch(source, /gh issue edit/, `${skill} must not edit state labels directly`);
  }
});

test("state update preserves ordinary labels and replaces all old states in one PATCH", (t) => {
  const result = fakeGhRun(t, ["42", "in-progress"], {
    labels: [
      "priority:high",
      "factory:pattern:example",
      "factory:needs-info",
      "factory:wait-to-implement",
    ].join("\n"),
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /status=UPDATED/);
  const apiCalls = result.calls.filter((call) => call.startsWith("api "));
  assert.equal(apiCalls.length, 1);
  assert.match(apiCalls[0], /--method PATCH/);
  assert.match(apiCalls[0], /labels\[\]=priority:high/);
  assert.match(apiCalls[0], /labels\[\]=factory:pattern:example/);
  assert.match(apiCalls[0], /labels\[\]=factory:in-progress/);
  assert.doesNotMatch(apiCalls[0], /labels\[\]=factory:needs-info/);
  assert.doesNotMatch(apiCalls[0], /labels\[\]=factory:wait-to-implement/);
});

test("setting the sole current state is idempotent and performs no PATCH", (t) => {
  const result = fakeGhRun(t, ["42", "factory:in-progress"], {
    labels: "priority:high\nfactory:in-progress",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /status=UNCHANGED/);
  assert.equal(result.calls.filter((call) => call.startsWith("api ")).length, 0);
});

test("state script fails closed for invalid input and GitHub failures", async (t) => {
  await t.test("invalid state", (t) => {
    const result = fakeGhRun(t, ["42", "unknown"]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /reason=invalid-state/);
    assert.equal(result.calls.length, 0);
  });

  await t.test("authentication failure", (t) => {
    const result = fakeGhRun(t, ["42", "needs-info"], { authStatus: 1 });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /reason=gh-not-authenticated/);
  });

  await t.test("Issue read failure", (t) => {
    const result = fakeGhRun(t, ["42", "needs-info"], { viewStatus: 1 });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /reason=issue-read-failed/);
    assert.equal(result.calls.filter((call) => call.startsWith("api ")).length, 0);
  });

  await t.test("Issue update failure", (t) => {
    const result = fakeGhRun(t, ["42", "needs-info"], {
      labels: "priority:high\nfactory:in-progress",
      apiStatus: 1,
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /reason=issue-update-failed/);
    assert.equal(result.calls.filter((call) => call.startsWith("api ")).length, 1);
  });
});
