# Glossary

教学用术语表。每个概念给出「一句话定义 + 它属于哪个阶段」，读到陌生词时回这里查。完整的官方术语见 [deepseek-harness/docs/glossary.md](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/glossary.md)。

## 地基（Cordis）

- **Cordis** — 承载 DeepSeek Harness 的插件框架，vendored 在 `vendor/`。核心信仰：一切皆插件。
- **plugin（插件）** — 一个函数 / 带 `apply` 的对象 / `Service` 子类，通过 `apply(ctx)` 声明自己贡献了什么。
- **context（上下文）** — 一个「服务仓库」，用稳定的 `ctx.<key>`（如 `ctx.tools`）取服务，而不是 import 具体实现。
- **service（服务）** — 一个命名能力，由某个插件提供、别的插件通过 `ctx` 消费。例：`ctx.tools`、`ctx.llm`、`ctx.agents`。
- **inject（依赖声明）** — 插件声明「我需要这些服务」，加载顺序由依赖推导，不由 `cordis.yml` 的文件顺序决定。
- **event（事件）** — 插件间广播「发生了什么」的通道，用 `emit` / `parallel` / `serial` / `waterfall` 分发。
- **effect（副作用）** — 可撤销的注册。所有注册都走 `ctx.effect()` / `ctx.on()`，插件卸载时自动撤销。
- **fiber（纤维）** — 一个已加载插件实例的运行时句柄，走状态机 `PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED`（+ `FAILED`）。
- **waterfall（瀑布）** — around-middleware 事件模式：监听器收到 `(...args, next)`，调 `next()` 委托、不调则短路（veto）。
- **declaration merging（声明合并）** — TypeScript 的 `declare module` 把新 `ctx` 属性 / 事件名并进已有接口，只给编译器看，不生成运行时代码。

## 系统主干

- **seam（能力接缝）** — 一个可替换能力，由三个角色组成：**Service Definition**（声明接口 + 占有 `ctx.<key>`）、**Service Provider**（实现）、**Consumer**（使用，通常是模型工具）。
- **profile（配置档）** — 一个命名组合，列它叠加的 bundle、装的插件、用户的 `cordis.patch.yml`。
- **bundle（包）** — Cordis 配置行 + 挂载代码的分发格式。
- **turn（回合）** — 一次「排空已接纳输入」的循环，模型和工具都停下后结束。
- **step（步）** — 一次模型请求 + 它引发的工具执行；一个 turn 含零或多步。
- **round（轮）** — 外层策略的一次迭代（如 goal round、Ralph round），不属于每个 turn 都计数。
- **session log（会话日志）** — append-only 的 `SessionEvent` 流，是模型上下文的唯一来源。铁律：**模型可见 ⟺ 已记录**。
- **scope（作用域）** — 每个 agent 的独立注册空间；作用域注册不继承到子 agent。
- **shadowing（影子覆盖）** — most-specific-wins：作用域内同名工具/分节/变量替换全局同名者。

## 能力与平台

- **capability（能力）** — 模型能调用的、由 seam 提供的一类功能（shell、fs、web、subagent…）。
- **tool（工具）** — 模型的「手」，注册在 `ctx.tools`，schema 自动进提示词。
- **subagent（子代理）** — 委派出去的独立 agent，provider 注册表 + 模型委派工具。
- **skill（技能）** — 一套任务化指令，目录加载、按需 `inject()`。
- **workflow（工作流）** — 多 agent 编排，worker 线程引擎 + 结构化子进程。
- **goal（目标）** — 一个持久化的完成目标，带 `active/paused/blocked/complete` 阶段和轮数上限。
- **plan mode（计划模式）** — 登录态的计划协作，`/plan` 进入、`exit_plan_mode` 经用户复核退出。
