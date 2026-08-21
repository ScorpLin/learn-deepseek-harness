# s11 · LLM Adapter（模型适配器）

> **一句话**：LLM 也是一个 seam——`LlmAdapter` 是 provider 契约，模型通过 `registerAdapter` 挂到 `ctx.llm`；会话用统一的 `Message`/流词汇，不管底层是哪个模型。

## 是什么

`packages/llm/` 是 LLM 能力族，和 shell 一样是完整 seam：

| 角色 | 包 |
|---|---|
| Definition + Consumer | `packages/llm/llm`（`@deepseek-ai/dsh-llm`）——`Message`/流词汇 + `ctx.llm` |
| Provider | `packages/llm/llm-deepseek`、`packages/llm/llm-pi-ai` |
| 其它 | `llm-retry`（重试）、`token-meter`（token 计量） |

一个 adapter 是一个 `LlmAdapter` 子类，通过 `registerAdapter` 注册（这就是 s00 表里「加模型 provider = 在 `ctx.llm` 注册 adapter」）。

## 关键词汇

- **`Message` / `ContentBlock`** —— 会话用统一词汇：`Message` 有 `role` + `content: ContentBlock[]`；`ContentBlock` 是 `text` / `tool-call` / `tool-result` 等的判别联合。
- **`StreamChunk`** —— 流协议：`text-delta` / `tool-call` / `finish` 等块。adapter 按这个吐，`BlockAssembler` 按这个拼。
- **assembled model request** —— 组装好的模型请求（从 prompt 组装 + 历史派生）。

## 为什么：provider 可替换的又一处

和 s05 的 seam 完全同构：`dsh-agent-loop` 依赖 `ctx.llm`，不依赖具体 adapter。换模型 = 换 adapter 注册 = 改配置，不改 loop。这就是「加一个模型 provider」这么轻的原因。

## 读源码

- `packages/llm/llm/` —— `Message`/流词汇 + adapter seam（Definition + Consumer）。
- `packages/llm/llm-deepseek/` —— 一个真实 provider 实现（看它怎么把 `StreamChunk` 映射到 DeepSeek API）。
- 完整契约见官方 [subsystems/llm-streaming](../deepseek-harness/docs/subsystems/llm-streaming.md)。

## 自测

1. LLM 的 Definition/Provider/Consumer 分别是哪个包？
2. `Message` 和 `ContentBlock` 的关系？`ContentBlock` 有哪些变体？
3. `StreamChunk` 是什么？谁按它吐、谁按它拼？
4. 为什么「换模型 = 改配置，不改 loop」？
5. `registerAdapter` 对应 s00 表里哪一行？

---

**下一章**：[s12 · 写一个工具](s12-write-a-tool.md) —— 把 s05+s08 用起来，从零写一个带执行管线的真工具。
