# s01 · Cordis 地基

> **一句话**：DeepSeek Harness 的一切都是插件（plugin），而插件就是「一个通过 `apply(ctx)` 声明自己贡献了什么的函数」。先吃透这一句，后面 18 章才有地基。

## 开始之前：先搞清两个仓库

学这套课程，你手上要有**两个目录**，它们是**并列**的关系（不是谁包含谁）：

```text
你的某个目录/
├── deepseek-harness/          ← 框架源码（被学习的东西）
│   └── vendor/cordis/         ← Cordis 源码，例子 import 的就是它
└── learn-deepseek-harness/    ← 本仓库（你正在读的课程 + 例子）
    └── examples/01-first-plugin/
```

- **deepseek-harness**：DeepSeek Harness 框架本身的源码。你写插件时 `import ... from '@deepseek-ai/cordis'`，这个 `@deepseek-ai/cordis` **不在 npm 上**，而是 deepseek-harness 仓库里**自带（vendored）的一份源码**——所以跑例子必须要有它。
- **learn-deepseek-harness**（本仓库）：你正在读的课程，`examples/` 里是每章例子的代码。

**你要做的第一件事（只需一次）**：把 deepseek-harness 的依赖装好：

```sh
cd 你的/deepseek-harness     # 换成你机器上 deepseek-harness 的实际路径
pnpm install
```

装完这一下，后面所有章节的例子就都能跑了。跑法见下一节。

## 是什么

先看一个最小的插件。这是你能写出的、最完整的 Cordis 插件：

```ts
// hello.ts
import type { Context } from '@deepseek-ai/cordis'

export const name = 'hello'

export function apply(ctx: Context) {
  console.log('hello from my first plugin')
}
```

三件事：

- `apply(ctx)` 是插件唯一必须做的事——Cordis 加载它时，会用**上下文**（`ctx`）调用它。
- `ctx` 是插件注册一切贡献的通道：服务、事件监听、工具、提示词分节，全从这里挂。
- `name` 是可选的诊断标签，出问题时的报错里能看到它。

一个插件本身**没有任何框架引导代码**：它只描述「我贡献什么」，而「应用由哪些插件组成」写在另一个文件里：

```yaml
# cordis.yml
- name: './hello.ts'
```

这个文件是一个**插件条目列表**。每条 `name` 是模块路径（相对路径或 npm 包名），加载器（Loader）把每个条目挂载起来。

### 三种插件形态

Cordis 接受三种形态，用函数直到你需要暴露服务为止：

```ts
import { Service, type Context } from '@deepseek-ai/cordis'

// 1. 函数插件 —— 最常见
export function apply(ctx: Context) {}

// 2. 对象插件 —— 带 apply 方法的对象
export const objectPlugin = { name: 'obj', apply(ctx: Context) {} }

// 3. 类插件 —— Service 子类（s03 讲，用于暴露服务）
export class MyService extends Service {
  constructor(ctx: Context) { super(ctx, 'myService') }
}
```

## 为什么

传统框架里，你要用一个功能，是 `import` 具体的类然后 `new` 出来。Cordis 反过来：

> **你不 import 实现，你声明「我需要什么能力」和「我能提供什么能力」，框架在运行时把它们接起来。**

这带来三个直接后果，也是 harness 一切设计的根源：

1. **没有特权核心** —— 模型适配器、工具注册表、会话日志、甚至 agent loop 本身都是插件，所以「换掉 agent loop」和「挂一个新工具」是同一件事：改配置。
2. **加载顺序由依赖决定，不由文件顺序** —— 你在 `cordis.yml` 里怎么排序都行，顺序由 `inject` 依赖推导（s03 详讲）。
3. **注册是可撤销的** —— 所有贡献都走 `ctx.effect()` / `ctx.on()`，插件卸载时自动撤销。这直接解释了为什么「热替换」（HMR）能免费工作。

## 怎么做：跑起来

前提：你已经装好了 deepseek-harness 的依赖（见上一节）。

### 最简单：用 run.sh 一键跑

本仓库根目录有个 `run.sh`，它会自动把例子拷进 deepseek-harness 的 tmp/ 再运行，你不用手动拼路径：

```sh
cd learn-deepseek-harness     # 本仓库根目录
./run.sh 01-first-plugin
# 输出：hello from my first plugin
```

如果 deepseek-harness 不在本仓库的上一级目录，用 `DSH_ROOT=/你的路径/deepseek-harness ./run.sh 01-first-plugin` 指定。

### 手动跑（想理解机制时再看）

先 `cd` 到例子目录 `examples/01-first-plugin/`，把上面的 `hello.ts` 和 `cordis.yml` 放进去，然后：

```sh
node --import tsx /你的路径/deepseek-harness/vendor/cordis/bin.js
# 输出：hello from my first plugin
```

`/你的路径/` 换成你机器上 deepseek-harness 的实际位置。这条命令里的 `vendor/cordis/bin.js` 就是那个「极简启动器」——下一节读源码时会逐行讲它。

**试着破坏它**：让 `apply` 抛异常，进程会响亮地失败（而不是静默跳过这个插件）：

```ts
export function apply(ctx: Context) {
  throw new Error('apply exploded')
}
```

> 注意一个早期就该知道的坑：一个「模块路径拼错」的条目，是**通过 logger 服务上报**的，而不是让进程崩溃；在 boot 早期，这个上报可能在 console 导出器就位前丢失。所以「新加的条目好像什么都没发生」时，**先检查拼写**。

## 读源码：5 行的启动器 + fiber 状态机

### 启动器：整个框架的最小真相

先读 `vendor/cordis/bin.js`（约 15 行，就是上面的运行命令）：

```js
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'

const ctx = new Context()
await ctx.plugin(Loader)
await ctx.loader.create({ name: '@deepseek-ai/cordis-plugin-include', config: { path: './cordis.yml' } })
```

四件事就是 Cordis 的全部：

1. `new Context()` —— 建一个根上下文。
2. `ctx.plugin(Loader)` —— 挂 Loader 插件（Loader 本身也是个插件！）。
3. `ctx.loader.create(...)` —— 让 Loader 读 `cordis.yml`，把里面每个条目挂成子插件。
4. 于是你写的 `hello.ts` 被 Loader 解析、挂载、调用 `apply(ctx)`。

注意第 3 行用的是 `ctx.loader`——这是「消费一个服务」的写法。它背后是「服务」和「依赖注入」，正是 s03 的内容。

### fiber 状态机：一个插件的一生

每个已加载的插件实例拥有一个 **fiber**（运行时句柄），在 `vendor/cordis/src/fiber.ts` 里定义。它走这个状态机（`FiberState` 枚举，源码里就叫这个）：

```
PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED
             ↘ FAILED
```

- **PENDING** —— 已声明，但它需要的服务还没就绪（s03 的 `inject`）。这是一个**合法状态**，不是错误。
- **LOADING / ACTIVE** —— `apply` 正在跑 / 已完成。
- **FAILED** —— `apply` 或配置校验抛了异常。
- **UNLOADING / DISPOSED** —— 撤销器正在跑 / 全部拆干净。

**你后面最常用的诊断技能**：插件「什么都没打印」≠ 报错，多半是 `PENDING`——它声明了没人提供的服务，在安静等待。查它的办法是遍历注册表看 fiber state：

```ts
import { FiberState, type Context } from '@deepseek-ai/cordis'

export function apply(ctx: Context) {
  for (const runtime of ctx.registry.values())
    for (const fiber of runtime.fibers)
      if (fiber.state === FiberState.PENDING)
        console.log(fiber.name + ' is PENDING — a required service is missing')
}
```

### effect：可撤销副作用的真相

生命周期里最关键的一环。对一个 Cordis 没管理的资源（timer、连接、watcher），用 `ctx.effect()` 包起来并返回撤销器：

```ts
export function apply(ctx: Context) {
  ctx.effect(() => {
    const timer = setInterval(() => console.log('tick'), 200)
    return () => {           // 撤销器（disposer）
      clearInterval(timer)
      console.log('cleaned up')
    }
  })
}
```

要卸载一个子插件，`ctx.plugin(...)` 返回它的 fiber，调用 `fiber.dispose()` 就触发卸载：

```ts
const fiber = ctx.plugin(heartbeat)   // 挂子插件，拿到它的 fiber
setTimeout(async () => {
  await fiber.dispose()               // 触发卸载，heartbeat 的 effect 逆序撤销
}, 700)
```

规则：

- **effect 的 body 在加载时执行，返回的 disposer 在卸载时执行**——你永远不用手动调 disposer。
- **内置 API（`ctx.on`、`ctx.plugin`、服务注册）本身就是 effect**，所以大部分时候你根本不用手写 `ctx.effect`。
- disposer 按**注册逆序**执行；多个**异步** disposer 并发跑。要严格顺序，就放进一个 disposer 里 `await`。

在源码里，这些 disposer 存在 fiber 的 `_disposables`（一个 `DisposableList`），卸载时逆序跑。理解了这一点，你就理解了为什么 HMR（s04 讲）能「卸载旧插件 → 撤销它的所有 effect → 加载新代码」这么干净。

## 自测

走完这章，你应该能不看文档回答：

1. 一个最小的 Cordis 插件长什么样？它唯一必须导出的是什么？
2. 「应用由哪些插件组成」写在哪里？
3. 为什么说「没有特权核心」？agent loop 和普通工具插件在这一点上有什么共同点？
4. fiber 的五个状态分别是什么？「插件没反应」最可能是哪个状态？
5. `ctx.effect()` 的 body 和返回的 disposer 分别在什么时候执行？为什么说大部分时候你不用手写它？


## 小作业

动手写，**先不看答案**，做完再对照 [examples/01-first-plugin](../examples/01-first-plugin/README.md) 和 [exercises/](../exercises/README.md)。

1. **写一个 heartbeat 插件**：用 `ctx.effect()` 包一个 `setInterval`，返回 `clearInterval` 的 disposer；再写第二个插件用 `ctx.plugin(heartbeat)` 挂它，700ms 后 `dispose()`。观察控制台按顺序出现 `tick`×N、`heartbeat cleaned up`。
   **达标标准**：能默写 `ctx.effect` 的「body 返回 disposer」两段，说清 body 何时执行、disposer 何时执行。
2. **让 `apply` 抛错**，跑一遍，确认进程是「响亮失败」而不是静默跳过。
   **达标标准**：能说清为什么「插件加载失败必须响亮」是 harness 的原则。
---

**下一章**：[s02 · 事件与 waterfall](s02-events-and-waterfall.md) —— 插件之间怎么通信、怎么拦截。
