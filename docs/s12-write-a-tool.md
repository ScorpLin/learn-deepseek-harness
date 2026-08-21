# s12 · 写一个工具（动手）

> **一句话**：从零写一个模型可调的工具，就是把 s05（seam）+ s08（管线）用起来：`defineTool` 定义、`output` 声明契约、`execute` 干活、`presentation` 决定怎么渲染给用户。

## 是什么：一个工具的完整形态

s08 给了最小版。这里补上「UI 渲染意图」这一层——**一个工具的 UI 渲染意图是它设计的一部分，一开始就定**（官方 cookbook 的原话）：

- **presentation 类型**：`generic` / `terminal` / `diff`，以及 `locations`（定位）。
- **presentation 方法**是 `args` 的纯函数。

`defineTool` 的典型完整结构：

```ts
ctx.tools.register(defineTool({
  name: 'read-file',
  description: 'Read a file.',
  parameters: {
    path: { type: 'string', required: true, description: 'Path to read' },
  },
  output: {
    schema: { type: 'string' },                      // 给模型的返回值契约
    render: (args, value) => [{ type: 'text', text: value }],  // 给用户的渲染
  },
  presentation: { kind: 'generic' },                 // UI 渲染意图
  async execute(args, ctx) {
    return await readFile(args.path, 'utf-8')
  },
}))
```

三个关注点分开：

- `output.schema` —— 模型看到的返回值契约（给模型）。
- `output.render` —— 生成 Native/durable 结果内容（给用户）。
- `presentation` —— UI 怎么展示（给 UI）。

## 为什么：模型视角 + 用户视角分离

harness 的铁律（packages/AGENTS.md）：**从模型的视角写模型契约**。prompt、工具 schema、结果、诊断只含任务相关概念，不含 UI/传输/实现词汇。所以 `schema` 是「模型的世界」，`render` 是「用户的世界」，`presentation` 是「UI 的世界」，三者刻意分开。

## 完整流程：一个调用的一生

```text
模型返回 tool/call(name, arguments)
  -> arguments 先被 schema 校验（defineTool 自动）
  -> tools/pre-execute  (权限/计划/沙箱门)
  -> tools/execute      (实际执行，可被超时/重试包裹)
  -> tools/post-execute (结果变换)
  -> tool/result        (不可变最终结果，UI 从这渲染)
```

## 怎么做：从 bash 工具抄起

最好的学习方式不是从零写，而是**读一个真实工具**。`packages/shell/tool-bash/`（`@deepseek-ai/dsh-tool-bash`）是教科书级例子：它 `inject: ['shell']`，把 shell 能力（s05 的 seam）包装成 `bash` 工具。

读它的顺序：

1. `parameters` —— bash 工具给模型暴露了什么参数。
2. `output.schema` / `output.render` —— 返回什么、怎么渲染。
3. `execute` —— 怎么把 `ToolExecution` 变成 `ShellExecRequest`，调 `ctx.shell`，把 `ShellRunResult` 变回 `ToolResult`。
4. `presentation` —— 用什么渲染意图（bash 输出是 terminal/diff 场景）。

## 权威参考

官方 [cookbook/adding-a-tool](../deepseek-harness/docs/cookbook/adding-a-tool.md) 是工具定义的 source of truth，包含：

- 完整 `defineTool` 字段；
- 执行策略与观察点的选择规则（`pre-execute` vs `execute` vs `post-execute` vs `result`，s08 已给速查）；
- presentation 类型与 `locations`；
- `run_in_background` 模式。

## 自测

1. `output.schema`、`output.render`、`presentation` 各面向谁？
2. 「UI 渲染意图是设计的一部分，一开始就定」意味着什么？
3. 为什么「从模型视角写模型契约」？
4. 工具的参数在 `execute` 前经历了什么？（校验）
5. 描述一个 `ToolExecution` 从模型返回到你看到 `tool/result` 的完整路径。

---

**下一章**：[s13 · Subagent](s13-subagent.md) —— 委派出去一个独立 agent。
