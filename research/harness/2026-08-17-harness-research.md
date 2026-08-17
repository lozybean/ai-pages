# Harness：从 ReAct 循环到可治理的 Agent Runtime

> 研究日期：2026-08-17
>
> 目标：为 `ai-pages` 的 harness 专题文章建立一份可追溯的资料底稿，记录定义、比较轴、官方资料和待核实问题。

## 1. 文章核心判断

“Harness”可以从 Agent 的运行实践来理解。更可操作的定义是：

> Harness 是包围模型调用与工具循环的一层 Agent Runtime。它负责把任务、上下文、工具、状态、权限、记忆、验证、观测和扩展机制组织成一个可持续运行的工作系统。

因此，判断一个系统是否具备 harness 特征，可以追问：

1. 模型每一轮能看到什么上下文，哪些信息由 runtime 自动补齐？
2. 工具由谁提供、谁执行、谁审批，工具结果如何进入下一轮？
3. 多轮会话、任务状态、压缩、恢复和中断由谁负责？
4. 文件系统、shell、网络、子代理、长期记忆和技能如何接入？
5. 哪些行为由 prompt 约束，哪些行为由代码、权限或沙箱强制？
6. 失败如何归因，完成如何验证，过程如何观测和复盘？
7. 扩展点是 middleware、plugin、hook、MCP、skill，还是协议适配层？

ReAct 论文提供了“推理与行动交替”的模型交互范式；harness 将这个循环放进真实的任务、环境和治理边界中。可参考 [ReAct 论文](https://arxiv.org/abs/2210.03629) 与 [AI Harness Engineering: A Runtime Substrate for Foundation-Model Software Agents](https://arxiv.org/abs/2605.13357)。后者把 harness/runtime 的责任进一步展开为任务规格、上下文选择、工具访问、项目记忆、任务状态、可观测性、失败归因、验证、权限、熵审计和干预记录等。

## 2. 先拆开三个容易混淆的概念

### 2.1 Harness runtime

Claude Code、Codex、Pi、OpenCode、Cline、Grok Build、Deep Agents 都更接近“完整或较完整的 Agent Runtime”：它们不仅调用模型，还决定工具面、工作目录、权限、会话、上下文和扩展机制。

### 2.2 Harness adapter / meta-harness

Vercel AI SDK 的 Harness 抽象主要承担统一接入层角色，底层 coding harness 继续保留自己的 runtime 能力。官方文档把 `HarnessAgent`、adapter、sandbox provider 和 session 作为主要组成部分，并明确区分 harness 与普通 model provider：前者承接工作区、内置 coding tools、原生 session、compaction、permission flow 等 runtime 能力。

当前 Vercel 文档列出的 adapter 包括：Claude Code、Cline、Codex、Deep Agents、Grok Build、OpenCode、Pi；Amp、Goose、Mastra 标记为 coming soon。可参考 [Harness 总览](https://ai-sdk.dev/docs/ai-sdk-core/harness)、[Harness adapters](https://ai-sdk.dev/providers/ai-sdk-harnesses)。

这里适合在文章中作为“观察窗口”：同一个 AI SDK 把不同 runtime 映射到统一接口时，哪些差异被保留，哪些差异被抽象掉？

### 2.3 Observability / evaluation plane

Langfuse 与 Deep Agents、Claude Code 属于不同层。Langfuse 的核心是 LLM engineering platform：trace、evaluation、prompt management、dataset 和 observability。它提供 Agent Skill、CLI、MCP 等方式，让 coding agent 可以查询 traces、管理 prompts、创建 evaluations；coding loop 仍由外部 agent runtime 承担。

可参考 [Langfuse Agents](https://langfuse.com/agents/agents)、[Observation types](https://langfuse.com/docs/observability/features/observation-types)、[Agentic access](https://langfuse.com/docs/prompt-management/features/agentic-access)。

所以文章可以把 Langfuse 放在横向章节“harness 如何被观测和评估”，与 runtime 型 harness 形成层次互补。

## 3. 推荐文章主线：按能力层层展开

建议采用“能力递进”作为主顺序，时间线作为辅助注释：

1. **ReAct：最小的模型—工具—观察循环**
   - 说明为什么仅有循环还不够。
   - 引出 context、state、permission、verification 等外围责任。

2. **Deep Agents：用 middleware 把 harness 组装出来**
   - 适合承接用户对 ReAct + middleware 的直觉。
   - 展示规划、文件系统、subagent、memory、skills、HITL、context offloading 如何进入同一个 runtime。

3. **Pi：最小核心与深扩展面**
   - 与 Deep Agents 形成对照：保持小核心，把变化交给 TypeScript extensions、skills、prompts、packages、subagents 和 compaction。

4. **OpenCode / Cline：把工具、权限、模式和插件产品化**
   - OpenCode 适合讲 provider-neutral、显式工具权限和 agent mode。
   - Cline 适合讲 Plan/Act、人机交互、持久 session、插件 hook 和工作流控制。

5. **Claude Code / Codex / Grok Build：成熟 coding harness 的不同治理取向**
   - Claude Code：模型驱动的扩展面 + hooks 作为确定性护栏。
   - Codex：沙箱、审批、仓库级 `AGENTS.md` 和 skills/plugins 组成环境治理。
   - Grok Build：开源 runtime、计划审阅、并行 subagents、插件与 ACP 互操作。

6. **DSH / DeepSeek Harness：把整个运行时提升为插件组合**
   - 你写的 “deepseed harness” 对应的官方项目应是 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)，CLI 名称是 `dsh`。
   - 官方核心口号是 “Everything is a Plugin”：模型适配器、工具、prompt、session、agent loop、sandbox、approval、persistence 等都通过 Cordis 插件组合，运行时由插件树构成。
   - 它采用 turn/step 两层循环，并以 append-only session event log 作为模型上下文、回放、恢复和持久化的事实来源；system prompt 也由可排序、可 shadow 的 prompt sections 动态组装。
   - 这使 DSH 成为本文非常重要的“插件化极致样本”，但也要说明它与“只提供工具适配的协议 harness”不同：它确实覆盖完整 runtime，并把 runtime 的各个可变面都提升为插件。

7. **综合：harness 的真正设计对象是控制面**
   - prompt 是软约束，permission/sandbox/hook/validator 是硬约束。
   - tool 是动作接口，state/memory/context 是认知连续性。
   - skill/plugin/MCP/middleware 是不同粒度的扩展机制。
   - observability/evaluation/verification 让“完成”成为可观测、可检查、可判定的结果。

## 4. 统一比较表

文章每个小结建议固定回答以下问题，避免变成产品介绍合集：

| 维度 | 要回答的问题 |
|---|---|
| Runtime loop | 模型循环由谁驱动？是否支持中断、恢复、压缩和多轮 session？ |
| Core tools | 默认有哪些读写文件、shell、搜索、网络、任务、计划、提问或子代理工具？ |
| Prompt layer | 是否有公开的 base system prompt？工具是否伴随 prompt guidance？项目说明文件何时加载？ |
| State/context | 对话历史、任务清单、文件系统、memory、context offloading 如何保存？ |
| Safety | 权限是 prompt、代码规则、hook、审批还是 sandbox？默认策略是什么？ |
| Extension | middleware、plugin、hook、MCP、skill、subagent、protocol adapter 各自在哪一层？ |
| Verification | 是否有测试、diff、lint、review、completion guard 或其它完成判定？ |
| Observability | 是否支持 trace、event stream、usage、日志、evaluation 或 replay？ |
| Philosophy | 该 harness 优先保证什么：最小内核、自动化、可控性、协议正确性、开放性还是生产治理？ |

## 5. 各 harness 初步资料卡

### 5.1 Deep Agents：middleware 作为 harness 的骨架

官方定位是“batteries-included agent harness”，建立在 LangGraph runtime 和 LangChain agent loop 之上，并通过一组 opinionated middleware 扩展 `create_agent`。

核心内置能力：

- planning：`write_todos`；
- filesystem：`ls`、`read_file`、`write_file`、`edit_file`、`glob`、`grep`，在合适 backend 上还可有 `execute`；
- subagent：`task`，把复杂工作隔离到独立上下文；
- memory：把指定 memory files 注入上下文，并允许通过文件工具编辑；
- skills：按需加载的 reusable instruction bundles；
- HITL：对工具调用设置 interrupt/approve/edit/reject；
- context management：大工具结果写入文件、summarization/offloading，减少主上下文压力。

它的核心观察点是：middleware 同时改变 tool registry、system prompt guidance 和 state schema。官方文档展示的 assembled system prompt 大致包含 custom prompt、base agent prompt、todo prompt、memory prompt、skills prompt、virtual filesystem、subagent prompt、custom middleware 与 HITL prompt。

设计哲学：把 harness 的行为拆成可组合的中间件，使“规划、文件、记忆、技能、子代理、审批”成为可替换模块，同时保留一个稳定的模型—工具调用循环。参考 [Deep Agents README](https://github.com/langchain-ai/deepagents)、[Context engineering](https://docs.langchain.com/oss/python/deepagents/context-engineering)、[Architecture](https://github.com/langchain-ai/deepagents/blob/main/libs/ARCHITECTURE.md)。

### 5.2 Pi：小内核，扩展面接管复杂度

Pi 的官方 system prompt 源码直接把自己描述为运行在 pi coding-agent harness 中的 coding assistant，并根据当前启用的工具、工作目录、项目 context files 和 skills 动态组织 prompt。

默认工具主要是 `read`、`bash`、`edit`、`write`，扩展/文档还覆盖 `grep`、`find`、`ls`。它的 extensions 可以注册或覆盖工具，加入 `promptSnippet`、`promptGuidelines`、命令、UI、subagent、compaction、权限保护、git/SSH/sandbox 等能力；`--no-builtin-tools` 也说明工具面属于可调整的 runtime 配置。

设计哲学：保持一个可理解的最小 runtime kernel，把高变化的能力交给 TypeScript extension、skill、prompt、package 和 theme。它与 Deep Agents 的对照非常好：前者以 middleware 预组装能力，后者以 extension 让用户持续重塑能力。

参考 [Pi system prompt](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/system-prompt.ts)、[Pi extensions](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)、[Pi coding agent README](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/README.md)。

### 5.3 OpenCode：显式工具面与权限语法

OpenCode 官方工具文档列出了 `bash`、`edit`、`write`、`read`、`grep`、`glob`、`lsp`、`apply_patch`、`skill`、`todowrite`、`webfetch`、`websearch`、`question` 等内置工具。Agent 配置把权限与工具分开表达，支持 `allow`、`ask`、`deny`，并可按工具、命令或模式细化；agent 还有 primary/subagent 等 mode。

skills 采用按需加载方式：先通过 `skill()` 工具暴露入口，再载入具体说明，并由权限规则控制。这形成了“工具描述先暴露、说明内容后加载”的 progressive disclosure。

设计哲学：开放模型/provider 选择，同时把工具和权限做成可读、可配置、可审计的显式语法。它的治理重点不在隐藏 prompt，而在 permission lattice、agent mode、MCP/LSP/skill 等边界。

参考 [OpenCode tools](https://opencode.ai/docs/tools/)、[agents](https://opencode.ai/docs/agents/)、[skills](https://opencode.ai/docs/skills/)、[permissions](https://opencode.ai/docs/permissions/)。

### 5.4 Cline：Plan/Act 与人机协作

Cline 的工具面包括 shell/编辑/文件读取/patch/search/web，另外有浏览器操作、MCP、提问、完成、创建新任务等交互型工具。CLI/SDK 资料还显示其 runtime 关心 SQLite session、配置发现、RPC、多进程和自定义 system prompt/tools。

其显著特征是 Plan/Act 双模式：先收集信息和形成计划，再进入执行；用户可以在计划阶段介入。插件能力覆盖 tools、commands、rules、message builders、providers 和 hooks，hook 可在模型调用、工具调用、事件和运行结束等生命周期插入行为。

设计哲学：把“模型是否应该继续自动执行”变成显式工作流状态，同时通过 session 持久化和插件 hook 扩展人机协作。

参考 [Cline SDK](https://github.com/cline/cline/blob/main/sdk/README.md)、[Cline CLI](https://github.com/cline/cline/blob/main/apps/cli/README.md)、[Cline plugin skill](https://github.com/cline/cline/blob/main/sdk/.cline/skills/plugin.md)、[Cline tools reference](https://docs.cline.bot/tools-reference/all-cline-tools)。

### 5.5 Claude Code：模型驱动扩展与确定性护栏

官方文档描述的 coding agent 工作面包括读取/编辑文件、运行命令、MCP、`CLAUDE.md`、auto memory、skills、subagents 和 hooks。常见内置工具可归纳为 `Read`、`Write`、`Edit`、`Bash`、`Glob`、`Grep`、web search，以及用于子代理和交互的其它工具。

Claude Code 的完整内部 system prompt 暂未由官方完整公开，文章可聚焦其公开的 system-prompt 接口与上下文来源：`CLAUDE.md` 作为持久上下文加载，skills 按需加载，MCP 提供外部工具，subagent 启动隔离循环，hooks 负责生命周期自动化；权限文档还明确把 hook 放在工具权限检查之前，并允许 hook deny/ask/allow。

设计哲学：让模型通过 skills、MCP、subagents 组合能力，让 hooks 承担需要确定性执行的规则。可以概括为“模型负责决策，hooks/permissions 负责硬护栏”。

参考 [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)、[Features overview](https://code.claude.com/docs/en/features-overview)、[Memory](https://code.claude.com/docs/en/memory)、[Permissions](https://code.claude.com/docs/en/permissions)、[Tools reference](https://code.claude.com/docs/en/tools-reference)。

### 5.6 Codex：沙箱、审批与仓库级上下文

Codex CLI 是一个在本地仓库中检查、编辑和运行代码的 coding agent。其可见的工作面包括 shell/patch/file changes、web search、MCP、skills/plugins，以及通过 `AGENTS.md` 注入仓库级工作约束。

官方配置文档把 `AGENTS.md` 描述为工作前读取的 instruction files：全局和项目层级按路径合并，越靠近当前工作目录的内容可以覆盖上层内容。沙箱和 approval policy 是不同概念：sandbox 限制技术边界，approval 决定何时需要用户确认。这个区分值得作为文章中的重要例子。

完整内部 system prompt 暂作未知项。更可靠的分析对象是它公开的环境与治理边界：仓库 instruction、sandbox、approval、skills、hooks、MCP 和 review/verification 工作流。

设计哲学：把 coding agent 放在受限环境里运行，让“在哪里能写、能否联网、何时必须询问”成为 runtime policy，降低系统对提示词劝导的依赖。

参考 [Codex CLI](https://github.com/openai/codex)、[Codex CLI docs](https://learn.chatgpt.com/docs/codex/cli)、[AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[Sandboxing](https://learn.chatgpt.com/docs/sandboxing)、[Build skills](https://learn.chatgpt.com/docs/build-skills)。

### 5.7 Grok Build：开源 runtime、计划审阅与 ACP

xAI 的官方介绍强调 Grok Build 开源了 coding agent 和 TUI，同时公开 agent loop、context assembly、response parsing/tool dispatch、tools，以及 skills/plugins/hooks/MCP/subagents 等扩展系统。官方产品介绍还突出 plan mode、用户审阅/修改计划、clean diff、parallel subagents、interactive/headless/ACP 等。

设计哲学：把一个生产级 coding harness 的关键运行机制公开出来，并以 Rust runtime、local-first 配置、计划审阅和协议互操作为扩展方向。它适合放在文章的“harness 逐渐成为基础设施和协议节点”部分。

参考 [xAI open-source announcement](https://x.ai/news/grok-build-open-source)、[Grok Build repository](https://github.com/xai-org/grok-build)、[Grok Build CLI launch](https://x.ai/news/grok-build-cli)。

### 5.8 Langfuse：跨越 runtime 的质量闭环

Langfuse 的核心工具面集中在 trace、observation、prompt、dataset、evaluation 和 agent-facing access。它把 agent 或 tool 标记为 observation type，并允许 coding agent 通过 Skill、CLI 或 MCP 查询、分析和改进自己的运行数据。

设计哲学：harness 需要让系统知道 agent 做了什么、为什么失败、哪些 prompt/tool/version 导致了结果，并把反馈回写到 prompt、dataset 和 evaluation。Langfuse 更适合被定义为 harness 的 observability/evaluation plane。

### 5.9 DSH：Everything is a Plugin 的完整 runtime

当前已核对到的官方项目名称是 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)，CLI 名称为 `dsh`。官方产品页还链接了 [DeepSeek Harness 文档站](https://deepseek-harness.github.io/) 和底层 [Cordis 论文仓库](https://github.com/cordiverse/paper)。

DSH 将 loop 周围的几乎所有能力都做成 Cordis plugin：模型适配器、工具注册表、session log、system prompt、agent loop、filesystem、shell、skills、subagents、jobs、workflow、sandbox、approval、persistence、telemetry、web/ACP/SDK 等。插件依赖稳定的 service definition，能力因此可以替换、卸载和重组。

它的 agent loop 要区分两个层次：

- `step`：一次模型请求以及伴随的工具执行；
- `turn`：从输入进入到没有待处理输入或工具工作的更高层任务区间。

典型路径是 input inbox → claim → `pre-step` → `step/start` → 从 session log 派生历史 → 组装 system prompt 和工具 schema → 模型流式请求 → 追加 assistant chunks → 工具调用 → approval/policy/sandbox/execute/post-execute → `step/end` → 继续下一 step 或结束 turn。这里最有价值的设计点是：模型可见的内容必须进入 append-only session event stream，request header 还记录渲染后的 system prompt 和工具 schema。因此 fork、resume、replay、UI trajectory、telemetry 和 persistence 共享同一事实来源。

核心内置/可组合能力包括：

- 工具注册表：按 scope 分层，支持 shadowing、allow/deny restriction 和 deny-only guard；
- 文件系统、shell、terminal、LSP、skills、subagent、jobs、workflow、goals、schedule；
- session、JSONL/SQLite persistence、compaction、tool-result pruning；
- approval、sandbox、telemetry、ACP、web 和 SDK；
- 多套 agent preset，例如 `standard`、`minimal`、`code`、`cordis`。

DSH 的 `system-prompt` 是独立 package。插件按名称和顺序注册 `PromptSection`、动态 prompt context、工具 schema provider 和变量。`standard` preset 组装 persona、agent instructions、bash、filesystem、skills、goal、plan、compaction、delegation/workflow；`minimal` preset 则用 `complete: true` 的固定 persona，只保留有限工具，体现“可组合 prompt”和“完整固定 prompt”两种模式。

记忆可以分层描述：session event persistence 是核心状态事实来源；长期语义记忆通过 default-off 的 MCP memory overlay 接入。这样能够区分“会话历史”“压缩摘要”和“长期记忆”。

设计哲学可以概括为：**插件化能力 + 事件溯源状态 + 可撤销生命周期 + 分层安全边界 + 真实运行路径验证**。它与 Deep Agents 的差异尤其适合展开：Deep Agents 主要以 middleware 组装一个 opinionated harness；DSH 则把 runtime 的服务、生命周期和事实来源都纳入统一的可组合插件世界。

参考 [DeepSeek Harness 官方页面](https://deepseek.com/harness/)、[架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)、[Agent lifecycle](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/agent-lifecycle.md)、[Session subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session.md)、[System prompt subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/system-prompt.md)、[Tool execution pipeline](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-execution-pipeline.md)、[Cordis](https://github.com/cordiverse/cordis)。

## 6. Vercel adapter 作为横向观察窗口

Vercel 的 Harness adapter 文档把三个工具面分开：

1. **Runtime built-in tools**：由底层 harness 执行，adapter 可能标记为 provider-executed；
2. **Host-executed AI SDK tools**：由宿主应用执行，再把结果传回 runtime；
3. **External MCP tools**：通过 MCP 接入外部能力。

这三分法很适合文章中的一张图，因为不同工具面拥有不同的执行者、审批者、上下文注入点和故障边界。

Vercel 对不同 runtime 的工具暴露也保留了差异：例如其 adapter 文档中，Claude Code 暴露 read/write/edit/bash/glob/grep/webSearch；Codex 主要暴露 bash/webSearch，文件变化通过动态事件体现；Pi 暴露 read/write/edit/bash/grep/glob/ls；OpenCode 还包括 webfetch、skill、todowrite、agent 等。这说明统一 API 不等于统一 harness 语义。

参考 [HarnessAgent](https://ai-sdk.dev/docs/ai-sdk-core/harness)、[Tools](https://ai-sdk.dev/docs/ai-sdk-core/harness/tools)、[Skills](https://ai-sdk.dev/docs/ai-sdk-core/harness/skills)、[Adapters](https://ai-sdk.dev/providers/ai-sdk-harnesses)。

## 7. 文章中建议固定的“设计哲学”总结方式

每个 harness 小结最后不要只说“它支持 X、Y、Z”，而应把内置能力还原为设计选择：

| 观察到的能力 | 可能对应的设计哲学 |
|---|---|
| `write_todos`、`todowrite`、Plan mode | 任务分解和任务状态不完全交给模型短期记忆 |
| 文件系统工具、结果 offload、compaction | 上下文是稀缺资源，需要外部化和压缩 |
| `task` / subagent | 用上下文隔离换取并行、专注或失败隔离 |
| `SKILL.md` / `skill()` | 能力按需发现，避免所有说明常驻上下文 |
| middleware / plugin / hook | 把变化点从主循环中拆出；同时区分软扩展和硬治理 |
| sandbox + approval | 把权限边界从自然语言提升为 runtime policy |
| `AGENTS.md` / `CLAUDE.md` | 把项目知识和团队约束放到持久上下文层 |
| MCP / ACP | 把工具或 agent runtime 之间的连接标准化 |
| trace / evaluation / verification | 把“模型声称完成”变成可观测、可检查的完成判定 |
| protocol validator / reasoning round-trip | harness 也可以服务于模型协议契约，而不一定负责 coding loop |

## 8. 待核实问题

- DSH 当前是 developer preview，默认 preset、prompt 顺序和实际 profile 装配结果可能随 commit 变化；若文章逐字引用 prompt，应锁定 commit，并运行 `dsh --dump-config` 记录实际配置。
- sandbox 的网络、进程可见性和平台后端边界取决于部署配置；要写成安全保证，仍需做目标平台运行时验证。
- 官方能确认 session event persistence 和可选 MCP memory 示例，但没有确认一个默认、统一的 DSH semantic-memory backend；不要把 session history、compaction 或第三方 MCP server 统称为内置 memory。
- 官方测试文档有真实 API e2e、snapshot、ACP replay 和 benchmark 入口，但本次未确认公开的 DSH 专项 benchmark 分数或独立 DSH 产品论文；Cordis 论文应标作底层框架论文。
- Vercel adapter 文档仍在快速演进；写最终文章时应重新读取 adapter 列表和每个 runtime 的 built-in tool matrix。
- Claude Code、Codex、Grok Build 的完整内部 system prompt 暂作未知项；文章只写官方公开的 system-prompt 接口、注入来源和 runtime 行为。
- “发布时间顺序”不宜作为唯一主线：项目公开时间和能力成熟度不完全同构。建议以能力递进为正文，以时间线作为侧栏/注释。

## 9. 可选标题和摘要方向

### 标题候选

- 《Harness：Agent 如何从 ReAct 循环走向可治理的运行时》
- 《从 ReAct 到 Coding Harness：工具、上下文、权限与插件如何组装 Agent》
- 《谁在驱动 Agent：Deep Agents、Claude Code、Codex、Pi 与 OpenCode 的 Harness 设计》

### 一句话摘要

Agent 的能力来自模型与运行时的协同：harness 决定模型能看到什么、能调用什么、如何继续运行、何时需要询问，以及什么构成真正完成。不同 harness 的差异，最终体现在这些边界如何被实现、组合和治理。
