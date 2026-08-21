# s11a · llm adapter 源码精读

> 从 `packages/llm/llm` 追一遍「模型适配器」的真实契约。行号相对 `deepseek-harness` 根目录。这是 s11（LLM Adapter）的源码版。

## 三角色

```text
packages/llm/llm/            —— Definition + Consumer：词汇 + ctx.llm + LlmAdapter 抽象类
packages/llm/llm-deepseek/   —— Provider：DeepSeek 适配器
packages/llm/llm-pi-ai/      —— Provider：pi-ai 适配器
```

## 核心一：词汇（Message / ContentBlock / StreamChunk）

### Message（message.ts 第 129 行）

```ts
interface Message {
  readonly id: MessageId                       // 稳定身份，跨表示边界保留
  readonly role: 'system' | 'user' | 'assistant'
  readonly content: ContentBlock[]             // 精确的模型可见块
  readonly source: MessageSource               // 生产者填的来源字段
}
```

要点：`MessageId` 是 branded id（`Branded<'MessageId'>`，brand.ts 第 16 行）。`UserMessage` / `AssistantMessage` 是带 `role` 特化的子类型。

### ContentBlock（types.ts 第 99-110 行）

```ts
interface ContentBlockMap {
  'text': TextBlock
  'reasoning': ReasoningBlock
  'image': ImageBlock
  'tool-call': ToolCallBlock
  'tool-result': ToolResultBlock
}
type ContentBlock = ContentBlockMap[ContentBlockType]   // merge-extensible 派生联合
```

这是一个「`...Map → derived-union`」模式（s07 提过）：`ContentBlock` 由 `ContentBlockMap` 派生，switch 在 `type` 上判别，未知变体走默认分支（merge-extensible）。

### StreamChunk + FinishReason

- **StreamChunk** —— 流协议块（`text-delta` / `tool-call` / `finish` 等）。adapter 按它吐，`BlockAssembler`（assembler.ts）按它拼。
- **FinishReasonMap**（types.ts 第 116-122 行）—— 模型为什么停：`stop` / `tool-calls` / `max-tokens` / `aborted` / `error`。

## 核心二：LlmAdapter —— provider 契约（index.ts 第 180 行）

```ts
export abstract class LlmAdapter {
  providerInfo(provider: string): LlmProviderInfo { ... }
  providerRetryPolicy(_provider: string): ResolvedRetryPolicy | undefined { ... }
  listModels(_provider: string): Promise<readonly LlmModelInfo[]> { ... }
  resolveModel(provider: string, model: string, _signal: AbortSignal) { ... }
  abstract stream(options: GenerateOptions): AsyncIterable<StreamChunk>   // 核心
}
```

最关键的是 **`stream(options): AsyncIterable<StreamChunk>`**（抽象方法）：一个 adapter 只实现这一个核心方法，把「组装好的模型请求」变成「chunk 流」。其余方法（providerInfo / listModels / resolveModel）是元数据查询，都有默认实现。

## 核心三：registerAdapter —— 怎么挂进来（index.ts 第 338 行）

```ts
registerAdapter(providers: string[], adapter: LlmAdapter): AdapterRegistrationHandle
```

- `providers` 是这个 adapter 拥有的路由（如 `['deepseek']`）；
- 返回一个 disposer（s01 的 effect：卸载即注销 adapter）；
- 这就是 s00 表里「加模型 provider = 在 `ctx.llm` 注册 adapter」的源码。

## 一个 seam 的又一处

`dsh-agent-loop` 依赖 `ctx.llm`（Definition），不依赖具体 adapter。换模型 = 换 adapter 注册 = 改配置，不改 loop（s05 的「换 provider 不改 consumer」在 LLM 上的体现）。

## 自测

1. `Message` 的四个字段？`MessageId` 为什么是 branded id？
2. `ContentBlockMap` 有哪五个变体？`ContentBlock` 是怎么派生的？
3. `LlmAdapter` 唯一必须实现的抽象方法是哪个？签名是什么？
4. `registerAdapter` 的两个参数分别是什么？返回什么？
5. 为什么「换模型 = 改配置，不改 loop」？

---

**回到主线**：[s11 · LLM Adapter](s11-llm-adapter.md) | 精读系列：[s05a](s05a-shell-seam-deep-read.md) / [s06a](s06a-agent-loop-deep-read.md) / [s07a](s07a-session-log-deep-read.md) / [s08a](s08a-tools-deep-read.md)。
