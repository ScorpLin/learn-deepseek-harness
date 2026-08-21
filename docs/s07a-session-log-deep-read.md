# s07a · session-log 源码精读

> 从 `packages/core/session/` 追一遍「模型上下文的唯一来源」。行号相对 `deepseek-harness` 根目录。这是 s07（Session Log）的源码版。

## 两个文件分工

```text
packages/core/session/src/types.ts    —— SessionEventMap：事件变体目录（append-only 日志的一条）
packages/core/session/src/index.ts    —— Session：append() + deriveMessages()
packages/core/session/src/surface.ts  —— deriveEventMessage：纯的「单节点投影规则」
```

## 核心一：SessionEventMap —— 日志里有什么（types.ts 第 240-300 行）

```ts
interface SessionEventMap {
  'turn/start': { turn: number }
  'user/message': UserMessage
  'assistant/chunk': { turn: number; step: number; chunk: StreamChunk }   // 原始 token 块
  'assistant/message': { turn: number; step: number; message: AssistantMessage; usage?: TokenUsage; interrupted?: true }
  'tool/call': { turn: number; step: number; callId: CallId; name: string; arguments: string }
  'tool/result': { ... }
  // ... 更多（step/start、step/end、turn/end 等）
}
```

这是「一个 `...Map → derived-union`」模式（s07 提过）：`SessionEventMap` 是一个可合并扩展（merge-extensible）的类型，`SessionEvent` 由它派生出判别联合。**每个模型可见事实，都必须是这里的一个键**——这就是「加输入 = 加 event」的类型层落地。

盯住两个关键变体：

- **`assistant/chunk`** —— 原始流块，`chunk: StreamChunk`（`text-delta` / `tool-call` / `finish` 等）。逐 token 落日志，保证回放和 UI 保真。
- **`assistant/message`** —— 聚合后的完整消息，`message: AssistantMessage`。供 `deriveMessages` 高效投影。

两者并存：chunk 保真回放，message 供投影（s07 的分工）。

## 核心二：deriveMessages() —— 从 log 投影模型历史（index.ts 第 726-747 行）

```ts
deriveMessages(): Message[] {
  const surface = this.surface
  const nodes = surface.nodes                    // 预计算好的「消息产生点」序号列表
  const generation = surface.replaceGeneration
  if (generation !== this.derivedGeneration) {   // 缓存失效则重建
    this.derived = []
    this.derivedNodes = 0
    this.derivedGeneration = generation
  }
  for (const seq of nodes.slice(this.derivedNodes)) {   // 增量：只投影新增节点
    const msg = this.deriveEventMessage(this.log[seq]!) // 逐节点投影
    if (msg) this.derived.push(msg)
  }
  this.derivedNodes = nodes.length
  return [...this.derived]                       // 返回新数组（深冻结的共享 Message）
}
```

三个要点：

1. **增量投影**（第 735 行）：`surface.nodes` 是预计算的「消息产生点」序号，每次只投影 `slice(this.derivedNodes)` 之后的新节点——不是每次全量重扫 log。
2. **缓存 + 深冻结**（第 730-733、746 行）：`derived` 是缓存，返回的是「新数组 + 共享的深冻结 Message」。所以消费者改不动 log（s07 的「没有第二份真相」）。
3. **投影规则是纯函数**（`deriveEventMessage`，在 surface.ts）：一个节点要么投影成一个 Message，要么 `null`（如只有 usage 的空 assistant/message 不进 transcript）。

这就是「**模型可见 ⟺ 已记录**」的机制实现：模型历史不是存别处的数组，而是**从 log 逐节点投影**。任何一个「模型看到了、但 log 重建不出来」的东西，都会在这里断裂。

## 核心三：surface.ts —— 单节点投影规则（第 74 行）

```text
THE per-node projection rule: Session.deriveMessages folds it over the log
```

`surface.nodes` 只收录「五种消息产生类型」的序号，`deriveEventMessage` 是纯函数：输入一个 `SessionEvent`，输出 `Message | null`。这一层把「投影」从「存储」里拆出来，所以：

- 回放（replay）用同一个纯函数重放 log；
- fork/resume/transcript 都从这条流派生。

## 一条数据流走完

```text
loop 里 this.session.append('user/message', ...)      // 写日志
loop 里 this.session.append('assistant/chunk', ...)   // 逐 token 写日志
loop 里 this.session.append('assistant/message', ...) // 聚合写日志
... 下一 step 开头 ...
loop 里 buildRequest(..., this.session.deriveMessages(), ...)  // 从 log 投影历史
  → deriveMessages 读 surface.nodes → 逐节点 deriveEventMessage → Message[]
  → 这条 Message[] 就是模型下一轮的上下文
```

## 自测

1. `SessionEventMap` 是什么？为什么「加模型可见输入 = 加一个 key」？
2. `assistant/chunk` 和 `assistant/message` 的分工？
3. `deriveMessages()` 为什么是「增量」的？`surface.nodes` 是什么？
4. 为什么返回的是「新数组 + 深冻结共享 Message」？
5. `deriveEventMessage` 是纯函数，这对「回放/fork/resume」意味着什么？

---

**回到主线**：[s07 · Session Log](s07-session-log.md) | 上一章 [s06a · agent-loop 精读](s06a-agent-loop-deep-read.md)。
