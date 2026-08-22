# s03 · 服务与依赖注入

接上两章：s01 给了你总线（Context）和插件，s02 给了你广播与拦截（Event）。这一章补上三原语的最后一块——**Service**：插件怎么往总线上提供一个命名能力、别的插件怎么拿到它。`ctx.tools`、`ctx.llm`、`ctx.agents` 这些名字就是这么来的。

> **一句话**：服务（service）是一个命名能力，某个插件提供、别的插件通过 `ctx` 消费。`inject` 声明依赖，让加载顺序由依赖自动推导——**不是由 `cordis.yml` 的文件顺序决定**。

## 是什么

harness 里的 `ctx.tools`、`ctx.llm`、`ctx.agents` 都是服务。消费者写 `inject: ['tools']` 而不是 import 具体实现，所以配置可以选择「谁来提供」而不改消费者。

**提供**一个服务（用 `Service` 子类，s01 的第三种插件形态）：

```ts
import { Service, type Context } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/cordis' {
  interface Context { greeter: GreeterService }
}

export class GreeterService extends Service {
  constructor(ctx: Context) { super(ctx, 'greeter') }
  greet(who: string) { return 'Hello, ' + who + '!' }
}

export const name = 'greeter'
export function apply(ctx: Context) { ctx.plugin(GreeterService) }
```

两件事配合：

- **运行时**：`super(ctx, 'greeter')` 把实例注册到名字 `greeter`，此后任何插件能作为 `ctx.greeter` 访问。注册是 effect（s01），卸载 provider 就移除服务。
- **编译时**：`declare module` 块是声明合并，把 `greeter` 加进 `Context` 接口，让 `ctx.greeter` 处处类型通过。它不生成代码——没有它服务照样在运行时工作，只是消费者失去类型安全。

**消费**一个服务：

```ts
export const name = 'consumer'
export const inject = ['greeter']

export function apply(ctx: Context) {
  console.log(ctx.greeter.greet('world'))
}
```

## 为什么：依赖驱动加载

`inject` 列出这个插件需要的服务。Cordis 把插件保持在 **PENDING** 直到每个列出的服务都存在，所以 `apply` 里 `ctx.greeter` 保证就绪。**`cordis.yml` 里的顺序无所谓**——依赖，不是文件顺序，决定插件何时启动。

`cordis.yml` 只决定「登记」顺序（谁先被 Cordis 看到），不决定「开工」顺序：`apply` 是否执行只问一个问题——依赖齐了没？齐了当场开工；没齐进候场区（PENDING）等，依赖一到位自动激活。所以 provider 和 consumer 两行互换，输出一样；删掉 provider，consumer 停在 PENDING、什么都不打印——不崩溃、不半启动。

### 依赖在加载后仍被追踪

`inject` 不是一次性启动检查（领证），而是一条持续通电的线。服务一变，Cordis 的注册表**直接点名**复查依赖它的 fiber（`notify` → `_checkImpl` → 重算 epoch 钥匙），不需要任何插件去监听。钥匙里存的甚至不只是「服务在不在」，还有**提供者实例的 uid**——所以服务中途消失（provider 被卸载或热替换），每个依赖它的插件被**受控卸载**；服务回来（哪怕换了实现）再重新加载。配合 effect 逆序清理，运行中的消费者手里永远只有「当前在跑的 provider」的引用，不存在持有失效引用的窗口期。

**这就是「换 provider 热替换」能成立的原因**：卸载 `dsh-bash-local`、挂一个不同的 `shell` provider——乘客（`inject: ['shell']` 的插件）不用换票：旧车退役先干净下车（effect 清理），新车就位自动重新上车（重新跑 `apply`，换到新实现）。服务名与接口不变，换的只是实现，消费者一行代码不用动。**s05 的 seam 就建立在这一条之上**：接口固定、实现可换、且换得干净。

> **口诀**：`inject` 不是领证，是持续通话——服务断线，依赖者干净下线；服务回来（换了实现也一样），自动重新上线。

## 可选依赖

`inject` 是硬需求。对「没有也能活」的能力，跳过 `inject`，在使用处探测：

```ts
export function apply(ctx: Context) {
  const greeter = ctx.get('greeter')   // 没有 provider 时为 undefined，插件照常跑
  console.log(greeter?.greet('maybe') ?? 'no greeter available')
}
```

区分：`ctx.<name>` 假定该服务已注入（依赖就绪后才安全访问）；要读一个可有可无的服务，用 `ctx.get(name)`。

## 命名

服务名在一个应用里是**扁平命名空间**。自己的服务要加前缀区分（harness 占用了 `tools`、`llm` 这类朴素名字）。官方 `deepseek-harness/docs/subsystems/README.md` 的生成 `cordis-surface` 区列出 harness 注册的每个名字。

## 怎么做：跑起来

见 [examples/03-services/](../examples/03-services/README.md)。含 `greeter.ts`（provider）和 `consumer.ts`（consumer），并演示：换顺序输出不变、删 provider 后 consumer 停在 PENDING。

## 读源码

- `vendor/cordis/src/service.ts` —— `Service` 基类，`super(ctx, name)` 的注册机制。
- `vendor/cordis/src/registry.ts` —— 插件注册表（s01 里 `ctx.registry` 诊断的底层）。
- `vendor/cordis/src/fiber.ts` 里的 `_checkImpl` / `_refresh` —— 依赖就绪 → 激活的判定。

## 自测

1. `super(ctx, 'greeter')` 做了两件事，分别是什么？哪件是运行时、哪件是编译时？
2. 为什么 `cordis.yml` 里 provider 和 consumer 的顺序无关紧要？
3. provider 中途被卸载，依赖它的 consumer 会发生什么？这个机制为什么重要？
4. 硬依赖和可选依赖分别怎么写？
5. 为什么自己的服务名要加前缀？


## 小作业

动手写，先不看 [examples/03-services](../examples/03-services/README.md)。

1. **写 `GreeterService extends Service`**（`super(ctx, 'greeter')`）+ 一个 `inject: ['greeter']` 的 consumer，跑通 `Hello, world!`。
   **达标标准**：能默写「`declare module` 加 `ctx.greeter` 类型」+「`super(ctx,'greeter')` 注册」这一对运行时/编译时搭配。
2. **删掉 provider 那行**再跑，观察 consumer 停在 PENDING、进程静默退出；再写一个 `ctx.get('greeter')` 的可选依赖版。
   **达标标准**：能说清硬依赖（inject）和可选依赖（ctx.get）在「服务缺失时」的行为差异。
---

**下一章**：[s04 · 配置与 Loader](s04-config-and-loader.md) —— `cordis.yml` 的完整形态、`Config` schema、profile/bundle。
