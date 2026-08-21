# s06 · Agent Loop（agent 循环）

> **一句话**：一个 **step** = 一次模型请求 + 它调用的工具；一个 **turn** = 零到多个 step。loop 就是「读 log → 组装 → 问模型 → 跑工具 → 写回 log → 再问」的循环，而 **loop 本身也是一个插件**。

## 是什么

先厘清三个时间单位（官方 glossary 的唯一定义，别混）：

- **turn（回合）**：一次「排空已接纳输入」的循环，模型和工具都停下后结束。
- **step（步）**：一次模型请求 + 它引发的工具执行；一个 turn 含零或多步。
- **round（轮）**：外层策略的一次迭代（如 goal round、Ralph round），**不是**每个 turn 都计数。

## 一个 turn 的完整时序

来自官方 [architecture](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/architecture.md#turn-flow)，这里是教学版：

```text
turn/start
  claim 下一个 step 的输入 + 一条排队消息
  组装 prompt 分节 + tool schemas
  -> agent/pre-step                    reject | enter(messages)
     reject，或首个 enter 被改写为空 -> 关闭 turn（不花任何 step）
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

三种事件域（s00 已给地图）：

- **持久 session 事件**：`turn/*`、`step/*`、`user/message`、`assistant/*`、`tool/*`——写进 log，可重放。
- **活扩展点**：`agent/pre-step`、`agent/request`、`llm/stream`、三个 `tools/*` 事件——waterfall（s02），监听器必须 `next()`。
- `agent/turn-stopping` 是 serial，无 `next()`。

## 为什么：loop 是插件，所以可替换

loop 本身是一个插件（`ctx.agentLoop`），实现 `Agent` 接口（`ctx.agents`）。这意味着：

- **没有特权核心**——loop 和其它插件一样，能从配置替换。
- **扩展点而非改 loop**——新行为挂在 `agent/*` 事件上，不改 loop 本身。这就是 s00 那张「新行为放哪」表的由来。

## 输入从哪来：一个 inbox

输入通过**一个 inbox** 到达驱动。有些消息立刻唤醒它；注入的上下文在 inbox 里等，直到另一条消息来。`agent/pre-step` 决定模型看到什么——监听器可以改写 claimed 消息，或直接 reject；一个被 reject 或改写为空的首个 claim 仍然关闭一个持久 turn（花零个 step），所以 log 记录了这次尝试。

每个 step 读插件注册的 prompt 分节和 tool schemas（s09、s08）。

## 读源码

- `packages/core/agent/` —— `Agent` 接口、活跃注册表、`agent/*` 事件（接口契约）。
- `packages/core/agent-loop/` —— 默认驱动，实现那个接口（驱动时序）。

读的时候对照上面的时序图，找每一行对应的代码点：`agent/pre-step` 在哪派发、`llm/stream` 在哪发起、`tools/*` 在哪串起来。

## 自测

1. turn / step / round 的区别？为什么 round 不属于「每个 turn 都计数」？
2. 一个 turn 从什么事件开始、什么事件结束？
3. 哪些是持久 session 事件、哪些是活扩展点？它们的区别是什么？
4. 为什么说「loop 是插件，所以可替换」？这和 s01 的什么思想一致？
5. 一个被 reject 的首个 claim，log 里会记录什么？为什么？


## 小作业

**不看文档**，做这个：

1. **手绘 turn flow 时序图**：从 `turn/start` 到 `turn/end`，写出 `agent/pre-step → step/start → agent/request → llm/stream → assistant/chunk → tool/call → tools/* → step/end` 的完整次序。
   **达标标准**：画对次序，并标出哪些是**持久 session 事件**、哪些是 **waterfall 活扩展点**。
2. 用一句话区分 turn / step / round。
   **达标标准**：能说清 round 为什么「不属于每个 turn 都计数」。
---

**下一章**：[s07 · Session Log](s07-session-log.md) —— loop 写的这个 log，为什么是「模型上下文的唯一来源」。
