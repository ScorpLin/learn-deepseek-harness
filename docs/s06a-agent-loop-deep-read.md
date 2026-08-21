# s06a · agent-loop 源码精读

> 从 `packages/core/agent-loop/` 逐文件追一遍「turn 循环」的真实实现。行号相对 `deepseek-harness` 根目录。这是 s06（Agent Loop）的源码版。

## 两个文件分工

```text
packages/core/agent-loop/src/agent.ts         —— 驱动：turn()/preStep()/step() 三个方法
packages/core/agent/src/runtime-types.ts       —— 事件契约：agent/* 事件的类型 + mode 声明
packages/core/agent-loop/src/tool-calls.ts     —— 工具执行管线（pre-execute → execute → post-execute）
```

## 核心一：turn() —— 一个 turn 的骨架（agent.ts 第 246-322 行）

```ts
private async turn(): Promise<boolean> {
  const turn = phase.turn + 1
  this.session.append('turn/start', { turn })                       // 255
  let turnEnds: TurnEndReason | null = null
  while (true) {                                                    // 263：一个循环 = 一个 step
    const step = phase.step + 1
    const decision = await this.preStep(target, { turn, step })     // 266
    if (decision.kind === 'reject') { turnEnds = { kind: 'blocked' }; return false }
    if (phase.step === 0 && decision.messages.length === 0) {       // 274
      turnEnds = { kind: 'completed' }; return false                 // 空 turn，不花 model call
    }
    this.session.append('step/start', { turn, step })               // 279
    for (const message of decision.messages)
      this.session.append('user/message', message, { surfaceOp: 'append' })   // 283
    const stepEnd = await this.step(decision.assembly)              // 287：模型请求 + 工具
    this.session.append('step/end', { turn, step })                 // 292（finally）
    if (turnEnds && this.inbox.nextStep.length === 0)
      await this.dispatch.serial('agent/turn-stopping', { turn, signal })     // 296
    if (turnEnds && this.inbox.nextStep.length === 0) break
    target = 'next-step'
  }
  this.session.append('turn/end', { turn, reason: turnEnds! })     // 319（finally）
}
```

三个要点（对照 s06 的时序图）：

1. **`turn/start` 先于一切**（第 255 行），`turn/end` 在 `finally` 里保证一定落日志（第 319 行）——即使出错，turn 也有结束记录。
2. **「空 turn」是显式处理**（第 274 行）：`preStep` 返回 `reject` 或首个 enter 被改写成空，就关闭 turn，**不花任何 step**——日志记录这次尝试（s06 说的「零 step turn」）。
3. **`agent/turn-stopping` 是 serial，且只在「turn 该结束且没有排队 step」时发**（第 296 行），监听器可以再引导一步。

## 核心二：preStep() —— 决定模型看到什么（第 228-243 行）

```ts
const claimed = this.inbox.claim(target, position.turn)             // 229：从 inbox 认领输入
const assembly = await this.loopCtx.systemPrompt.assemble(...)      // 230：组装 prompt 分节 + tool schema
const decision = await this.dispatch.waterfall(
  'agent/pre-step', { messages: claimed, ...position, signal },     // 234：waterfall 扩展点
  (): Promise<PreStepDecision> => Promise.resolve({ kind: 'enter', messages: ... }),
)
return decision.kind === 'reject' ? decision : { ...decision, assembly }
```

关键：`agent/pre-step` 是 **waterfall**，默认值是 `{ kind: 'enter', messages }`。监听器可以：

- 改写 `messages`（替换/增删模型看到的输入）；
- 直接 `return { kind: 'reject' }`（短路，拒绝这一轮）。

## 核心三：step() —— 一次模型请求 + 工具（第 332-414 行）

```ts
const { request } = await this.buildRequest(
  turn, step, assembly.tools, system, this.session.deriveMessages(), signal,   // 341
)
const stream = preparedCall?.stream(request) ?? this.loopCtx.llm.stream(request)  // 346
for await (const chunk of stream) {
  this.session.append('assistant/chunk', { turn, step, chunk })     // 350：每个 token 块落日志
  assembler.push(chunk)
}
this.session.append('assistant/message', { turn, step, message, ... })  // 400：聚合消息
const toolCalls = message.content.filter(block => block.type === 'tool-call')
if (toolCalls.length === 0) return { kind: 'completed' }
const { concluded } = await executeToolCalls(...)                   // 414：工具管线
```

最值得盯的一行是 **第 341 行的 `this.session.deriveMessages()`**：模型历史不是存在别处的数组，而是**从 session log 实时投影**出来的——这就是 s07「模型可见 ⟺ 已记录」在 loop 里的落地。

## 事件契约（runtime-types.ts）

| 事件 | 模式 | 返回 | 用途 |
|---|---|---|---|
| `agent/pre-step` | waterfall | `PreStepDecision`（enter/reject） | 决定模型看到什么 |
| `agent/request` | waterfall | `LlmCallConfig` | 替换模型调用配置 |
| `agent/request-error` | waterfall | `RequestErrorAction` | 失败重试策略 |
| `agent/turn-stopping` | serial | void | turn 结束时再引导一步 |

这些在 `agent/src/runtime-types.ts` 里用 `@mode` 标注（s02 说过：模式的声明是事件契约的一部分）。

## 一条数据流走完

```text
inbox.claim() → systemPrompt.assemble()
  → agent/pre-step（waterfall：enter/reject）
  → turn/start → step/start → user/message
  → buildRequest(session.deriveMessages()) → llm.stream
  → assistant/chunk* → assistant/message
  → executeToolCalls（tools/pre-execute → execute → post-execute → result）
  → step/end → agent/turn-stopping（serial）→ turn/end
```

## 自测

1. `turn()` 里，`turn/start` 和 `turn/end` 分别在什么位置？为什么 `turn/end` 在 finally 里？
2. 「空 turn」怎么触发？为什么它也算一个 turn？
3. `agent/pre-step` 的默认值和 `reject` 分别是什么？
4. 第 341 行的 `deriveMessages()` 体现了 s07 的哪条铁律？
5. `agent/turn-stopping` 为什么是 serial 而不是 waterfall？

---

**下一章**：[s07a · session-log 精读](s07a-session-log-deep-read.md)。
