# Data Structures（核心数据结构）

读到中途卡住时，回这里查「这些类型到底长什么样」。只列对理解主干最关键的结构，完整权威定义在官方 [subsystems](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/subsystems/README.md) 各页。

## Cordis 层（地基）

- **Context** —— 核心对象。一个「服务仓库」+「事件总线」+「生命周期」三合一的代理。读 `ctx.tools` 实际走服务解析器。
- **Service** —— 暴露服务的基类。子类 `super(ctx, name)` 把自己注册到 `ctx.<name>`。
- **Fiber** —— 一个插件实例的运行时句柄。字段：`state`（状态机）、`ctx`（该插件的上下文）、`dispose()`（卸载并等清理完成）。
- **Plugin.Runtime** —— 一个插件模块的共享运行时（一个 `apply` 函数 / 类的元信息）。

## 会话与模型层

- **SessionEvent** —— 日志里的一条持久事实，带 `type` 判别标签（如 `user/message`、`assistant/message`、`tool/call`、`step/start`）。`SessionEventMap` 是它的完整变体目录。
- **Message / ContentBlock** —— 模型词汇：`Message` 有 `role` 和 `content: ContentBlock[]`；`ContentBlock` 是 `text` / `tool-call` / `tool-result` 等的判别联合。
- **StreamChunk** —— 流协议：`text-delta` / `tool-call` / `finish` 等块，adapter 按这个吐，assembler 按这个拼。

## 工具层

- **ToolDefinition** —— 一个工具的完整定义：`name`、`description`、`parameters`（转成给模型的 JSON Schema）、`output`（返回值契约）、`execute`。
- **ToolExecution** —— 一次工具调用的运行时句柄：`callId`（branded 关联 id）、`name`、`arguments`、`signal`。
- **ToolResult** —— 规范化结果：`content`（Native/durable 块）+ 元数据。

## Agent 层

- **Agent** —— 接口 + 句柄。核心方法：`followup()`（排队消息）、`steer()`（转向）、`inject()`（注入上下文）、`dispose()`（拆到静止）。
- **AgentHandle** —— 拿到一个活 agent 的交付/取消/拦截契约。

## 能力层（每个 seam 一组）

每个 seam 有一组「请求/结果」类型。以 shell 为例（s05 的 canonical 例子）：

- **ShellExecRequest / Spec** —— 请求；`Spec` 是解析后的显式规格（`resolve(request): Spec` 是默认化的显式步骤）。
- **ShellRunResult** —— 结果。
- **ShellProcess** —— 后台进程句柄。

其它 seam 同构：fs 有 `FsTarget` / `FsErrorCode`，web 有 `WebSearchRequest` / `WebFetchRequest`，subagent 有 `SubagentStartRequest` / `Run`。

## 通用约定

- **branded id** —— 跨边界的 id 用 `Branded<B>`（来自 `dsh-brand`），不是裸 `string`。例：`SessionId`、`CallId`、`JobId`。
- **判别联合** —— 用 `type` 标签判别，封闭联合结尾 `assertNever`，可扩展联合走文档化的默认分支。
- **`...Map → derived-union`** —— 仓库级类型模式：一个 map 类型（如 `SessionEventMap`）派生出判别联合。
