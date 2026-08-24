import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Factory V2 使用需求与成熟 Pattern 驱动渐进自治", async () => {
  const project = JSON.parse(await read(".factory/project.json"));
  assert.deepEqual(project.language, {
    workflow: "zh-CN",
    productPrimary: "zh-CN",
    productSecondary: "en",
    code: "en",
  });
  assert.equal(project.humanPolicy.merge, "always");
  assert.equal(project.humanPolicy.gateChannel, "github-pr");
  const schema = JSON.parse(await read(".factory/project.schema.json"));
  assert.equal(schema.properties.humanPolicy.properties.gateChannel.const, "github-pr");
  assert.deepEqual(project.maturity.levels, ["bootstrap", "supervised", "trusted", "autonomous"]);
  assert.equal(project.maturity.autonomousEnabled, false);
  assert.equal(project.automation.autoMerge, false);
  assert.equal(project.automation.autoDeploy, false);
  assert.equal("lineBudget" in project, false);

  const pattern = JSON.parse(await read(".factory/patterns/animal-exhibit-v1.json"));
  assert.equal(pattern.id, "animal-exhibit-v1");
  assert.equal(pattern.version, 1);
  assert.equal(pattern.maturity, "supervised");
  assert.equal(pattern.promotion.consecutiveCleanRuns, 3);
  assert.deepEqual(pattern.humanGates.supervised, ["technical-plan", "product-acceptance"]);
  assert.deepEqual(pattern.humanGates.trusted, []);
  assert.deepEqual(pattern.humanGates.autonomous, []);
  assert.equal(pattern.autonomousEligibility.enabled, false);
  assert.ok(pattern.allowedChanges.includes("educational-content"));
  assert.ok(pattern.preserved.includes("child-safety"));
  assert.ok(pattern.demoteOn.includes("verifier-rejected"));

  const contract = await read("docs/factory/CONTRACT.md");
  assert.match(contract, /一个完整需求[^\n]*一个 Issue[^\n]*一个分支[^\n]*一个 Draft PR/);
  assert.match(contract, /factory-handoff:v2/);
  assert.match(contract, /内部 work units/);
  assert.match(contract, /factory-delivery:v2/);
  assert.match(contract, /factory-gate:v2/);
  assert.match(contract, /GitHub Draft PR/);
  assert.doesNotMatch(contract, /QUEUE\.md|STATE\.md|docs\/factory\/runs|行数上限|line limit/i);

  for (const path of [
    ".claude/skills/factory-triage/SKILL.md",
    ".claude/skills/factory-spec/SKILL.md",
    ".claude/skills/factory-implement/SKILL.md",
    ".claude/skills/factory-verify/SKILL.md",
    ".claude/agents/factory-verifier.md",
  ]) {
    const skill = await read(path);
    assert.match(skill, /factory-handoff:v2|factory-delivery:v2/);
    assert.doesNotMatch(skill, /QUEUE\.md|STATE\.md|docs\/factory\/runs|line limit/i);
  }

  const spec = await read(".claude/skills/factory-spec/SKILL.md");
  assert.match(spec, /内部 work units/);
  assert.match(spec, /factory-gate:v2/);
  assert.match(spec, /创建[^\n]*唯一 Draft PR/);
  assert.ok(spec.indexOf("创建该需求唯一 Draft PR") < spec.indexOf("批准技术方案"));
  assert.doesNotMatch(spec, /one GitHub issue per slice|每个切片[^\n]*Issue/i);

  const implement = await read(".claude/skills/factory-implement/SKILL.md");
  assert.match(implement, /候选交付/);
  assert.match(implement, /verifier[\s\S]{0,80}pending/);
  assert.ok(implement.indexOf("创建唯一中文 Draft PR") < implement.indexOf("启动全新上下文的验证器"));
  assert.match(implement, /只更新同一 `delivery\.md`/);
  assert.match(implement, /复用已有 Draft PR/);

  const monitor = await read(".claude/skills/factory-monitor/SKILL.md");
  assert.match(monitor, /factory-gate:v2/);

  assert.doesNotMatch(
    [contract, spec, implement].join("\n"),
    /当前会话[^\n]{0,40}(?:批准|确认)|(?:批准|确认)[^\n]{0,40}当前会话/,
  );

  const bootstrap = await read(".factory/scripts/bootstrap-github.sh");
  assert.match(bootstrap, /factory:plan-review/);

  const workflow = await read(".github/workflows/factory-gates.yml");
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /gates\.sh deep/);
  assert.doesNotMatch(workflow, /merge|deploy/i);

  for (const path of [
    "docs/factory/archive/v1/QUEUE.md",
    "docs/factory/archive/v1/STATE.md",
    "docs/factory/archive/v1/runs/README.md",
    "docs/requirements/REQ-001-triceratops/design/03-design.md",
  ]) assert.ok((await read(path)).trim().length > 0);
});
