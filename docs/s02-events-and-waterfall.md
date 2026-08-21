# s02 · 事件与 waterfall

> **一句话**：服务支持「直接调用」，事件支持「我不知道谁在听」。而 **waterfall** 是事件的拦截模式——监听器可以包装结果，也可以「短路」抢答。harness 的权限门、审批、请求改写，全挂在 waterfall 上。

## 是什么

一个插件用 `ctx.emit(...)` 广播「发生了什么」，其他插件用 `ctx.on(...)` 听。发的人不知道谁在听，听的人也不知道谁在发。harness 用它做工具结果、模型请求、审批决定等交互。

声明、发出、监听，三件事：

```ts
import { Service, type Context } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/cordis' {
  interface Context { stats: StatsService }
  interface Events { 'stats/report'(name: string, count: number): void }
}

export class StatsService extends Service {
  private counts = new Map<string, number>()
  constructor(ctx: Context) { super(ctx, 'stats') }
  bump(name: string) {
    const next = (this.counts.get(name) ?? 0) + 1
    this.counts.set(name, next)
    this.ctx.emit('stats/report', name, next)
  }
}
```

注意 `interface Events` 的 `declare module` 合并——和 s01 里给 `Context` 加属性是同一招，这里换成给 `Events` 加事件名。它声明事件名和监听器签名，让 `ctx.emit` / `ctx.on` 全类型化。命名约定 `namespace/action` 让扁平的事件命名空间可读。

监听方：

```ts
import type { Context } from '@deepseek-ai/cordis'
import type {} from './stats.ts'   // 把声明合并带进来，零运行时 import

export const name = 'reporter'
export const inject = ['stats']

export function apply(ctx: Context) {
  ctx.on('stats/report', (name, count) => {
    console.log('[stats] ' + name + ' -> ' + count)
  })
}
```

`ctx.on()` 是 effect（s01），所以监听器随插件卸载自动移除——**永远不用手写 removeListener**。

## 为什么

服务是「点到点调用」，事件是「点到多点广播」。harness 需要后者：一个工具结果要被 UI、日志、telemetry 同时观察，但工具本身不该知道它们存在。事件把「发」和「听」解耦。

更重要的是 **waterfall**：它让一个事件成为「可插拔的决策点」。这是 harness 把「扩展」变成「拦截」的关键机制。

## 五种分发模式（记住这张表）

事件的「分发模式」是它契约的一部分，决定监听器能不能返回值、并发跑、或互相短路：

| 模式 | 调用 | 语义 |
|---|---|---|
| emit | `ctx.emit(...)` | 同步广播；返回的 promise/值被忽略 |
| parallel | `await ctx.parallel(...)` | 全部并发执行，一起 await |
| serial | `await ctx.serial(...)` | 顺序执行，第一个非空返回值获胜并停止 |
| bail | `ctx.bail(...)` | serial 的同步版 |
| waterfall | `ctx.waterfall(...)` | around-middleware，可包装/短路（见下） |

harness 的每个事件都在官方 [subsystems](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/subsystems/README.md) 对应页文档化它的模式。

## waterfall：包装或短路

waterfall 是驱动「拦截」的模式。每个监听器收到 `(...args, next)`：

- 调 `next()` 委托下游，可以包装 `next()` 的返回值；
- return 而不调 `next()` = **短路（veto）**，下游全被跳过，连最内层默认值都不执行。

```ts
declare module '@deepseek-ai/cordis' {
  interface Events {
    'demo/transform'(input: string, next: () => Promise<string>): Promise<string>
  }
}

export function apply(ctx: Context) {
  // 监听器 1：包装下游结果
  ctx.on('demo/transform', async (input, next) => {
    const downstream = await next()
    return downstream.toUpperCase()
  })
  // 监听器 2：自己拥有决策时短路
  ctx.on('demo/transform', async (input, next) => {
    if (input.includes('blocked')) return '** blocked **'
    return next()
  })
}
```

发起一次 waterfall 是这样调的——最后一个参数 `next` 就是**最内层的默认值**（没有任何监听器调 `next()` 时才执行）：

```ts
const result = await ctx.waterfall(
  'demo/transform',
  'hello',
  async () => 'default',   // 最内层默认函数
)
console.log(result)          // HELLO
```

监听器按注册顺序**从外到内串成一条链**：第一个注册的监听器在最外层，`next()` 从外向内逐层委托，最后落到你传进来的默认函数；返回值再沿链从内向外逐层返回。

走一遍第二个监听器短路的情形：监听器 1 先跑，调 `next()` 触发监听器 2；监听器 2 看到 `blocked` 直接 return（不调 `next()`），最内层默认函数永不执行，监听器 1 把替换消息转大写返回。

**铁律**（本仓库 standing rule）：**一个只「观察/打日志」的 waterfall 监听器也必须调 `next()`**；return 而不调 `next()` 是「我有意短路」。忘记 `next()` 的日志监听器会静默吞掉所有下游行为——这是新手最容易踩的坑。

harness 里真实的 waterfall 例子：`agent/request`（插件可替换模型调用配置）、`approval/request`（策略可直接回答而不问用户）。

## 怎么做：跑起来

见 [examples/02-events/](../examples/02-events/README.md)。它把一个 `stats` 服务 + `reporter` 监听器 + 一个 `waterfall-demo` 装进一个 `cordis.yml` 跑。

## 读源码

`vendor/cordis/src/events.ts` 的 `EventsService` 是分发模式的运行时真相。核心是 `dispatch(mode, args)`：按模式决定「是否 await、是否收集返回值、是否短路」。读它时重点看 waterfall 如何把 `next` 串成一条链——每个监听器拿到一个「调下游」的 continuation。

## 自测

1. 服务（直接调用）和事件（广播）在「谁认识谁」上有什么本质区别？
2. 五种分发模式各在什么场景用？serial 和 bail 的区别是什么？
3. waterfall 监听器「包装结果」和「短路」分别靠什么动作？
4. 忘写 `next()` 的日志监听器会造成什么后果？
5. 为什么说 `ctx.on()` 不用手写 removeListener？


## 小作业

动手写，先不看 [examples/02-events](../examples/02-events/README.md)。

1. **写一个 emit 事件**（声明 `interface Events`）+ 一个 `ctx.on` 监听器，跑通。
   **达标标准**：能默写 `declare module` 声明事件名 + 监听器签名的两段。
2. **写两个 waterfall 监听器**：一个把下游结果 `toUpperCase`（包装），一个在输入含 `blocked` 时直接 return（短路）。分别用 `hello` 和 `blocked words` 跑，**先预测输出再验证**。
   **达标标准**：能一句话说清「包装 = 调 `next()` 再改返回值」「短路 = return 不调 `next()`」，以及忘写 `next()` 的后果。
---

**下一章**：[s03 · 服务与依赖注入](s03-services-and-inject.md) —— `ctx.tools` 是怎么来的，`inject` 怎么让加载顺序自动推导。
