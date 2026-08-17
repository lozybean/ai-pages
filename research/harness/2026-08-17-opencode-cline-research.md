# OpenCode 与 Cline 技术设计研究

> 研究日期：2026-08-17
>
> 用途：补充 `pages/harness-agent-runtime.html` 中 OpenCode 与 Cline 两个 harness 小节。

## OpenCode

### Runtime 路径

OpenCode 的 `session/prompt` 负责汇合 session、agent、system prompt、instructions、skills、tool registry 和 MCP tools，并进入模型请求与工具循环。工具执行前后由 plugin hook 介入；session compaction 在上下文压力下生成 checkpoint，并据此重建后续请求。

- [Session prompt source](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/session/prompt.ts)
- [Compaction](https://opencode.ai/v2/docs/compaction)

### 工具与权限

官方工具文档列出 `bash`、`edit`、`write`、`read`、`grep`、`glob`、`lsp`、`apply_patch`、`skill`、`todowrite`、`webfetch`、`websearch`、`question` 等内置工具，并把 custom tools、MCP servers 放在同一工具面中。

Permission 支持 `allow`、`ask`、`deny`，可以匹配工具、具体 bash 命令、文件路径和 `external_directory`。规则支持通配符，最后匹配的规则优先；agent 可以覆盖全局权限。`--auto` 只自动批准原本需要询问的动作，显式 deny 仍然生效。

- [Tools](https://opencode.ai/docs/tools/)
- [Permissions](https://opencode.ai/docs/permissions/)

### Agent、Skill 与 Plugin

Agent 可以配置 model、prompt、permission、tools 和 `mode`。`mode` 支持 `primary`、`subagent`、`all`；Task 工具负责调用子 Agent，`permission.task` 可以限制可调用的子 Agent。

Skill 采用 progressive disclosure：工具描述先列出可用 skill，模型选择后再载入具体内容；skill 也受 pattern-based permission 控制。

Plugin 是 JavaScript/TypeScript 模块，可从 npm、全局目录或项目目录加载。插件函数接收 project、directory、worktree、SDK client 和 shell API，返回事件 hooks 或 custom tools。官方示例包含 `tool.execute.before`、`tool.execute.after` 和 `experimental.session.compacting` 等扩展点。

- [Agents](https://opencode.ai/docs/agents/)
- [Skills](https://opencode.ai/docs/skills/)
- [Plugins](https://opencode.ai/docs/plugins/)

### 设计判断

OpenCode 的设计重点是 provider-neutral、显式配置和细粒度治理。工具、Agent、权限、Skill、Plugin、MCP 与 Session 都拥有独立的配置边界，并通过统一的 prompt/tool dispatch 路径协作。

## Cline

### Runtime 分层

Cline SDK 将运行时拆成多层：host 构造 `RuntimeHost`；`@cline/core` 负责 session、持久化、配置发现、RPC 和运行时宿主；`@cline/agents` 提供无状态 Agent Loop；`@cline/llms` 处理模型 provider；core 最后保存 state、artifacts 和 metadata。local、hub、remote host 都可以复用同一套 Agent Loop。

- [SDK README](https://github.com/cline/cline/blob/main/sdk/README.md)
- [SDK Architecture](https://github.com/cline/cline/blob/main/sdk/ARCHITECTURE.md)

### 工具与完成判定

官方工具参考覆盖文件写入、读取、局部替换、搜索、目录浏览、代码定义、命令执行、浏览器操作、MCP、追问、完成和新任务。SDK 层还提供归一化的 bash、editor、read_files、apply_patch、search、fetch_web 等工具。

当前 SDK 架构以成功的 `submit_and_exit` tool call 作为明确完成信号，并据此发出 `task.completed`；旧产品语义中的 `attempt_completion` 与之对应。完成判定因此拥有独立的 runtime 事件，而不依赖 session 关闭。

- [All Cline Tools](https://docs.cline.bot/tools-reference/all-cline-tools)
- [Cline SDK Architecture](https://github.com/cline/cline/blob/main/sdk/ARCHITECTURE.md)

### Plan/Act

Plan mode 可以读取代码、搜索和讨论方案，运行时禁止修改文件和执行命令；Act mode 沿用 Plan 阶段上下文，恢复文件修改与命令执行能力。两个模式可以配置不同模型，用户也可以在复杂任务中多次切换。

- [Plan & Act](https://github.com/cline/cline/blob/main/docs/core-workflows/plan-and-act.mdx)

### Plugin 与 Hook

Cline plugin 可以是单文件 TypeScript 模块，也可以是带依赖和资源的 package。加载过程包含 resolve、validate、setup、activate；manifest capabilities 必须与注册能力匹配，session 激活后注册表冻结。

插件可注册 tools、commands、rules、message builders、providers 和 automation event types。Typed runtime hooks 包含 `beforeRun`、`afterRun`、`beforeModel`、`afterModel`、`beforeTool`、`afterTool`、`onEvent`；插件可以阻止工具、改写模型请求、替换工具结果和驱动 telemetry。File hooks 适合工作区脚本，runtime hooks 适合可复用插件。

- [Cline plugin guide](https://github.com/cline/cline/blob/main/sdk/.cline/skills/plugin.md)

### Session、Compaction 与 Checkpoint

Core 负责 SQLite session persistence、配置发现和多进程运行。canonical transcript 保留完整历史，compaction state 独立保存；恢复时校验 compaction 覆盖的历史前缀，再把边界之后的消息投影回工作上下文。文件变更通过 Git-based checkpoint 追踪和回滚，Hub 可以让多个客户端连接同一个 session 并接收结构化事件流。

### 设计判断

Cline 的设计重点是分层运行时与显式协作状态：Agent Loop 保持无状态，Core 管理事实状态和恢复，Host 负责交互与部署形态，Plan/Act、checkpoint、plugin 和 hook 共同构成可审阅、可暂停、可继续的人机工作流。
