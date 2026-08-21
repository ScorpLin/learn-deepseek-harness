# s14 · Skill（技能）

> **一句话**：skill 是一套任务化指令，目录加载、会话前缀 catalog、模型按需通过 `skill` 工具加载。加载时内容 `inject()` 进上下文，而不是常驻。

## 是什么

`packages/skill/` 是 skill 能力族：

- **provider 注册表** —— 发现 skill 的服务；
- **local provider** —— 从本地目录加载；
- **catalog/loader 工具** —— 模型可调的 `skill` 工具，列出/加载技能。

一个 skill 是「一套可复用的任务化指令」，比如「怎么在这个仓库写文档」。模型需要时通过 `skill` 工具加载，**内容 `inject()` 进上下文**（s06 的 `agent.inject()`）。

## 为什么：按需加载，不常驻

skill 解决「通用能力太多，全塞进 prompt 会爆」的问题。所以它是**渐进披露**（progressive disclosure）：目录先给模型一个**摘要**（`SkillSummary`），模型判断需要哪个，再加载**完整定义**（`SkillDefinition`）。

## 与 s12「渐进披露」工具的关系

s05/s08 里提过 tool 的渐进披露（替换 scoped `ctx.tools.restrict()` 注册来改变可见集）。skill 是同一思想在「指令」上的应用：目录在会话前缀，完整内容按需注入。

## 读源码

- `packages/skill/` —— provider 注册表、local 实现、catalog/loader 工具。
- 完整定义见官方 [subsystems/skills](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/subsystems/skills.md)。

## 自测

1. skill 和「常驻 prompt 分节」的区别？
2. `SkillSummary` 和 `SkillDefinition` 分别是什么阶段的东西？
3. skill 内容是怎么进上下文的？（哪个 API）
4. 「渐进披露」在 skill 上怎么体现？
5. skill 的三角色分别是？（Definition 是 provider 注册表，Provider 是 local，Consumer 是 catalog/loader 工具）

---

**阶段三完成。** 你已经把机制用起来了：scope（s10）、adapter（s11）、写工具（s12）、subagent（s13）、skill（s14）。**停下来自己重建**：从零写一个带 `presentation` 的最小工具，跑通管线。

**下一阶段**：[s15 · Workflow](s15-workflow.md) 开始——把单 agent 内核长成平台：多 agent 编排、权限、goal/plan、沙箱、扩展。
