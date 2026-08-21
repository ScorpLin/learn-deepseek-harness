# s07 · Session Log（会话日志）

> **一句话**：session log 是 append-only 的 `SessionEvent` 流，是模型上下文的**唯一来源**。铁律：**模型可见 ⟺ 已记录**。

## 是什么

一个 session 就是一条 append-only 的事件日志。`packages/core/session` 拥有：

- `SessionEvent` —— 日志里的一条持久事实，带 `type` 判别标签（`user/message`、`assistant/message`、`assistant/chunk`、`tool/call`、`tool/result`、`step/start`、`turn/start`…）。
- `SessionEventMap` —— 完整变体目录（一个 `...Map → derived-union` 类型模式）。
- `deriveMessages()` —— 从 log 投影出模型历史。
- `ctx.sessions` —— 内存 store + `fork()`。

## 为什么：一条流，所有派生

log 是「模型看到的上下文」的 source of truth：

- `deriveMessages()` 从 log 投影出模型历史；
- 原始 `assistant/chunk` 事件保留 token 流，保证回放和 UI 保真度；
- fork、resume、transcript、telemetry、persistence **全部从这条流派生**。

没有「第二份真相」。这就是为什么：

> **任何到达模型请求的东西，都必须能从 log 重建**——一个运行时不变量在断言它。

## 一个直接后果：加模型可见输入 = 加 session 事件

因为「模型可见 ⟺ 已记录」，所以**任何新的模型可见输入都要求新增一个 session event**：扩展 `SessionEventMap`，并从 log 渲染它。不能「绕过 log 直接把东西塞给模型」——那样模型看到了，但 log 重建不出来，违反了铁律。

这也解释了为什么一个 `SessionEventMap` 成员「默认读时必需」：读到不认识的事件类型时，构建默认**拒绝读整条 log**（宁可失败，也不静默丢数据）。如果某个事件允许「读不懂就安全跳过」，可以在它的**外层包装字段（信封）**上标 `ignorable: true`（机制见官方 [architecture](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/architecture.md#session-log)）。

## 两个关键事件族

- **`assistant/chunk`** —— 原始流块，保真（UI 逐 token 渲染靠它）。
- **`assistant/message`** —— 聚合后的完整消息（模型历史用它）。

两者并存，各司其职：chunk 保真回放，message 供 `deriveMessages` 高效投影。

## 怎么做：看一个 session 长什么样

一个 headless 会话的 log 大致是：

```text
session/start
turn/start
step/start
user/message          "写个 hello"
assistant/chunk*       (token 流)
assistant/message      "好的，我来写"
tool/call             write_file(...)
tool/result           (...)
assistant/chunk*
assistant/message      "写好了"
step/end
turn/end
```

每个 `assistant/chunk` 都是持久事件——重放时逐 token 还原。

## 读源码

- `packages/core/session/` —— `SessionEventMap`（变体目录）、`deriveMessages()`（投影）、执行 enclosure、standalone 事件。
- 完整变体清单见官方 [subsystems/session](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/subsystems/session.md)。

## 自测

1. 为什么说 log 是「模型上下文的唯一来源」？
2. 「模型可见 ⟺ 已记录」这条铁律，给「加一个新输入」带来了什么强制要求？
3. `assistant/chunk` 和 `assistant/message` 各司什么职？
4. `deriveMessages()` 从什么投影出什么？
5. 哪些产品能力从这条流派生？（至少说出三个）


## 小作业

1. **举一个「模型可见但没记录」的反例**，走一遍它为什么违反铁律（模型看到了，但 `deriveMessages()` 从 log 重建不出来）。
   **达标标准**：能一句话说出「模型可见 ⟺ 已记录」及它的直接推论（加输入 = 加 session event）。
2. 说清 `assistant/chunk` 和 `assistant/message` 的分工。
   **达标标准**：能说清「chunk 保真回放、message 供投影」。
---

**源码精读**：[s07a · session-log 源码精读](s07a-session-log-deep-read.md) —— 逐文件追一遍 log 的真实实现。

**下一章**：[s08 · Tools](s08-tools.md) —— 模型的「手」，以及它背后那条有守卫的执行管线。
