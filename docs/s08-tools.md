# s08 · Tools（工具）

> **一句话**：工具是模型的「手」，注册在 `ctx.tools`，schema 自动进提示词；每次调用走一条有守卫的管线 `pre-execute → execute → post-execute → result`。

## 是什么

一个工具 = 一份 `ToolDefinition`：

- `name`、`description` —— 给模型看；
- `parameters` —— 转成 JSON Schema，注入提示词；
- `output` —— 返回值的契约（`schema` + `render`）；
- `execute` —— 真正干活。

harness 提供 `defineTool` 类型化助手来写第一方工具（s12 完整走一遍）。原始 JSON-Schema `ToolDefinition` 也直接接受——MCP 来源的工具就是这么进 `ctx.tools.register()` 的。

## 为什么：注册即接入，管线统一守卫

注册一个工具，它的 schema 自动流入提示词组装（s09），不需要额外接线。而所有调用走同一条管线，让策略（权限、超时、指标、日志）能挂在一个点上，而不是散落在每个工具里。

## 执行管线：四个点

```text
tool/call
  -> tools/pre-execute    (waterfall: 允许/拒绝/ask 的决策门)
  -> tools/execute        (waterfall: 包裹实际派发，如超时/重试/指标)
  -> tools/post-execute   (waterfall: 显式结果变换)
  -> tool/result          (emit: 观察不可变的最终结果)
```

选对点（官方 `deepseek-harness/docs/cookbook/adding-a-tool.md` 给了选择规则）：

- **`tools/pre-execute`** —— 权限门、计划模式、沙箱策略在这里 deny/ask。返回 `deny` 就是拒绝调用。
- **`tools/execute`** —— 需要包裹**实际派发生命周期**（超时/重试/指标）时用；只有 `exec.signal` 可替换。
- **`tools/post-execute`** —— 要**变换结果或附加上下文**时用。
- **`tools/result`** —— 只**观察**不可变最终结果（审计/日志/指标），不变换。

区分 `post-execute`（变换）和 `result`（只观察）很关键：用错了会得到不该有的行为。

## 一个易踩的点：waterfall 纪律回到这里

`tools/pre-execute` 是 waterfall（s02）。**只观察/打日志的监听器也必须 `next()`**，否则会静默吞掉所有下游——在这里等于「所有工具都卡住不执行」。

## 怎么做：看 tutorial 第七章

一个最小工具（无 API key，不调模型）：

```ts
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { CallId } from '@deepseek-ai/dsh-llm'

export const name = 'greet-tool'
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'greet',
    description: 'Greet the named person.',
    parameters: { name: { type: 'string', required: true, description: 'Who to greet' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args) { return 'Hello, ' + args.name + '!' },
  }))

  void (async () => {
    const result = await ctx.tools.execute({
      callId: CallId('demo-1'), name: 'greet',
      arguments: { name: 'Cordis' }, signal: new AbortController().signal,
    })
    console.log('tool replied:', JSON.stringify(result.content))
  })()
}
```

注意每个模式都是前几章的：`inject: ['tools']`（s03）、`ctx.tools.register` 的 disposer 自动挂到插件（s01）、`CallId` 是 branded id（见 data-structures.md）。

## 读源码

- `packages/core/tools/` —— `ToolDefinition` 全字段、schema DSL、`ToolExecution`/`ToolResult`、有守卫的执行管线。
- 任意 `packages/tool/*`（如 `dsh-tool-bash`）—— 第一方工具的写实例。
- 完整字段见官方 `deepseek-harness/docs/subsystems/tools.md`。

## 自测

1. 一个 `ToolDefinition` 的四个关键部分是什么？
2. 执行管线四个点各在什么场景用？`post-execute` 和 `result` 的区别？
3. 权限门该挂在哪个点？为什么？
4. 为什么「注册工具，schema 自动进提示词」是「注册即接入」的体现？
5. `CallId` 为什么是 branded id，不是裸 string？


## 小作业

动手写，先不看 [examples/05-tool](../examples/05-tool/README.md)。

1. **写一个 `defineTool` 工具**，手动 `ctx.tools.execute()` 跑一遍（代替模型）。
   **达标标准**：能默写 `parameters / output.schema / output.render / execute` 四段。
2. **加一个 `tools/pre-execute` 监听器返回 `{ kind: 'deny' }`**，看调用如何被拒。
   **达标标准**：能默写管线四点的顺序和各自场景（pre-execute 权限门 / execute 包裹 / post-execute 变换 / result 只观察）。
---

**源码精读**：[s08a · tools 管线源码精读](s08a-tools-deep-read.md) —— 逐文件追一遍工具执行管线。

**下一章**：[s09 · Prompt Assembly](s09-prompt-assembly.md) —— 模型的「嘴」，怎么从稳定规则 + 运行时状态拼出输入。
