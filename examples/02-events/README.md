# 02 · 事件与 waterfall

对应 [s02 · 事件与 waterfall](../../docs/s02-events-and-waterfall.md)。

## 运行

```sh
cd learn-deepseek-harness
./run.sh 02-events
```

预期输出（注意：`[stats]` 那几行和 `HELLO/** BLOCKED **` 的先后顺序可能因异步加载而略有不同，内容一致即可）：

```
[stats] tool_call -> 1
[stats] tool_call -> 2
[stats] prompt -> 1
HELLO
** BLOCKED **
```

## 试着改

1. 在 `reporter.ts` 里把 `ctx.stats.bump('prompt')` 删掉，看输出少哪一行。
2. 在 `waterfall-demo.ts` 里，把监听器 2 的 `return next()` 改成 `return 'vetoed'`（不调 `next()`），看 `hello` 那一路发生什么——理解「短路」。
3. 给监听器 1 故意漏写 `next()`，看下游如何被静默吞掉——这是最常踩的坑。

## 关键点

- `ctx.on()` 是 effect，插件卸载时监听器自动移除。
- `import type {} from './stats.ts'` 把 `Events` 声明合并带进来，零运行时 import。
- waterfall 监听器必须 `next()` 委托；不调就是短路。
