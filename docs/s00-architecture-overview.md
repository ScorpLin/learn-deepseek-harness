# s00 · Architecture Overview（架构总览）

> **一句话**：一个运行中的 `dsh` 是一棵插件树，由一层层 bundle + patch 叠出来；树的「脊柱」是七个核心服务，树的「心脏」是 agent loop 与 session log。

这一页给你全系统地图，后面的每一章都是这张图上的一小块。**先建立地图，再钻细节**。权威版本见 [deepseek-harness/docs/architecture.md](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/architecture.md)。

## 第一层：一切皆插件

`dsh` 构建在 Cordis 上（s01 会讲）。模型适配器、工具注册表、会话日志、agent loop 本身，**全都是插件**。没有特权核心可以打补丁——扩展它就是挂一个新插件。

## 第二层：profiles 与 bundles（怎么组装成一棵树）

一个运行中的 `dsh` = 启动时从「有序的层」组装出的插件树。

- **profile（配置档）**：一个命名组合，列它叠加的 bundle、装的插件、用户的 `cordis.patch.yml`。`web` 和 `headless` 是自带模板。
- **bundle（包）**：Cordis 配置行 + 挂载代码的分发格式，让上层还能 patch 它插入的东西。

层按这个顺序套到空条目列表上：

```
profile 里的每个 bundle（按列出的顺序）
→ profile 的 cordis.patch.yml
→ home 级别的 cordis.patch.yml
→ 任何 --patch 覆盖
```

**看你的机器实际 boot 出什么树**：

```sh
dsh --profile web --dump-config
```

它打印的每一行，你都能用自己的一份 patch 替换掉。

## 第三层：七个核心服务（脊柱）

| Package | 拥有什么 | `ctx` key |
|---|---|---|
| `core/session` | append-only 的 `SessionEvent` 日志 + 内存 store | `ctx.sessions` |
| `core/system-prompt` | 提示词分节 + tool schema 组装 | `ctx.systemPrompt` |
| `core/tools` | 有作用域的工具注册表 + 有守卫的执行管线 | `ctx.tools` |
| `core/agent` | `Agent` 接口、活跃注册表、`agent/*` 事件 | `ctx.agents` |
| `core/agent-loop` | 默认驱动，实现 Agent 接口 | `ctx.agentLoop` |
| `core/scope` | 每 agent 的作用域注册原语 | 库，无 key |
| `llm/llm` | 消息/流词汇 + 适配器 seam | `ctx.llm` |

## 第四层：事件（扩展点）

事件是扩展点，选对「域」是大多数改动的第一步：

- **Session events**（`session/event`）—— 追加进日志的持久事实，需跨 reload 存活时用它。
- **Agent events**（`agent/*`）—— 携带活 `Agent`：inbox、step、status、request、validation、continuation。观察/拦截进行中的工作时用它。
- **Capability events**（`fs/*`、`tools/*`、`telemetry/*`）—— 给 seam 挂策略和适配器，不 import loop。

## 第五层：turn flow（心脏的一跳）

一个 **step** = 一次模型请求 + 它调用的工具。一个 **turn** = 零到多个 step。

```text
turn/start
  claim 下一个 step 的输入 + 一条排队消息
  组装 prompt 分节 + tool schemas
  -> agent/pre-step                    reject | enter(messages)
     step/start
     append 进来的消息为 user/message
     从 log 派生模型历史
     agent/request -> llm/stream -> assistant/chunk* -> assistant/message
     tool/call* -> tools/pre-execute -> tools/execute -> tools/post-execute -> tool/result*
     step/end
     tools 欠另一次请求，或来了 next-step 输入 -> claim -> 下一个 step
  -> agent/turn-stopping
turn/end
```

`turn/*`、`step/*`、`user/message`、`assistant/*`、`tool/*` 是持久 session 事件；其余是跨三个域的活扩展点。`agent/pre-step`、`agent/request`、`llm/stream` 和三个 `tools/*` 事件是 waterfall（s02 讲），监听器必须调 `next()` 才能委托。

## 第六层：session log（模型的上下文来源）

**模型可见 ⟺ 已记录。** 任何到达模型请求的东西都必须能从 log 重建，且有一个运行时不变量在断言它。这就是为什么新加一个模型可见输入，必须新增一个 session event。

`deriveMessages()` 从 log 投影出模型历史；原始 `assistant/chunk` 事件保留回放和 UI 保真度。fork、resume、transcript、telemetry、persistence 全从这条流派生。

## 第七层：capability seam（可替换能力）

一个 **seam** = 三个角色：**Service Definition**（声明接口 + 占有 `ctx.<key>`）、**Service Provider**（实现）、**Consumer**（使用，通常是模型工具）。s05 专门讲。

seam 是「换个 provider 就换掉整个产品」的原因。文件系统与 subprocess 的 provider 共享同一执行世界，指向远程沙箱时 Bash、PTY、LSP 一起搬走，无需 fork provider。

## 第八层：新行为放哪（一张速查表）

| 目标 | 机制 |
|---|---|
| 加模型 provider | 在 `ctx.llm` 注册 adapter |
| 加模型能力 | 在 `ctx.tools` 注册，schema 自动进组装 |
| 加 shell 执行 | 在 `ctx.shell` 注册后端 |
| 加文件系统访问/策略 | 注册 `ctx.fs` provider 或监听 `fs/*` |
| 拦截请求/工具/turn | 用 `agent/*` 或 `tools/*` 事件 |
| 加模型上下文 | `agent.inject()` |
| 加持久会话状态 | 扩展 `SessionEventMap`，从 log 渲染回放 |
| 给单会话换能力集 | 组合 agent preset |
| fork 会话 | `ctx.sessions.fork(...)` |
| 把注册作用域到一个 agent | 用该 agent 的 `agent.ctx` |

## 现在你有了地图

后面 19 章，每章就是这张图的一块。读完这页，**先记牢第四、五、六层**（事件 / turn flow / session log），它们是 harness 的「神经、心跳、记忆」。

**下一步**：[s00d · 章节顺序理由](s00d-chapter-order-rationale.md) → [s00f · 代码阅读顺序](s00f-code-reading-order.md) → 进入 s01。
