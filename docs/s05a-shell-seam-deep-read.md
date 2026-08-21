# s05a · shell seam 源码精读

> 从 Definition 到 Provider 到 Consumer，逐文件追一遍 `packages/shell/` 这条 canonical seam。所有行号相对 `deepseek-harness` 根目录。

## 先记住：一个 seam = 三个包

```text
@deepseek-ai/dsh-shell        (packages/shell/shell/)      —— Definition：抽象类 ShellExecutor + ctx.shell + 类型词汇
@deepseek-ai/dsh-bash-local   (packages/shell/bash-local/) —— Provider：LocalBashExecutor，跑真实 bash
@deepseek-ai/dsh-tool-bash    (packages/shell/tool-bash/)  —— Consumer：把 shell 包成模型可调的 bash 工具
```

数据流方向：**模型 → tool-bash（Consumer）→ resolve() 成 spec → bash-local（Provider）→ subprocess（另一个 seam）→ 真实进程**。

---

## Role 1：Definition —— 只声明接口，不实现

### `shell/src/types.ts` —— 词汇类型

这是 seam 的「请求/结果」类型，一共四组（读的时候盯住 request vs spec 的区别）：

- **`ShellExecRequest`（第 38-79 行）** —— 调用方的**请求**：`command` 必填，其余（`workdir`、`timeoutMs`、`stdoutMaxBytes`、`signal`、`stdin`、`env`、`dshEnv`、`sandboxPolicy`）全部可选。注释原文：`workdir` 和 `timeoutMs` 由 `ShellExecutor.resolve` 从实现配置填上。
- **`ShellExecSpec`（第 86-110 行）** —— **解析后的规格**：`workdir`、`timeoutMs`、`stdoutMaxBytes` 全变必填，`sandboxPolicy` 显式存在。注释原文：`resolve` 填满并 cap 必填字段。
- **`ShellRunResult`（第 113-138 行）** —— 一次前台运行的结果：`exitCode` / `signal` / `timedOut` / `aborted` / `timeoutMs` / `stdout` / `stderr` / `sandbox?`。
- **`ShellProcess`（第 161-183 行）** —— 后台进程句柄：`status`、`exitCode`、`done`（永不 reject）、`readOutput()`（增量）、`kill()`。

**这就是「显式 > 隐式」的第一半**：request 是「用户想干嘛」（可选字段多），spec 是「完整该怎么干」（必填字段全），中间的 `resolve()` 是显式的默认化步骤。

### `shell/src/index.ts` —— 抽象服务

核心是 `ShellExecutor`（第 65-101 行）：

```ts
declare module '@deepseek-ai/cordis' {
  interface Context { shell: ShellExecutor }   // 声明合并：ctx.shell 类型
}

export abstract class ShellExecutor extends Service {
  constructor(ctx: Context) { super(ctx, 'shell') }   // 注册 ctx.shell
  abstract resolve(request: ShellExecRequest): ShellExecSpec
  abstract run(spec: ShellExecSpec): Promise<ShellRunResult>
  abstract start(spec: ShellExecSpec): ShellProcess
}
```

三个要点：

1. **`declare module`** —— 把 `ctx.shell` 加进 `Context` 接口（s03 的声明合并，纯编译时）。
2. **`super(ctx, 'shell')`** —— 运行时注册到 `ctx.shell`。JSDoc 写了关键语义：**一个 context 一个实现，加载第二个会 throw**（Cordis 的重复服务行为）。
3. **三个抽象方法就是 seam 的契约**：`resolve`（默认化）、`run`（前台）、`start`（后台）。JSDoc 还写了语义约束：`run` 只在**基础设施失败**时 reject，非零退出/超时/中止都 resolve 成结果。

---

## Role 2：Provider —— 实现接口，依赖另一个 seam

### `bash-local/src/index.ts` —— `LocalBashExecutor`

```ts
export class LocalBashExecutor extends ShellExecutor {
  static inject = ['subprocess']        // ← Provider 依赖 subprocess seam！
  static Config = z.object({ ... })     // 默认 timeoutMs 120_000 等
  constructor(ctx, config) { super(ctx); ... }
  resolve(request) { ... }              // 填 workdir、clamp timeoutMs
  private spawnSpec(spec, argv, ...)    // 把 shell spec 映射成 subprocess spec
  // ... run / start 通过 ctx.subprocess 真正派生进程
}
```

三个要点：

1. **`static inject = ['subprocess']`** —— 这是「**共享执行世界**」（s05）的根源：bash 执行不自己派生进程，而是通过 `ctx.subprocess` seam 派生。所以把 `ctx.subprocess` 指向远程沙箱，bash 跟着搬，Provider 不用 fork。
2. **`resolve()`（第 146-171 行）** —— 「显式 > 隐式」的第二半，在这里落地：
   - `timeoutMs` = `clampTimeout(request.timeoutMs, config.timeoutMs, config.maxTimeoutMs)` —— 请求值经过默认 + 上限 clamp；
   - `workdir` = `request.workdir ?? config.cwd ?? process.cwd()`；
   - `stdin` / `env` / `dshEnv` / `sandboxPolicy` **原样透传**（注释：这些没有 config 默认值）。
3. **`Config`** —— Provider 自己的可配置项（`cwd`、`timeoutMs`、`maxTimeoutMs`、`maxOutputBytes`、`graceMs`…）。注意：这些是**实现层**的默认值，不是 Definition 的——Definition 不知道任何实现细节。

---

## Role 3：Consumer —— inject 服务，包装成工具

### `tool-bash/src/index.ts`

```ts
export const name = 'tool-bash'
export const inject = ['tools', 'shell', 'systemPrompt', 'shellEnv']
```

`inject` 列了**四个**服务，各司其职：

- `tools` —— 注册工具（`ctx.tools.register`）；
- `shell` —— 消费能力（`ctx.shell.resolve/run`）；
- `systemPrompt` —— 给 prompt 贡献 `tool:bash` 分节（第 236-240 行）；
- `shellEnv` —— 采集 `DSH_*` 环境变量（`ctx.shellEnv.collect(exec)`，第 341 行）。

### `execute` 里最关键的一行（第 380-383 行）

```ts
const result = await ctx.shell.run(ctx.shell.resolve({
  ...request,
  signal: exec.signal,
}))
```

这是整条 seam 的**收束点**，把 s05 的「显式 > 隐式」走完：

1. Consumer 从模型参数 + 会话状态拼出一个**`ShellExecRequest`**（可选字段，第 342-348 行）；
2. `ctx.shell.resolve(request)` —— 交给 Provider 做默认化，得到**`ShellExecSpec`**（必填字段）；
3. `ctx.shell.run(spec)` —— 用完整 spec 执行。

**Consumer 永远不拿原始 request 直接调 `run`**——默认化是 owning 实现（Provider）的显式步骤，不是 Consumer 里藏着 `?? default`。

### 工具定义的三层（对应 s12）

- **`parameters`**（第 245-269 行）—— 给模型的 JSON Schema：`command`、`description`、`timeoutMs`、`workdir`、`run_in_background`、`sandbox_permissions` + `justification`（沙箱升级对，只有有沙箱时才暴露）。
- **`output.schema`**（第 271-322 行）—— 返回值契约：`oneOf` 后台 `{kind:'background', jobId}` 或前台 `{kind:'foreground', exitCode, signal, stdout, stderr, ...}`。**从模型视角**写的，不含 UI 词汇。
- **`presentCall` / `presentResult`**（第 102-136 行，391-392 行）—— UI 渲染意图：前台是 terminal 卡片，后台是 generic 卡片（s12 的 presentation 设计）。

---

## 一条数据流走完

```text
模型返回 tool/call { name:'bash', arguments:{ command:'ls' } }
  → defineTool 先校验 arguments
  → execute: 拼 ShellExecRequest { command:'ls', workdir?, timeoutMs?, dshEnv }
  → ctx.shell.resolve(request)   ── Provider 填默认值/clamp，得到 ShellExecSpec
  → ctx.shell.run(spec)          ── Provider 把 spec 映射成 SubprocessSpawnSpec
  → ctx.subprocess 派生真实 bash 进程，采集输出
  → 返回 ShellRunResult { exitCode, stdout:{text,truncated}, ... }
  → canonicalBashResult 归一化成 { kind:'foreground', ... }
  → output.render 生成文本块 → UI 按 presentResult 渲染 terminal 卡片
```

## 自测

1. `ShellExecRequest` 和 `ShellExecSpec` 的字段区别是什么？哪个字段从可选变必填？
2. `resolve()` 在哪定义（抽象）、在哪实现？为什么默认化必须在 owning 实现里？
3. Provider 的 `static inject = ['subprocess']` 体现了什么？（s05 的哪个推论）
4. Consumer 的 `inject` 列了四个服务，分别干嘛？
5. `ctx.shell.run(ctx.shell.resolve(request))` 这一行，为什么不能写成 `ctx.shell.run(request)`？
6. `output.schema` 的 `oneOf` 两分支分别是什么？为什么用 `kind` 判别标签（s07 的什么约定）？

---

**回到主线**：[s05 · Capability Seam](s05-capability-seam.md) | [example 06](../examples/06-seam/README.md) 动手跑三角色。
