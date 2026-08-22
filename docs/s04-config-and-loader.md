# s04 · 配置与 Loader

> **一句话**：`cordis.yml` 的每个条目可以带一个 `config` 块，插件声明一个 schema 在 `apply` 前校验它。**坏配置响亮失败**——插件永远不会半初始化地启动。

## 是什么

每个 `cordis.yml` 条目除了 `name`，还能带 `config`、`id`、`disabled` 等元数据：

```yaml
- id: greeter            # 稳定身份，HMR 靠它 diff 编辑
  name: './greeter.ts'
  config:
    greeting: 'Hi'
- id: consumer
  name: './consumer.ts'
  disabled: true         # 保留条目，但不挂载
```

- `id`：给条目稳定身份，让 loader 区分「编辑已有条目」和「删除 + 新增」。没有 `id` 的条目每次读都生成新 id，于是任何 config 编辑都会把它当成「删除+新增」而重挂载。
- `disabled: true`：卸载但不删条目——翻回来就重新加载（连同 PENDING 依赖它的插件）。
- `config`：传给插件的配置，`apply(ctx, config)` 收到的是**校验补全后的完整配置**。

## 为什么：配置要「先校验、再启动」

插件声明 schema，loader 在 `apply` 前校验。坏配置让 fiber 进 `FAILED`，进程响亮报错——而不是带着半个配置启动、运行到一半才炸。这是「fail loud at load」原则的体现。

## 怎么做：声明 schema

用 [Schemastery](https://github.com/shigma/schemastery)（vendored 在 `vendor/schemastery/`）。注意 `Config` 既是 TypeScript 接口又是同名运行时 schema：

```ts
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'

export const name = 'config-demo'

export interface Config {
  greeting: string
  targets: string[]
}

export const Config: Schema<Config> = Schema.object({
  greeting: Schema.string().default('Hello'),
  targets: Schema.array(String).default(['world']),
})

export function apply(ctx: Context, config: Config) {
  for (const target of config.targets) console.log(config.greeting + ', ' + target + '!')
}
```

配置它：

```yaml
- name: './config-demo.ts'
  config:
    targets: ['alpha', 'beta']
```

`greeting` 省略了，schema 默认值补齐——`apply` 永远收到完整、校验过的 config。喂一个坏值（如 `targets: 'not-an-array'`），会得到 `ValidationError`，fiber `FAILED`，进程 exit 1。

## 计算出的配置值：`!!js`

loader 支持 `!!js` 标签，在加载时计算配置值：

```yaml
- name: './config-demo.ts'
  config:
    greeting: !!js process.env.DEMO_GREETING ?? 'Hello'
```

加载时把 `!!js` 后面的表达式**当场求值**——上面这行读环境变量 `DEMO_GREETING`，没设置就用 `'Hello'` 兜底。同一份 `cordis.yml`，换个环境得到不同配置，文件本身一行不用改。

`!!js` 只在 `config` 和条目的 `disabled` 字段里有效。其它元数据（`name`、`id`、`inject`）保持字面。原因是这些字段分两类：`config` 是**数据**（加载后才交给插件用，可以活），`name`/`id`/`inject` 是**结构**（loader 要拿它们搭依赖图，必须静态）——你不可能在插件运行前就动态算出「它依赖谁」。

## profile 与 bundle（组装的上层）

单条目之上，是 profile 和 bundle（s00 已给地图，这里点到为止）。一句话分清身份：**bundle 是「货」，profile 是「单」，运行中的 dsh 是「成品」。**

- **bundle**：一个 npm 包，装着一批配置行 + 挂载代码，打包成可分发、可复用的一块。它在 `package.json` 里声明 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`——「我是一盒套装，配置清单在这份 patch 里」。
- **profile**：一个命名组合，列它按序叠加的 bundle，再加用户自己的 `cordis.patch.yml`。它落在 `$DSH_HOME/profiles/<name>/` 目录，`dsh.profile` 写死叠哪些 bundle。

harness 内置两套 profile 模板（`packages/boot/app-boot/src/profile.ts`）：

```ts
web:      ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app'],
headless: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-headless'],
```

`web` 就是「base 套装（模型/工具/持久化…）+ web-app 套装（网页界面）」按序叠两层。你平时用的 dsh 网页端就是这份单子的成品——`webserver` 那行定端口（默认 3080）、`ui-conversation` 画聊天区、`ui-sidebar` 画侧栏，每一块界面都能在 web-app 套装的 patch 里找到对应行。

层叠顺序：**bundle 按 `dsh.profile` 顺序从下往上叠 → 用户自己的 `cordis.patch.yml` → `--patch` 覆盖层**。像 PS 图层：官方套装在下面，你的改动盖在最上面。看最终成品：

```sh
dsh --profile web --dump-config
```

> **这是 dsh 定义的概念，不是上游 Cordis 的**：Cordis 只提供「patch 怎么叠一层」（vendor 里的 include 插件），dsh 在它之上定义「层从哪来、怎么命名」——bundle 是层、profile 是组合方案。`profile` 这个名字在上游 Cordis 里根本不存在。

## HMR（热替换）

因为卸载释放 effect（s01）+ 加载跟随依赖（s03），HMR 能「卸载一个运行中的插件 → 加载新代码」来替换它。`@deepseek-ai/cordis-plugin-hmr` 监听文件，保存即热重载。

HMR 本身没发明任何新机制——那个插件只做一件事：监听到保存，就「卸载旧插件、用新代码重载」。剩下的清理（逆序跑 effect）与连带重载（依赖跟随）全是 s01/s03 自动完成的。这正是 effect + 依赖驱动加载两个机制的推论：换零件能热插拔，是因为零件天生设计成「可干净卸下、可重新接上」。这也是为什么前几章是地基。

## 读源码

- `vendor/loader/src/` —— Loader 如何读 `cordis.yml`、按 `id` diff 条目、挂载/卸载/重配置。
- `vendor/include/src/` —— `!!js` 解析、patch 叠加、`--dump-config` 打印的算法。
- `packages/boot/app-boot/` —— profile/bundle 的组装。

## 自测

1. `config` 块和 `apply(ctx, config)` 的关系？为什么说「apply 收到完整配置」？
2. 坏配置会导致什么？为什么这是「响亮失败」而不是「半初始化」？
3. `id` 的作用？没有 `id` 的条目在 config 编辑时会发生什么？
4. `!!js` 能在哪些字段用？
5. HMR 为什么能工作？它依赖前面哪两个机制？


## 小作业

动手写，先不看 [examples/04-config](../examples/04-config/README.md)。

1. **写带 `Config` schema 的插件**：`interface Config` + `export const Config: Schema<Config>`（Schemastery），字段 `greeting`（默认 Hello）+ `targets`（默认 ['world']）。
   **达标标准**：能默写「同名类型 + 值共存」这一形态（`interface Config` 是类型、`const Config` 是运行时 schema），说清它为什么既是类型又是运行时校验器。
2. **喂一个坏配置**（`targets: 'not-an-array'`），确认 `ValidationError` + exit 1。
   **达标标准**：能说清「坏配置响亮失败」和「半初始化启动」的区别。
---

**阶段一完成。** 你已经吃透 Cordis 的四个地基：插件/effect（s01）、事件/waterfall（s02）、服务/inject（s03）、配置/loader（s04）。**停下来，自己重建一遍**：写一个 `Service`，挂一个 `ctx.on`，配一个 `Config`，跑通。

**下一阶段**：[s05 · Capability Seam](s05-capability-seam.md) —— 把这些地基拼成 harness 的「可替换能力」范式。
