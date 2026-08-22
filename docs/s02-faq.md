# s02 · 常见疑问汇总

> 这一页收录 s02 学习过程中的真实疑问。它们大多不是概念本身难，而是教程写法埋的坑：术语点到为止、示例混用「教学」与「真实写法」、一处注释与代码不一致。每条按「疑问 → 根源 → 结论」展开，可对照正文自查。

## 六个疑问一览

| # | 疑问 | 一句话结论 |
|---|---|---|
| 1 | 为什么 `declare module`？ | 给库的类型定义打补丁（模块扩充），编译器才认识你新增的东西 |
| 2 | 每个插件都要 declare 吗？ | 不是：只「消费」不用声明，「新增服务 / 事件」才要 |
| 3 | stats 例子里 waterfall 怎么体现？ | 没体现——stats 例子是 `emit` 广播，waterfall 要看 waterfall-demo |
| 4 | waterfall 示例里为什么没有 Service？ | 那个插件只新增了事件契约，没往 ctx 上挂服务 |
| 5 | 一个 apply 里两个 `ctx.on` 正常吗？ | 教学拼图：分开演示「包装」与「短路」；生产通常合并成一个 |
| 6 | 发起 waterfall 的调用怎么读？ | `(事件名, ...载荷, 默认函数)`；正文注释 `// HELLO` 是笔误，实为 `DEFAULT` |

## 逐个拆解

### 1. 为什么 `declare module '@deepseek-ai/cordis'`？

**根源**：正文只说「`interface Events` 的 declare module 合并」，没解释这是**模块扩充**——从外部给库的类型定义打补丁。

**结论**：
- 你无法（也不该）改 `node_modules` 里的类型定义；`declare module` 让你从外面往库的 `Context` / `Events` 上「追加成员」（声明合并）。
- `declare` = 纯类型声明，编译后**零运行时代码**。
- 带上模块名是告诉 TS「扩充的是 `@deepseek-ai/cordis` 这个模块」，不是新建同名接口。

### 2. 是不是每次写插件都要 declare？

**根源**：正文只给了「要 declare」的例子，没讲什么时候不用。

**结论**：判断标准只有一条——**你给共享世界新增了什么**。
- 新增服务（别人能读 `ctx.xxx`）→ 补 `interface Context`；
- 新增事件名（`on` / `emit` / `waterfall` 里用到自定义名字）→ 补 `interface Events`；
- 只是订阅已有事件、用别人的服务、做初始化 → **一个都不补**。
- 注意：只要代码里出现自定义事件名，`Events` 补丁就是刚需——`on` / `emit` 的事件名参数受 `keyof Events` 强约束。

### 3. stats 例子里的 waterfall 在哪？

**根源**：正文「waterfall 是 harness 把『扩展』变成『拦截』的关键机制」这句悬空，后面的 stats 例子其实全程是 `ctx.emit`（广播），没有 waterfall。

**结论**：stats 例子演示的是 **emit（广播）**——发出去就完了，监听器只是旁观，结果不可改。waterfall 是另一种派发模式（`emit / parallel / serial / bail / waterfall` 五选一），要看 [waterfall-demo](../examples/02-events/README.md)：监听器是「关卡」，`next()` 放行、不调就短路。

### 4. waterfall 示例里为什么没有 Service？

**根源**：两个例子长得像，容易默认「declare 就该两块都有」。

**结论**：`Context` 补丁 = 你往 ctx 上**挂了服务**；`Events` 补丁 = 你**定义了事件契约**。waterfall 示例只订阅并演示事件、没有 `super(ctx, 'xxx')`，所以只有 `Events`。**加了几样就声明几样，一个不多一个不少。**

### 5. 一个 apply 里两个 `ctx.on` 正常吗？

**根源**：教学例子把「包装」和「短路」拆成两个监听器，看着像正式写法。

**结论**：技术上合法，但同一插件对同一事件挂两个监听器在生产中是坏味道（执行顺序取决于注册顺序，出 bug 难查）。教学拆开是为了分别演示两种模式；真实写法通常合并：

```ts
ctx.on('demo/transform', async (input, next) => {
  if (input.includes('blocked')) return '** blocked **'   // 短路
  return (await next()).toUpperCase()                     // 包装
})
```

跨**不同插件**监听同一事件是正常的（waterfall 决策点各挂一个裁决者）；同插件同事件挂俩 = 能合并就合并。

### 6. 发起 waterfall 的调用怎么读？（附：正文笔误）

**根源**：正文示例注释 `// HELLO` 与代码不符——默认函数返回 `'default'`，沿链被监听器 1 转大写后是 `DEFAULT`。

**结论**：
- 调用签名：`ctx.waterfall(事件名, ...载荷, 默认函数)`。发射方只扔载荷 + 留兜底答案，**不关心谁在监听**。
- 默认函数是最内层，**没有任何监听器调 `next()` 时才执行**；结果沿链从内向外逐层返回，可被外层包装。
- 正文已改为 `// DEFAULT`；可运行示例 `waterfall-demo.ts` 默认值传 `'hello'`，所以它打印 `HELLO`。

## 一句话口诀

> 补丁 = 你新增的共享资产：加服务补 `Context`，加事件补 `Events`，只消费一个不补。
> `emit` 是喇叭（广播），`waterfall` 是关卡（放行 / 包装 / 短路）。
> waterfall 监听器铁律：调 `next()` 是委托，不调是短路。
