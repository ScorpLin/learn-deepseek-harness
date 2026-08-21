# s09 · Prompt Assembly（提示词组装）

> **一句话**：每个 step 的模型输入，由「稳定规则分节 + 工具 schema」在 `ctx.systemPrompt` 上协作组装。插件用 `ctx.systemPrompt.section()` 贡献一段，schema 从工具注册自动流入。

## 是什么

`ctx.systemPrompt` 负责把模型输入拼起来，两个来源：

1. **分节（section）** —— 插件贡献的稳定规则段（如 system prompt、workspace 指令、plan 策略）。
2. **工具 schema** —— 从 `ctx.tools` 注册的工具自动流入（s08 的「注册即接入」）。

插件贡献一段：

```ts
ctx.systemPrompt.section(() => ({
  id: 'my-section',
  title: 'My Rules',
  content: 'Always do X before Y.',
  order: 10,          // 决定排序
}))
```

分节支持排序，也支持**作用域内影子覆盖**（s10 的 shadowing 机制会再遇到）。

## 为什么：稳定规则 + 运行时状态

把「稳定的规则」和「运行时状态」分开组装，而不是把整个 prompt 写死在一个文件里：

- 稳定规则（如 AGENTS.md）由 section provider 读入；
- 运行时状态（如时间、上下文、工具可见集）在组装时注入。

这让 prompt 可配置、可扩展——新插件加一段 section 就行，不改核心。

## 一个专家级扩展点：`system-prompt/assemble`

`system-prompt/assemble` 是**协作式整体组装变换**——它的返回值是权威的，所以监听器作者要自己负责保留 Code Mode 和结构化输出协议的贡献。这里两个词首次出现，先定义：**Code Mode** = 让模型进入代码生成模式的那部分提示词；**结构化输出协议** = 让模型按 JSON schema 输出的约束。这是「专家级」扩展点，普通分节用 `section()` 就够了。

## 为什么「工具可见集」要和执行对齐

工具过滤要用 `ctx.tools.restrict()`，而不是在 prompt 里手改 schema——这样**展示、查找、执行**三处保持一致。一个被过滤掉的工具，在 prompt 里不可见，且拒绝执行，和「不存在」不可区分（s10 的 restriction 语义）。

## 读源码

- `packages/core/system-prompt/` —— 分节注册、排序、协作组装。
- 完整契约见官方 [subsystems/system-prompt](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/subsystems/system-prompt.md)。

## 自测

1. 模型输入的拼装有两个来源，分别是什么？
2. 插件怎么贡献一段 prompt？`order` 干什么？
3. `system-prompt/assemble` 为什么是「专家级」扩展点？
4. 为什么过滤工具要用 `ctx.tools.restrict()` 而不是手改 schema？
5. 「稳定规则」和「运行时状态」为什么要分开组装？


## 小作业

1. **读 `packages/core/system-prompt` 源码**，说清 `order` 如何决定分节的排序（升序？降序？同 `order` 时谁先谁后）。
   **达标标准**：能说清 `order` 的排序规则，并默写 section 的 `id / title / content / order` 四字段。
2. 说清为什么过滤工具要用 `ctx.tools.restrict()` 而不是手改 prompt schema。
   **达标标准**：能说清「展示、查找、执行」三处对齐。
---

**阶段二完成。** 你已经吃透 harness 的「主干」：seam（s05）、loop（s06）、log（s07）、tools（s08）、prompt（s09）。**停下来自己重建**：能画一张 turn flow 时序图，说清「模型可见⟺已记录」，讲清一个 seam 的三角色。

**下一阶段**：[s10 · Scope](s10-scope.md) 开始——把机制用起来：每 agent 的注册空间、LLM adapter、写一个真工具、subagent、skill。
