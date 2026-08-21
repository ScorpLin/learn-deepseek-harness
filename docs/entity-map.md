# Entity Map（实体关系图）

核心实体之间「谁拥有谁、谁派生自谁」。这是「系统怎么挂起来」的一页速查。

## 关系图

```text
Context (根)
 └── Fiber (每个插件实例一个)
       ├── ctx (该插件的子 Context)
       ├── effect 列表 (可撤销副作用)
       └── runtime (共享的插件运行时)

Session (会话)
 └── SessionEvent[] (append-only log)
       ├── user/message
       ├── assistant/chunk (原始 token 流，保真)
       ├── assistant/message (聚合)
       ├── tool/call → tool/result
       └── step/start → step/end, turn/start → turn/end

Agent (活句柄, 对应一个 Session)
 ├── followup()/steer()/inject()  (输入通道)
 ├── agent.ctx (作用域 Context)
 └── 驱动: agent-loop (读 log → 组装 → 调 llm → 跑 tools → 写回 log)

Tool (注册在 ctx.tools)
 ├── ToolDefinition (schema → 进 system prompt)
 └── ToolExecution → ToolResult (执行管线 pre→execute→post→result)

Seam (可替换能力)
 ├── Service Definition (接口 + ctx.<key>)
 ├── Service Provider (实现, 可能多个)
 └── Consumer (inject 服务, 通常是模型工具)
```

## 三条贯穿全系统的关系

1. **Session 是真理之源** —— 模型上下文、UI 回放、fork、telemetry、persistence 全部从 `SessionEvent[]` 派生。没有任何「第二份真相」。
2. **Agent 是活句柄，Session 是持久数据** —— `Agent` 携带 inbox/step/status，驱动当前这一跳；`Session` 是它写下的、可重放的 log。
3. **seam 解耦能力** —— Consumer 只依赖 Definition 的接口，不依赖具体 Provider。换 Provider = 改配置，不改 Consumer。

## 一句话记忆

**Context 挂 Fiber，Session 存 Event，Agent 读 Event 写 Event，Tool 在 Event 里留下 call/result，seam 让一切可换。**
