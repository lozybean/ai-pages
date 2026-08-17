# DeepSeek Harness（dsh）研究

- 检索日期：2026-08-17（Asia/Shanghai）。
- 证据规则：只采用 DeepSeek 官方官网、官方 GitHub 仓库及其源码级文档；相似名称的二手文章、社区博客和非官方仓库不作为事实依据。
- 结论先行：用户所说的 “DeepSeed Harness / DSH” 在公开官方材料中对应的是 **DeepSeek Harness**，仓库中的 CLI 名称是 `dsh`。没有找到官方项目把名称写成 “DeepSeed Harness”。

## 1. 项目身份与一手来源

### 1.1 已确认身份

- 官方仓库标题为 **DeepSeek Harness**，仓库 README 将其定义为由 DeepSeek AI 开发的开源 agent harness，并明确使用 `dsh` 作为命令行入口；仓库当前为开发者预览版，接口可能发生兼容性破坏性变化。[官方仓库](https://github.com/deepseek-ai/deepseek-harness)
- DeepSeek 官方产品页使用同一名称，并以“一切皆插件”为核心口号；页面还直接链接到官方仓库、文档、插件生态和 Cordis 论文。[DeepSeek 官方 Harness 页面](https://deepseek.com/harness/)
- 官方文档入口为 [DeepSeek Harness 文档站](https://deepseek-harness.github.io/)；仓库内的源码级设计说明集中在 [`docs/`](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs)。

### 1.2 “DeepSeed” 混淆项

- 官方 DeepSeek 页面和官方仓库都稳定使用 **DeepSeek** 拼写，因此本文将 “DeepSeed Harness” 视为用户可能出现的拼写误差，不把它当作已确认项目名。[官方页面](https://deepseek.com/harness/) · [官方仓库](https://github.com/deepseek-ai/deepseek-harness)
- 公开网络上确有一个名称为 **DeepSEED** 的官方 GitHub 项目，但它是用于合成生物学启动子设计的 GAN/优化器代码，不是 agent harness，也没有 DSH 的 agent loop、插件或工具运行时。[DeepSEED 项目仓库](https://github.com/WangLabTHU/deepseed)
- 因此本研究的身份判定是：**DSH = DeepSeek Harness；未确认存在名为 DeepSeed Harness 的官方同名项目。** 若用户实际指向另一个内部项目或未公开项目，仍需补充其官方链接或组织名。

### 1.3 论文与作者一手材料

- 本次检索没有确认到一篇单独以 DeepSeek Harness 为主题的产品论文。官方产品页链接的论文是底层 Cordis 框架论文，题为 “A Programming Paradigm for Spatiotemporal Composability”；它应被标为 **DSH 的底层框架论文**，不能直接当作 DSH 产品论文。[官方产品页](https://deepseek.com/harness/) · [Cordis 论文仓库](https://github.com/cordiverse/paper)
- Cordis 官方仓库将 Cordis 定义为“Spatiotemporal Composability”的元框架，并把论文和文档作为官方入口；这为解释 DSH 的插件生命周期和可组合性提供了一手依据。[Cordis 官方仓库](https://github.com/cordiverse/cordis)

## 2. 已证实事实

### 2.1 总体架构：Harness 是插件运行时，不是一个固定的中心控制器

- DSH 的官方表述是 “Everything is a Plugin”：模型适配器、工具注册表、session log、agent loop 等产品部分都由插件提供；Cordis 内核主要负责插件的加载、卸载和依赖关系，能力通过插件服务、类型化事件和可逆 effect 注入共享上下文。[架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) · [DeepSeek 官方 Harness 页面](https://deepseek.com/harness/)
- 运行中的 DSH 是由有序配置层叠加出来的插件树。profile bundle、profile/home patch 和命令行 `--patch` 可以改变组合；官方 CLI 文档说明 `web` 与 `headless` 是预置 profile，其他 profile 通过插件管理创建。[CLI README](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/README.md) · [架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- 官方架构把能力拆成 Service Definition、Provider、Consumer 三类：扩展依赖稳定的服务定义，而不是某个具体实现；因此文件系统、shell、sandbox、模型适配器和 subagent provider 都可以替换，而不必重写 agent loop。[架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) · [packages 目录说明](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages)
- Core 包的产品脊柱包括 `agent` 公共契约、可替换的 `agent-loop` 默认实现、`session`、`system-prompt`、`tools`、`scope` 和模型适配 seam；扩展依赖 `agent` 而不是依赖具体 loop。[Core 包说明](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/core) · [Core 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/core.md)

### 2.2 Agent loop：turn/step 两层循环，事件日志先于模型可见状态

- DSH 区分 **turn** 和 **step**：一个 step 是一次模型请求及其工具执行；一个 turn 从第一次输入被接收前后开始，到没有待处理输入或工具工作时结束。默认 driver 的 loop 可被替换，但 `agent` 契约和事件域保持独立。[Core 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/core.md)
- 一次典型 turn 的已证实顺序是：输入进入 inbox → driver claim 下一步输入 → `agent/pre-step` 决定拒绝或进入 → `step/start` → 追加用户消息 → 从 session log 派生历史 → 组装 system prompt 和工具 schema → `agent/request` 调用 LLM 流 → 追加 assistant chunks/message → 分类工具调用 → 工具执行 → `step/end` → 若仍有待处理工作则进入下一 step，否则执行 `agent/turn-stopping` 和 `turn/end`。[Agent 生命周期文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/agent-lifecycle.md) · [架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- 工具调用在真正执行前先追加 `tool/call`，再经过 pre-execute、policy/guard、approval、sandbox、execute 和 post-execute 阶段，最后追加 `tool/result`；工具并发采用带 barrier 的受控滚动池，而不是把所有工具调用直接 `Promise.all`。[工具执行流水线](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-execution-pipeline.md) · [工具子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/tools.md)
- 官方运行时不允许把“只存在于内存、但已经送入模型”的内容当作隐藏状态：模型可见输入必须进入 session event stream，并可由 log 重建；`request/header` 还记录完整请求 envelope、渲染后的 system prompt 和工具 schema。[架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) · [Session 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session.md)
- 这使 fork、resume、replay、UI trajectory、telemetry 和持久化都共享同一事件源，而不是各自维护一份“对话真相”。[DeepSeek 官方 Harness 页面](https://deepseek.com/harness/) · [Session 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session.md)

### 2.3 插件、组件和工具

- 官方 package inventory 覆盖模型、session、system prompt、tools、shell、terminal、filesystem、LSP、skills、subagent、jobs、workflow、goals、schedule、sandbox、approval、persistence、telemetry、web/ACP/SDK 等组件；这些是独立能力包，不是一个不可拆分的 agent 类。[官方 packages 目录](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages)
- `ToolDefinition` 不只包含模型可见的参数 schema，还包含输出声明、执行函数、调度元数据和展示信息；只有 allowlist 后的字段进入模型请求。工具注册表支持按 scope 分层、shadowing、allow/deny restriction，以及不可被后续 hook 重新放开的 deny-only guards。[工具子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/tools.md)
- Skills 是可选能力族：可以由本地、内置或远程 provider 发现，按 host scope 与 agent scope 分层，并分别控制模型是否可调用、用户是否可调用；skill 内容按需通过 `ctx.skills.get()` 加载，不等于硬编码进每个 session。[Skills 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/skills.md)
- Subagent 同样是可选 capability seam。官方列出 in-process、session fork、ACP、Codex、Claude Code、DSH SDK 等 provider；provider 被移除后会阻止新的启动，但已经运行的 child run 保持其生命周期。[Subagent 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/subagent.md)
- MCP 作为外部插件/工具边界存在。官方 `mcp-memory` 示例明确是默认关闭的第三方互操作示例，DSH 负责启动或连接 MCP server、发现 `mcp__...` 工具和处理 stdio 生命周期，不负责替 MCP server 安装数据库、模型或 embedding provider。[MCP memory 示例](https://github.com/deepseek-ai/deepseek-harness/blob/master/examples/mcp-memory/README.md)
- Agent preset 是一组 per-agent 的 Cordis composition，至少可以改变工具集合、prompt sections 和 projection；官方预置 `standard`、`minimal`、`code`、`cordis` 四类 preset。[Preset 包说明](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/preset) · [官方 preset 目录](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/cli/config/agent-presets)

### 2.4 System prompt：有内置机制和默认 persona，但不是不可替换的单一 prompt

- `system-prompt` 是一个独立 core package。插件以带唯一名称和 order 的 `PromptSection` 注册静态或动态文本，也可以注册动态 `PromptContext`、工具 schema provider 和 prompt variable；每次 model step 前按 scope 和顺序重新 assembly。[System Prompt 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/system-prompt.md)
- 官方约定的 prompt 顺序包括 harness identity、deployment persona 和工具指导；scoped section 可以 shadow 全局 section。设置 `complete: true` 后，该 section 在 assembly 完成后成为唯一 system prompt，不能再被其他 listener 追加或替换。[System Prompt 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/system-prompt.md)
- `standard` preset 的官方 YAML 显式注册 `@deepseek-ai/dsh-persona`，persona 文本会插入模型名和工作目录，并同时挂载 agent instructions、bash、filesystem、skills、goal、plan、compaction、delegation/workflow 等能力。[standard preset 配置](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/config/agent-presets/standard/agent.cordis.yml)
- `minimal` preset 更明确地证明了“内置 system prompt”存在：它使用一个完整固定 persona（“You are a helpful software engineer assistant.”），`complete: true`，关闭 runtime context，只保留持久 bash 与 `str_replace_editor`，且没有 compaction。[minimal preset 配置](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/config/agent-presets/minimal/agent.cordis.yml)
- 因此准确表述应是：**DSH 内置 system-prompt assembly、deployment persona 和多套默认 preset prompt；具体 system prompt 由 profile/preset/plugin composition 决定，可被 shadow 或在 preset 中设为 complete。**[Persona 包说明](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/preset/persona) · [System Prompt 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/system-prompt.md)

### 2.5 生命周期、状态和记忆

- Session 是 append-only typed `SessionEvent` 的 event-sourced 模型；LLM history 不单独存储，而是从 log 派生。事件包括 turn/step、user、assistant chunks/message、tool call/result、request header 等。[Session 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session.md)
- session persistence 是独立 capability seam，而非 agent loop 内置的第二套事件模型。官方文档描述 JSONL 与 SQLite backend、flush 边界和 crash recovery：未正常结束的 open turn 会恢复为 interrupted turn/end，不会静默截断历史。[Persistence 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/persistence.md)
- `resume` 从持久化 session 恢复，`fork` 只能发生在 turn 边界；AgentHandle dispose 会停止 loop、等待退出、注销 agent/session 并撤销 scoped world。这是组件生命周期的一部分，而不是只释放一个模型客户端。[Core 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/core.md) · [Session 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session.md)
- Compaction 是可选能力 seam，不是 loop 的核心步骤；它用事件记录被压缩的区间、摘要和 token 信息，并保持 tool-call/tool-result 配对。官方 `standard` preset 可通过 `dsh-compaction-basic` 和 tool-result pruner 选择性启用。[Compaction 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/compaction.md) · [standard preset 配置](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/config/agent-presets/standard/agent.cordis.yml)
- DSH 的“session history”与“长期语义记忆”是两个不同层次。官方 memory 示例是 default-off 的 MCP overlay；示例 memory server 保存实体、关系和观察记录，但没有 embedding、摘要、冲突解决或遗忘机制，且 shipped composition 不默认挂载 memory server。[MCP memory 示例](https://github.com/deepseek-ai/deepseek-harness/blob/master/examples/mcp-memory/README.md)
- 官方示例还展示了 active reminders：调度任务持久化在原 session 中，session 再次活跃时恢复；它们在进程冷态时不会凭空继续执行。[Examples 总览](https://github.com/deepseek-ai/deepseek-harness/blob/master/examples/README.md)

### 2.6 评测与测试

- 官方测试策略分层：Vitest 单元测试、每文件 100% coverage gate、真实 provider API e2e、keyless snapshot、ACP replay/diff 和浏览器 snapshot；测试偏好错误路径、事件顺序、并发 race、取消、恢复和 HMR disposal。[官方 testing policy](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/testing.md)
- 官方测试文档要求真实 entry path 和真实 composition：产品可见插件不能只在手工 `ctx.plugin(...)` harness 中测试，还要通过 Loader 和 app/process 启动，验证 model-visible request、log、durable state 或用户可见输出。[官方 testing policy](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/testing.md)
- 官方 policy 明确认为“无 key 的测试只证明 plumbing，有 key 的真实 API 测试才证明 agent 在真实模型上工作”，并要求覆盖文件写入、多轮、工具调用和 mid-stream cancellation。[官方 testing policy](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/testing.md)
- 仓库还有一个极简 `BENCHMARK.md`：要求用 Python SDK 运行 `jsonrpc-agent` minimal variant，并为独立任务使用不同 workspace 和 session ID；它是 benchmark 运行入口，不是已发布的 DSH benchmark 分数或论文。[BENCHMARK.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/BENCHMARK.md)

### 2.7 安全、权限和可观测性

- Approval 是独立的 capability seam，支持按 session 的 ask/never 策略；没有 answerer、answerer 抛错或请求不可用时默认 fail closed，决策和策略变化会进入审计/事件流。[Approval 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/approval.md)
- Tool policy 采用多阶段且单调收紧的执行管线：pre-execute 可拒绝或触发 approval，guard 只能 deny，不能把已经 deny 的调用重新 allow；工具参数不在 policy 层偷偷改写，以保持历史、审计、UI 和实际执行一致。[工具子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/tools.md) · [工具执行流水线](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-execution-pipeline.md)
- Sandbox 提供 Linux bubblewrap/Landlock、macOS Seatbelt、Windows ACL/restricted-token 等后端及 read-only、workspace-write、danger-full-access 等模式；若无法建立 sandbox，`confine` 应报错，不能静默退化为未隔离执行。[Sandbox 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/sandbox.md)
- 官方还提供 runtime invariant registry：每个 workspace package 可以附带 companion plugin，对权威事件流和可变数据做运行时断言；这不是 agent loop 的业务逻辑，但用于捕捉跨插件契约破坏。[Invariants 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/invariants.md)
- `cordis` preset 的官方配置特别声明：`cordis_mount` 会让模型编写的 JavaScript 作用于 live runtime，使用该 preset 应按 shell access 级别信任。这说明“可重编程 harness”本身也是一个高权限边界。[cordis preset 配置](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/config/agent-presets/cordis/agent.cordis.yml)
- MCP memory 示例会对 stdio 子进程的环境变量做清洗，移除 credential-like 和 `DSH_*` 变量；同时官方明确声明该 memory server 是第三方示例，不代表 DeepSeek 背书。[MCP memory 示例](https://github.com/deepseek-ai/deepseek-harness/blob/master/examples/mcp-memory/README.md)

## 3. 合理推断（不是官方原文）

- **Harness 被定位为“模型之外的可组合运行时”。** 官方页面把关系写成 “Agent = Model + Harness”，而架构又把模型、prompt、tools、session、loop、sandbox 和 UI 都做成可替换插件；由此可以合理推断，DSH 的产品边界不是“某个固定 agent 的工具包”，而是为不同模型和不同能力组合提供运行环境。[DeepSeek 官方 Harness 页面](https://deepseek.com/harness/) · [架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- **首要设计目标是可追溯与可重放，而不只是把工具调用跑通。** “模型可见即记录”、完整 request header、append-only event log、fork/resume/replay 和真实 composition 测试共同表明：可解释的状态投影和重建能力被当作运行时契约。[Session 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session.md) · [官方 testing policy](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/testing.md)
- **安全哲学偏向分层约束，而不是只依赖 system prompt。** approval、deny-only guard、sandbox、审计事件、runtime invariants 和真实世界 e2e 分别约束决策、执行环境、状态一致性和验证方式；这些约束即使模型 prompt 发生变化也仍然存在。[Approval 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/approval.md) · [Sandbox 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/sandbox.md) · [工具执行流水线](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-execution-pipeline.md)
- **“记忆”被刻意放在可选能力边界，而非默认核心。** 官方核心把 session persistence、compaction、schedule 等状态机制做成可组合能力，同时把语义 memory 放进 default-off MCP 示例；因此可推断其更倾向于让部署者选择记忆后端和数据治理边界，而不是强制一个内置向量记忆方案。该结论是设计推断，不等同于官方宣称“DSH 永远没有 memory”。[MCP memory 示例](https://github.com/deepseek-ai/deepseek-harness/blob/master/examples/mcp-memory/README.md) · [Persistence 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/persistence.md)
- **Cordis 的时空可组合性是 DSH 的生命周期哲学基础。** Cordis 论文把 spatial composability 解释为声明式/反应式依赖，把 temporal composability 解释为移除组件时撤销其副作用；DSH 的 scoped realm、disposer、配置 patch 和 plugin unload 行为与这一抽象一致。[Cordis 论文仓库](https://github.com/cordiverse/paper) · [Cordis 官方仓库](https://github.com/cordiverse/cordis) · [Core 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/core.md)

## 4. 待验证问题

- **默认 prompt 的精确版本和差异**：`standard`、`minimal`、`code`、`cordis` 的 prompt 已能从 master 配置确认，但仓库是 developer preview，下一次提交可能改变文本、顺序或默认工具；若文章需要逐字引用，应锁定具体 commit，而不是只链接 `master`。[官方仓库](https://github.com/deepseek-ai/deepseek-harness) · [preset 目录](https://github.com/deepseek-ai/deepseek-harness/tree/master/apps/cli/config/agent-presets)
- **实际 profile 的最终装配结果**：文档描述了 bundle/patch 顺序和 `dsh --dump-config`，但仅凭公开文档不能替代在目标版本运行该命令；需要对 `web`、`headless` 和用户自定义 profile 分别 dump，并记录实际启用的 provider。[CLI README](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/README.md) · [架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- **sandbox 的部署级网络与进程边界**：官方文档明确列出平台后端和文件策略，但网络访问、process visibility 等部分取决于 backend/部署配置；要写成安全保证，仍需在目标平台做运行时验证。[Sandbox 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/sandbox.md)
- **长期语义记忆的生产实现**：目前能确认的是 session event persistence 和可选 MCP memory 示例；没有在已检索的一手材料中确认一个默认、统一的 DSH semantic-memory backend。若文章要比较“内置记忆能力”，应避免把 session history、compaction 或第三方 MCP server 统称为内置 memory。[Session 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session.md) · [MCP memory 示例](https://github.com/deepseek-ai/deepseek-harness/blob/master/examples/mcp-memory/README.md)
- **评测结果**：官方仓库确认有真实 API e2e、snapshot、ACP replay 和 benchmark 入口，但本次未确认公开的 DSH 专项 benchmark 分数、长程任务排名或独立 DSH 产品论文；这些不能从 `BENCHMARK.md` 的运行说明推导出来。[官方 testing policy](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/testing.md) · [BENCHMARK.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/BENCHMARK.md) · [官方仓库](https://github.com/deepseek-ai/deepseek-harness)
- **项目身份边界**：若“DeepSeed Harness”不是 DeepSeek 的拼写误差，而是某个未公开、内部或私有项目，则当前公开一手证据不足以确认其身份；需要用户提供项目链接、组织名或作者信息。[DeepSeek 官方 Harness 页面](https://deepseek.com/harness/) · [DeepSEED（无关项目）](https://github.com/WangLabTHU/deepseed)

## 5. 给后续 Harness 文章的最小结论

DSH 的独特性不在于发明一个新的“思考—调用工具—继续思考”循环，而在于把循环周围几乎所有可变部分都提升为 Cordis plugin：prompt、模型路由、工具、session log、持久化、compaction、subagent、sandbox、approval、UI 和评测入口都能被组合、替换和卸载。它的设计哲学可以概括为：**插件化能力 + 事件溯源状态 + 可撤销生命周期 + 分层安全边界 + 真实运行路径验证**。[DeepSeek 官方 Harness 页面](https://deepseek.com/harness/) · [架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) · [Core 子系统文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/core.md)
