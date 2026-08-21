# s03 · 服务与依赖注入

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

试着把 `cordis.yml` 里 provider 和 consumer 两行互换，输出一样。再删掉 provider，consumer 停在 PENDING，什么都不打印——不崩溃、不半启动。

### 依赖在加载后仍被追踪

`inject` 不是一次性启动检查。如果服务中途消失（provider 被卸载或热替换），**每个依赖它的插件也被卸载**，服务回来再加载。配合 effect，这防止运行中的消费者持有已失效服务的引用。

**这就是「换 provider 热替换」能成立的原因**：卸载 `dsh-bash-local`、挂一个不同的 `shell` provider，每个 `inject: ['shell']` 的插件干净地重启到新实现上。s05 的 seam 建立在这一条之上。

## 可选依赖

`inject` 是硬需求。对「没有也能活」的能力，跳过 `inject`，在使用处探测：

```ts
export function apply(ctx: Context) {
  const greeter = ctx.get('greeter')   // 没有 provider 时为 undefined，插件照常跑
  console.log(greeter?.greet('maybe') ?? 'no greeter available')
}
```

区分：`ctx.<name>` 只用于**声明的注入**（property 代理是拓扑敏感的）；严格的可选读取用 `ctx.get(name)`。

## 命名

服务名在一个应用里是**扁平命名空间**。自己的服务要加前缀区分（harness 占用了 `tools`、`llm` 这类朴素名字）。官方 [subsystems](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/subsystems/README.md) 的生成 `cordis-surface` 区列出 harness 注册的每个名字。

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

---

**下一章**：[s04 · 配置与 Loader](s04-config-and-loader.md) —— `cordis.yml` 的完整形态、`Config` schema、profile/bundle。
