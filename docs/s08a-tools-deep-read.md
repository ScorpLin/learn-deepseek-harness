# s08a · tools 管线源码精读

> 从 `packages/core/tools/src/index.ts` 追一遍「工具执行管线」的真实契约。行号相对 `deepseek-harness` 根目录。这是 s08（Tools）的源码版。

## 四个事件，一条管线

执行管线由四个事件组成，全在 `tools/src/index.ts` 里声明（第 142-197 行）：

```text
tool/call
  -> tools/pre-execute   (waterfall: allow/deny/ask)
  -> tools/execute       (waterfall: 包裹派发)
  -> tools/post-execute  (waterfall: 结果变换)
  -> tool/result         (emit: 只观察最终结果)
```

## 事件契约（源码 JSDoc 的精确定义）

### 1. tools/pre-execute（第 152 行，@mode waterfall）

```ts
'tools/pre-execute'(this, exec: ToolExecution, next: () => Promise<PreToolDecision>): Promise<PreToolDecision>
```

JSDoc 原话：「**Allow, deny, or ask before dispatch. `next()` delegates to allow; missing approval support turns `ask` into denial.**」

- 调 `next()` = 放行；
- return 而不调 `next()` = 拒绝（短路，s02 的 waterfall 纪律）；
- `ask` 需要审批支持，否则降级为拒绝。

### 2. tools/execute（第 163 行，@mode waterfall）

```ts
'tools/execute'(this, exec: ToolDispatchExecution, next: () => Promise<ToolExecutionResult>): Promise<ToolExecutionResult>
```

JSDoc 原话：「**Around-dispatch waterfall for timeout, retry, or metrics.**」关键是这条约束：

> `next()` 返回一个规范化结果；**包裹者只能改 `exec.signal`**，调用身份不可变。

所以「超时/重试/指标」这类要**包裹实际派发生命周期**的，挂这里；但只能替换 `signal`，不能改调用本身。

### 3. tools/post-execute（第 175 行，@mode waterfall）

```ts
'tools/post-execute'(this, exec: ToolExecution, result: Readonly<ToolExecutionResult>, next: () => Promise<PostToolDecision>): Promise<PostToolDecision>
```

JSDoc 原话：「**Accept, replace, enrich, or block a normalized dispatch result.**」——接受 / 替换 / 丰富 / 拦截一个结果。抛错的工具也会作为错误到达这个 waterfall。

### 4. tools/result（第 197 行，@mode emit）

```ts
'tools/result'(this, exec: Readonly<ToolExecution>, result: Readonly<ToolExecutionResult>): undefined
```

JSDoc 原话：「**Observe the frozen, lossless-JSON final outcome.**」——观察**深冻结的最终结果**，监听器失败被隔离（contained）。这是「只观察、不变换」的终点。

## 选择规则（s08 那张表的源码依据）

| 你想做什么 | 挂哪个点 | 原因 |
|---|---|---|
| 权限门 / 计划 / 沙箱策略 | `tools/pre-execute` | 允许/拒绝/ask 的决策门，短路即拒绝 |
| 超时 / 重试 / 指标 | `tools/execute` | 包裹派发生命周期，只能换 `signal` |
| 变换结果 / 附加上下文 | `tools/post-execute` | accept/replace/enrich/block |
| 审计 / 日志 / 最终指标 | `tools/result` | 只观察深冻结结果，失败被隔离 |

**区分 `post-execute`（变换）和 `result`（只观察）**：用错了会得到不该有的行为——post-execute 能改结果，result 改不了（深冻结）。

## 一个易踩的点

`tools/pre-execute` 是 waterfall。**只观察/打日志的监听器也必须 `next()`**，否则静默吞掉所有下游——在这里等于「所有工具都卡住不执行」。

## 自测

1. 四个事件各是什么模式？哪三个有 `next()`，哪个没有？
2. `tools/execute` 为什么「只能改 `exec.signal`」？这约束了什么？
3. `tools/result` 的 `result` 为什么是「深冻结」的？监听器失败怎么处理？
4. 权限门为什么挂 `pre-execute` 而不是 `execute`？
5. `post-execute` 和 `result` 的区别，用一句话说清。

---

**回到主线**：[s08 · Tools](s08-tools.md) | 精读系列：[s05a](s05a-shell-seam-deep-read.md) / [s06a](s06a-agent-loop-deep-read.md) / [s07a](s07a-session-log-deep-read.md)。
