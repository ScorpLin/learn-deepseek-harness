# s05 · Capability Seam（能力接缝）

> **一句话**：一个 seam 是一个「可替换能力」，由三个角色组成——**Service Definition**（声明接口 + 占有 `ctx.<key>`）、**Service Provider**（实现）、**Consumer**（使用，通常是模型工具）。seam 是「换个实现就换掉整个产品」的本质。

## 是什么

前面四章你已经会了：服务（s03）、依赖注入（s03）、事件（s02）。把这三样拼起来，就是 seam。一个 seam 是**完整的能力**，三个角色缺一不可：

| 角色 | 干什么 | 例（shell） |
|---|---|---|
| **Service Definition** | 声明接口，占有 `ctx.<key>`，定义词汇类型 | `@deepseek-ai/dsh-shell`（抽象类 `ShellExecutor` + `ctx.shell`） |
| **Service Provider** | 实现接口，可能多个 | `@deepseek-ai/dsh-bash-local` / `dsh-bash-sandbox` |
| **Consumer** | inject 服务，使用它，通常是模型工具 | `@deepseek-ai/dsh-tool-bash` |

术语上的精确（官方 glossary）：Definition 是一个 Cordis `Service`——抽象类（如 `ShellExecutor`）或具体注册表（如 `WebRuntime`），**不是 TypeScript `interface`**。角色在各自独立演进时拆成不同包，但一个包也可以拥有多个角色（如 `dsh-llm` 同时拥有 Definition 和 Consumer）。

## 为什么：一个 provider 的替换，换掉整个产品

Consumer 只依赖 Definition 的接口，不依赖具体 Provider。所以：

> **换 provider = 改配置，不改 consumer。**

这建立在你已经懂的两条机制上：

1. Consumer 用 `inject` 拿到服务（s03），不 import 实现。
2. 服务中途被替换，依赖它的插件干净地卸载再重启（s03 的「依赖在加载后仍被追踪」）。

### 一个更深的推论：共享执行世界

文件系统与 subprocess 的 provider 共享同一个「执行世界」。把 `ctx.fs` 和 `ctx.subprocess` 一起指向远程沙箱时，**Bash、PTY、LSP 都跟着搬走，无需 fork provider**。这是 seam 设计最漂亮的后果之一。

## 怎么做：读 canonical 例子 shell

`packages/shell/` 是 seam 的 canonical 例子。按这个顺序读三个包（这是 [code-reading-order](s00f-code-reading-order.md) 里强调的读法）：

1. **Definition** — `packages/shell/shell/`（`@deepseek-ai/dsh-shell`）：声明 `ctx.shell` 服务、`ShellExecRequest/Spec` 请求类型、`ShellRunResult` 结果类型。
2. **Provider** — `packages/shell/bash-local/`（`@deepseek-ai/dsh-bash-local`）：实现本地 bash 执行。注意它通过 `ctx.subprocess` 派生进程。
3. **Consumer** — `packages/shell/tool-bash/`（`@deepseek-ai/dsh-tool-bash`）：`inject: ['shell']`，把 shell 能力包装成模型可调的 `bash` 工具。

读的时候盯住三件事：

- **「显式 > 隐式」**：`ShellExecRequest` 是用户请求，`ShellExecSpec` 是解析后的显式规格。默认化是一个显式的 `resolve(request): Spec` 步骤，在 owning 实现里做，而不是藏在 `run()` 里的 `?? default`。
- **请求/结果类型同构**：每个 seam 一组「请求/结果」类型。fs 有 `FsTarget`/`FsErrorCode`，web 有 `WebSearchRequest`/`WebFetchRequest`，subagent 有 `SubagentStartRequest`/`Run`。
- **Provider 注册即 effect**：provider 把实现挂到 `ctx.<key>`，卸载即移除（s01 的 effect）。

## 全仓库的 seam 一览

| seam | Definition | Providers | Consumer |
|---|---|---|---|
| LLM | `packages/llm/llm` | `llm-deepseek`、`llm-pi-ai` | （同 Definition 包） |
| Shell | `packages/shell/shell` | `bash-local`、`bash-sandbox`、`pwsh-*` | `tool-bash` |
| Filesystem | `packages/fs/` | local、bash-backed | file tools |
| Web | `packages/web/` | search/fetch | web tools |
| Subagent | `packages/subagent/subagent` | `spawn-in-process`、`fork-in-process`、`acp`、`codex`、`claude-code` | `tool-subagent` |
| Sandbox | `packages/sandbox/` | bwrap/Landlock/Seatbelt | argv 包裹 |

完整清单见官方 [capability-seams](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/capability-seams.md)。

## 一个能力 = 完整设计三角色

加一个新能力（不是「一个角色」）意味着设计全部三个：接口契约、至少一个实现、一个模型工具消费它。只做一个角色不叫 seam。s12 会带你把这三样完整走一遍。

## 自测

1. seam 的三个角色分别是什么？为什么「只做一个角色不是 seam」？
2. 为什么「换 provider = 改配置，不改 consumer」？它建立在 s03 的哪条机制上？
3. 「共享执行世界」是什么？它带来什么后果？
4. shell 例子里，Definition/Provider/Consumer 分别是哪三个包？
5. 「显式 > 隐式」在 `ShellExecRequest` vs `ShellExecSpec` 上怎么体现？


## 小作业

动手写，先不看 [examples/06-seam](../examples/06-seam/README.md) 和 [s05a](s05a-shell-seam-deep-read.md)。

1. **写一个最小 seam**：自写一个抽象 `Service` 当 Definition（占 `ctx.<key>`），写**两个** Provider 实现它（比如 `EchoProvider` 和 `ReverseProvider`），写一个 `inject` 该服务的 Consumer。**换 provider 只改 `cordis.yml` 一行，Consumer 不动**（Definition/Consumer 的结构可参考 [examples/06-seam](../examples/06-seam/README.md)）。
   **达标标准**：能默写三角色的职责，说清「为什么换 provider 不改 consumer」。
2. 说出 `resolve(request): Spec` 为什么是「显式 > 隐式」的落地。
   **达标标准**：能说清 request（可选字段）和 spec（必填字段）的区别。
---

**下一章**：[s06 · Agent Loop](s06-agent-loop.md) —— seam 是零件，loop 是把零件转起来的心脏。
