import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const hook = join(root, ".factory/hooks/block-merge.sh");

function runHook(cwd, command) {
  return spawnSync("bash", [hook], {
    cwd,
    encoding: "utf8",
    input: JSON.stringify({ tool_input: { command } }),
  });
}

test("Factory hook distinguishes feature sync from product merge", async (t) => {
  const fixture = mkdtempSync(join(tmpdir(), "dun-factory-hook-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  assert.equal(spawnSync("git", ["init", "--quiet", "--initial-branch=main"], { cwd: fixture }).status, 0);
  assert.equal(spawnSync("git", ["config", "user.name", "DUN test"], { cwd: fixture }).status, 0);
  assert.equal(spawnSync("git", ["config", "user.email", "test@example.invalid"], { cwd: fixture }).status, 0);
  writeFileSync(join(fixture, ".keep"), "test\n");
  assert.equal(spawnSync("git", ["add", ".keep"], { cwd: fixture }).status, 0);
  assert.equal(spawnSync("git", ["commit", "--quiet", "-m", "fixture"], { cwd: fixture }).status, 0);
  assert.equal(spawnSync("git", ["branch", "issue/29"], { cwd: fixture }).status, 0);
  chmodSync(hook, 0o755);

  const cases = [
    ["issue/29", "git merge origin/main", 0],
    ["issue/29", "git merge origin/master", 0],
    ["issue/29", "git merge unrelated-feature", 2],
    ["main", "git merge issue/29", 2],
    ["main", "git merge --abort", 0],
    ["issue/29", "gh pr merge 30", 2],
    ["issue/29", "bash -lc 'gh pr merge 30'", 2],
    ["issue/29", "gh api repos/example/dun/pulls/30/merge --method PUT", 2],
    ["issue/29", "git push origin HEAD:main", 2],
    ["issue/29", "git push --force-with-lease origin issue/29", 2],
    ["issue/29", "git push origin HEAD:refs/heads/issue/29", 0],
    ["main", "git push", 2],
    ["issue/29", "gh issue create --body 'mentions git merge origin/main and gh pr merge 30'", 0],
  ];

  for (const [branch, command, expected] of cases) {
    await t.test(`${branch}: ${command}`, () => {
      assert.equal(spawnSync("git", ["checkout", "--quiet", branch], { cwd: fixture }).status, 0);
      const result = runHook(fixture, command);
      assert.equal(result.status, expected, `${result.stdout}\n${result.stderr}`);
    });
  }
});
