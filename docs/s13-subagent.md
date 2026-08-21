# s13 · Subagent（子代理）

> **一句话**：subagent 也是一个 seam——provider 注册表（`ctx.subagents`）+ 一个模型委派工具。委派出去一个独立 agent，隔离靠 s10 的 scope「不继承」，谱系靠 lineage 数据。

## 是什么

`packages/subagent/` 是 subagent 能力族，三角色齐全：

| 角色 | 包 |
|---|---|
| Definition | `subagent/subagent` —— 命名 provider 注册表、`SubagentStartRequest`/`Run`/`Result` 词汇 |
| Providers | `spawn-in-process`、`fork-in-process`、`acp`、`codex`、`claude-code`、`dsh-sdk` |
| Consumer | `tool-subagent`（暴露一个配置好的 provider 给模型） |

每个 provider 是「委派一个 agent」的不同方式：fresh 子进程（spawn）、同进程 fork、交给另一个产品（codex / claude-code / acp / dsh-sdk）。

## 为什么：隔离 + 可替换的委派

subagent 是「把大任务拆给独立上下文」的机制。两个关键点：

1. **隔离** —— 子 agent 拿不到父 agent 的 scope-local 注册（s10：作用域不继承）。这防止子 agent 继承父的 persona 或工具变体。
2. **谱系** —— 父子关系用 lineage 数据（`parentSession`、`delegationDepth`、`subagentDepth`）携带，**从不影响可见性**。

## 一个关键拆分：start-time vs runtime 能力

官方 [subsystems/subagent](../deepseek-harness/docs/subsystems/subagent.md) 强调 start-time-vs-runtime 的能力拆分。读 provider 实现时盯住：哪些能力在**启动时**给子 agent，哪些在**运行时**才提供——这个拆分决定委派的隔离边界。

## 读源码

- `packages/subagent/subagent/` —— 命名 provider 注册表、请求/结果词汇。
- `packages/subagent/spawn-in-process/` 或 `fork-in-process/` —— 一个真实 provider。
- `packages/subagent/tool-subagent/` —— Consumer（怎么包装成模型工具）。
- 完整契约见官方 [subsystems/subagent](../deepseek-harness/docs/subsystems/subagent.md)。

## 自测

1. subagent 的三角色分别是哪些包？
2. 「作用域不继承到子 agent」对 subagent 意味着什么？
3. lineage 数据（`delegationDepth`、`subagentDepth`）影响可见性吗？
4. 「start-time vs runtime 能力拆分」决定什么？
5. 委派有哪些 provider 方式？（至少说三个）

---

**下一章**：[s14 · Skill](s14-skill.md) —— 任务化指令，按需注入。
