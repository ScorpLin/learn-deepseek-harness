# 06 · Capability Seam（shell 三角色）

对应 [s05 · Capability Seam](../../docs/s05-capability-seam.md) 和 [s05a · shell seam 源码精读](../../docs/s05a-shell-seam-deep-read.md)。无 API key。

## 运行

```sh
cd learn-deepseek-harness
./run.sh 06-seam
```

预期输出：

```
echo tool replied: [{"type":"text","text":"echo: echo hello seam"}]
```

## 三个文件对应三个角色

| 文件 | 角色 | 关键点 |
|---|---|---|
| （`@deepseek-ai/dsh-shell`，import 来的） | **Definition** | 真实抽象类 `ShellExecutor`，`super(ctx, 'shell')` 注册 `ctx.shell` |
| `echo-executor.ts` | **Provider** | `extends ShellExecutor`，实现 `resolve`/`run`/`start`；不碰 subprocess |
| `echo-tool.ts` | **Consumer** | `inject: ['tools','shell']`，`defineTool` 包装成 `echo` 工具 |

## 关键点：provider 可替换

Consumer 只依赖 `ctx.shell` 接口，不 import 具体 provider。所以「换 provider = 改 `cordis.yml` 一行，不动 Consumer」。你可以自己写一个 `ReverseExecutor`（把命令倒着输出），替换 `cordis.yml` 里的 `echo-executor.ts`，Consumer 一行都不用改——这就是 seam 的意义。

## 试着改

1. 再写一个 `ReverseExecutor`（`run` 返回 `command.split('').reverse().join('')`），替换 `cordis.yml` 里的 provider，看输出变化、Consumer 不变。
2. 同时挂两个 provider，看「重复注册 `ctx.shell`」如何响亮失败（`ShellExecutor` 的 JSDoc 写了：loading a second throws）。
3. 删掉 `echo-executor.ts`，看 `echo-tool` 停在 PENDING（它 `inject: ['shell']` 但没人提供）。

## 关键点

- `resolve(request): Spec` 是「显式 > 隐式」：Provider 在 owning 实现里做默认化，`run` 收到的是完整 spec。
- Consumer 的 `inject` 同时列了 `tools`（注册工具）和 `shell`（消费能力）——两个不同服务，各司其职。
