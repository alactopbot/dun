# REQ-031：让 Factory Gate 与 Issue 状态更新保持确定性

状态：Draft，等待方案审核
对应 Issue：[#31 让 Factory Gate 与 Issue 状态更新保持确定性](https://github.com/alactopbot/dun/issues/31)
执行路径：普通需求（Pattern：none）
Gate：实现阶段 `deep`；本次仅 Spec 的 PR 使用 `fast`

## 1. 目标与完成结果

让 Issue Agent Factory 的交付判定只依赖仓库内可确定复现的检查，并让所有 Issue Factory 状态更新通过
同一原子操作完成。完成后：

- `deep` Gate 不调用 npm、Python、Rust 或 Go 的外部漏洞服务；外部服务不可达或不实现 audit API 不再
  阻塞与依赖安全无关的需求；
- 仓库保留 `npm run audit` 作为维护者按需显式运行的安全检查，但它不参与 Factory 的机器 verdict；
- Agent 只能通过统一脚本更新 Issue Factory 状态；脚本保留普通标签、移除全部旧 Factory 状态，并在
  一次 GitHub PATCH 中写入唯一目标状态；
- 重复设置相同状态是无操作，非法输入、鉴权失败、读取失败或更新失败都明确 fail closed；
- Contract、相关 skills 和 doctor 检查与实际脚本一致；
- 治理行为有确定性回归测试，规定 Gate 为 GREEN，并通过当前 SHA 的独立验证。

## 2. 背景与范围决定

Issue #27 已证明当前 `deep` Gate 会在 types、lint、测试和 build 全部通过时，仅因内部 npm registry 不
支持 `npm audit` bulk advisories API 而连续报 RED。漏洞服务的网络可达性和接口实现不由本仓库控制，
因此不适合作为确定性 Factory verdict 的组成部分。

当前 skills 还让不同 Agent 自行组合 Issue 标签的增删命令。这会产生短暂的零状态或多状态窗口，并有
误删 Pattern 等普通标签的风险。GitHub Issues API 支持一次提交完整标签集合，因此统一脚本可以在保留
非状态标签的同时原子替换状态。

这两个修正共同服务于一个可验收结果：Factory 在外部服务和并发状态更新面前保持可恢复、确定且
fail-closed。本需求不创建 Pattern；Pattern 不能授权治理文件修改。

## 3. 非目标

- 不删除 `package.json` 中的显式 `audit` 命令，不声称依赖没有漏洞。
- 不把外部漏洞服务失败伪装成安全检查通过；Factory verdict 只是不再包含该检查。
- 不改变 fast/full 的产品检查语义，不降低 types、lint、test 或已有 build 失败的阻塞效果。
- 不自动修复依赖、不修改 lockfile、不新增依赖或 GitHub Actions。
- 不改变 claim 分支、Draft/Ready、独立验证、最终人工合并或 Pattern 授权模型。
- 不修改产品代码、展品、素材、事实、许可、归属或发布行为。
- 不在本需求中合并或发布治理变更。

## 4. 维护者可见行为

### 4.1 确定性 Gate

- `.factory/gates.conf` 的可用 Gate 名称和 `REQUIRED_DEEP` 不再包含 `audit`。
- `.factory/scripts/gates.sh deep` 不探测或调用任何生态的 audit 工具。
- Deep 仍运行 fast/full 层的 types、lint、test 和仓库已有 build，并继续处理 mutation 与 architecture；
  任一实际运行的 Gate 失败仍使 verdict 为 RED，必需 Gate 缺失仍为 MISCONFIGURED。
- `package.json` 的 `npm run audit` 保持可单独调用，其结果不应被引用为 Factory GREEN 的组成部分。

### 4.2 原子状态脚本

新增 `.factory/scripts/set-issue-state.sh <issue-number> <state>`，其中 `state` 可带或不带 `factory:` 前缀，
但最终必须属于章程列出的六种 Issue 状态。

脚本必须：

1. 在任何 GitHub 写操作前验证 Issue 编号、目标状态、`gh` 可用性和鉴权；
2. 读取当前全部标签，将 Factory 状态与普通标签分组；
3. 若已经恰好只有目标状态，输出 `UNCHANGED` 并且不调用更新 API；
4. 否则用一次 Issues API PATCH 写入“全部原普通标签 + 唯一目标状态”；
5. 对非法输入或环境缺失返回 2，对 GitHub 读取/更新错误返回非零，对成功更新返回 0；
6. 输出稳定的 `FACTORY_STATE:` 机器可读摘要，不打印令牌或其他敏感信息。

若历史异常导致多个旧 Factory 状态，脚本应一次移除它们并写入唯一目标状态。Pattern 标签及其他普通
标签必须保留。

### 4.3 工作流接线

- `factory-triage`、`factory-spec`、`factory-implement` 和 `factory-monitor` 在允许状态更新的节点统一调用
  状态脚本，禁止自行组合标签增删命令。
- implementation 在完成授权和缺失决定检查后才进入 `in-progress`，避免已知 blocker 产生瞬态状态。
- `docs/factory/CONTRACT.md` 记录原子状态规则、幂等行为和脚本用法。
- `.factory/scripts/doctor.sh` 把状态脚本列为必需文件。
- Contract 中保留“修改 Pattern 前先读 Pattern 构建指南”的明确入口，不改变 Pattern 权限。

## 5. 技术方案与影响范围

- `.factory/gates.conf`：从可用名称和 Deep 必需集合移除 audit，并说明外部安全审计按需运行。
- `.factory/scripts/gates.sh`：删除各语言 audit 探测和执行路径，同步帮助文本及默认 Deep 集合。
- `.factory/scripts/set-issue-state.sh`：实现校验、标签分类、幂等判断、单次 PATCH 和稳定结果输出。
- `.factory/scripts/doctor.sh`：检查新脚本存在且满足现有脚本健康要求。
- `.agents/skills/factory-{triage,spec,implement,monitor}/SKILL.md`：在各自已授权的状态转换点调用统一脚本。
- `docs/factory/CONTRACT.md`：把原子状态更新写入正式契约，并补足 Pattern 指南入口。
- `tests/**`：增加不访问真实 GitHub 或外部漏洞服务的脚本回归测试。

上述 `.factory/**`、`.agents/**`、Factory contract 和 tests 均为承重路径，实现必须使用 Deep Gate。不得
修改 `docs/factory/CHARTER.md`、Pattern 配置、产品代码、依赖或 lockfile。

## 6. 必须保持的不变量

- GitHub Issue、确定性分支、唯一 PR、Draft/Ready 和可信评论仍是实时状态来源。
- 一个 Issue 在稳定状态下恰好有一个 Factory 状态标签，所有普通标签完整保留。
- 状态脚本不能扩大 Pattern、Spec、实现、验证、合并或发布权限。
- 必需 Gate 的 skip 或未运行仍为 MISCONFIGURED；任何已运行 Gate 的失败仍为 RED。
- Deep Gate 仍覆盖所有 fast/full 检查和现有 build；删除 audit 不能删除或放宽其他检查。
- 独立验证、当前 SHA 绑定、`factory:verified` 和最终人工合并要求保持不变。
- 无令牌、私有 registry 凭据、日志或本地环境路径进入仓库。

## 7. 实现顺序

1. 先增加失败测试，证明旧 Deep Gate 仍包含 audit，且旧仓库缺少统一状态脚本。
2. 实现状态脚本并用 fake `gh` 覆盖非法输入、保留普通标签、清理多个旧状态、幂等无写、读取失败和
   PATCH 失败。
3. 从 Gate 配置与执行器移除 audit，保留显式 `npm run audit`，并验证 Deep 不调用外部漏洞服务。
4. 更新 doctor、Contract 和四个相关 skills，检查所有允许的状态写入入口都使用统一脚本。
5. 运行脚本语法检查、回归测试、`doctor.sh` 和 `./.factory/scripts/gates.sh deep`。
6. 由隔离的新 Agent 对当前完整 SHA、Issue、Spec、完整 diff 和 Gate 证据进行冷读验证。

## 8. 测试与验证

### 8.1 先失败、后通过

- 基线断言应证明 `REQUIRED_DEEP` 和 `gates.sh` 包含 audit，修订后断言 Deep 不再引用或调用 audit。
- 基线断言应证明状态脚本不存在；修订后 fake `gh` 集成测试验证单次 PATCH 与标签集合。

### 8.2 确定性回归

- `bash -n` 检查所有修改或新增 shell 脚本。
- 状态脚本覆盖：无参数、非法 Issue、非法状态、缺少/未鉴权 `gh`、读取失败、更新失败、无旧状态、
  一个旧状态、多个旧状态、普通/Pattern 标签保留、目标状态幂等。
- fake `gh` 记录调用次数和参数，成功更新必须恰好一次 PATCH，幂等路径必须零次 PATCH。
- Gate 测试使用 fake package manager 或静态契约断言，证明 Deep 不访问 audit，同时 types/lint/test/build
  的失败语义没有改变。
- `doctor.sh` 在新脚本存在且可执行时通过，缺失时 fail closed。
- 运行 `./.factory/scripts/gates.sh deep`；不得跳过必需 Gate 或报告 MISCONFIGURED。

## 9. 验收标准

- Deep Gate 在没有 audit 网络/API 的环境中仍能仅依据仓库内检查给出确定性 verdict。
- `npm run audit` 仍存在，可由维护者显式运行，Factory 不宣称其结果为 GREEN 组成部分。
- 所有 Factory Issue 状态转换入口都调用统一脚本，不再自行组合状态标签增删命令。
- 状态更新保留普通及 Pattern 标签、清理全部旧状态、写入唯一目标状态，并且最多一次 PATCH。
- 幂等、错误和异常旧状态行为都有自动测试，机器可读输出与退出码稳定。
- Contract、skills、doctor、配置与实现一致，Pattern 和人工授权边界不变。
- Deep Gate GREEN，当前 SHA 的独立验证接受，PR 清楚记录删除强制 audit 的风险与恢复方式。

## 10. 风险与回滚

- **减少自动漏洞提醒**：保留显式 `npm run audit` 并在 PR 中说明按需运行；不把未运行描述为安全。
- **错误覆盖普通标签**：用 fake `gh` 精确断言 PATCH 标签数组包含全部非状态标签。
- **并发更新覆盖脚本读取后的新普通标签**：GitHub Issues API 没有标签 compare-and-swap；脚本将读取和
  PATCH 压缩到最小窗口并一次提交。若未来出现真实并发丢标签证据，应增加版本/重读策略，而非静默
  扩大本需求。
- **skill 与脚本漂移**：doctor 和测试覆盖必需文件与调用约束，独立验证搜索所有直接状态写入。
- **自修改 Gate 的可信度**：独立验证必须同时检查批准 Spec、Gate 配置差异、回归测试和完整脚本，不能
  仅引用修改后的 Gate 自身 verdict。

回滚时恢复原 Gate 配置和 audit 执行路径，并同时回滚状态脚本、doctor、Contract、skills 和对应测试，
不得留下文档要求脚本但仓库缺失，或脚本存在但 Agent 继续直接改标签的半完成状态。
