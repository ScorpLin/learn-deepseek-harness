# s14 · Skill（技能）

> **一句话**：skill 是一套任务化指令，目录加载、会话前缀 catalog、模型按需通过 `skill` 工具加载。加载时内容 `inject()` 进上下文，而不是常驻。

## 是什么

`packages/skill/` 是 skill 能力族：

- **provider 注册表** —— 发现 skill 的服务；
- **local provider** —— 从本地目录加载；
- **catalog/loader 工具** —— 模型可调的 `skill` 工具，列出/加载技能。

一个 skill 是「一套可复用的任务化指令」，比如「怎么在这个仓库写文档」。模型需要时通过 `skill` 工具加载，**内容 `inject()` 进上下文**（s06 的 `agent.inject()`）。

两个阶段的结构（也是渐进披露的两层）：

```ts
// SkillSummary —— 目录摘要：模型先看到这层，判断要不要加载
{ name: 'write-docs', description: '按仓库规范写文档' }

// SkillDefinition —— 完整定义：模型确认需要后才加载的正文
{ summary: { name: 'write-docs', description: '按仓库规范写文档' }, content: '…完整指令正文…' }
```

## 为什么：按需加载，不常驻

skill 解决「通用能力太多，全塞进 prompt 会爆」的问题。所以它是**渐进披露**（progressive disclosure）：目录先给模型一个**摘要**（`SkillSummary`），模型判断需要哪个，再加载**完整定义**（`SkillDefinition`）。

## 渐进披露（首次引入）

**渐进披露（progressive disclosure）是这里首次引入的概念**：先给模型一个**目录摘要**（只列每个 skill 的名字和简介），模型判断需要哪个后，再按需加载**完整定义**。skill 把这一思想用在「指令」上：目录放会话前缀，完整内容按需 `inject()`。

## 读源码

- `packages/skill/` —— provider 注册表、local 实现、catalog/loader 工具。
- 完整定义见官方 `deepseek-harness/docs/subsystems/skills.md`。

## 自测

1. skill 和「常驻 prompt 分节」的区别？
2. `SkillSummary` 和 `SkillDefinition` 分别是什么阶段的东西？
3. skill 内容是怎么进上下文的？（哪个 API）
4. 「渐进披露」在 skill 上怎么体现？
5. skill 的三角色分别是？（Definition 是 provider 注册表，Provider 是 local，Consumer 是 catalog/loader 工具）


## 小作业

1. **设计一个 skill 目录结构**，写出 `SkillSummary`（目录摘要）和 `SkillDefinition`（完整定义）的区别。
   **达标标准**：能说清「渐进披露」——目录在会话前缀、内容按需 `inject()`。
---

**阶段三完成。** 你已经把机制用起来了：scope（s10）、adapter（s11）、写工具（s12）、subagent（s13）、skill（s14）。**停下来自己重建**：从零写一个带 `presentation` 的最小工具，跑通管线。

**下一阶段**：[s15 · Workflow](s15-workflow.md) 开始——把单 agent 内核长成平台：多 agent 编排、权限、goal/plan、沙箱、扩展。
