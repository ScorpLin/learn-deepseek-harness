# 小作业（Exercises）

每章的 `## 小作业` 是一道**动手题**，配一条「达标标准」。规则只有一条，照搬 learn-claude-code 的教学法：

> **先不看答案，自己写；写到能「凭记忆默写」为止，才算过。**

读一遍 ≠ 学会。「你能不看文档写出最小版本」才是学完的标志。

## 怎么做

1. 读某章的正文（是什么 / 为什么 / 怎么做 / 读源码）。
2. 翻到该章 `## 小作业`，关掉文档，动手写。
3. 对照「达标标准」自检——不是「我看懂了」，而是「我能默写」。
4. 写不出来？回正文重读，或看下面的参考答案，然后**再默写一遍**。

## 参考答案在哪

| 小作业 | 参考答案 |
|---|---|
| s01 heartbeat / effect | [examples/01-first-plugin](../examples/01-first-plugin/README.md)，或本目录 [answers/01-heartbeat.ts](answers/01-heartbeat.ts) |
| s02 emit + waterfall | [examples/02-events](../examples/02-events/README.md) |
| s03 Service + inject | [examples/03-services](../examples/03-services/README.md) |
| s04 Config schema | [examples/04-config](../examples/04-config/README.md) |
| s05 最小 seam（两个 provider） | [examples/06-seam](../examples/06-seam/README.md)，换 provider 见 [answers/05-reverse-executor.ts](answers/05-reverse-executor.ts) |
| s06 turn flow 时序图 | 对照 [s06 正文](../docs/s06-agent-loop.md) 的时序图 |
| s07 反例 | 对照 [s07 正文](../docs/s07-session-log.md) 的铁律 |
| s08 defineTool + deny 门 | [examples/05-tool](../examples/05-tool/README.md)，deny 门见 [answers/08-deny-gate.ts](answers/08-deny-gate.ts) |
| s09 ~ s19（概念型，s12/s16 除外） | 各章 `## 自测` + 正文「读源码」段 |
| s12 写一个完整工具（编码型） | [examples/05-tool](../examples/05-tool/README.md) 的 `defineTool` 全字段结构 |
| s16 permission-gate（编码型） | 本目录 [answers/08-deny-gate.ts](answers/08-deny-gate.ts) |

## 运行参考答案

阶段一的答案是 Cordis 代码，可一键跑（需 `deepseek-harness` checkout）：

```sh
# 把答案拷进 harness tmp/ 运行（和 examples 同一个 run.sh 约定）
./run.sh 01-first-plugin   # 例子即答案
```

`answers/` 里的 `.ts` 是「换个写法的参考答案」，可直接读，或拷进对应例子目录用 `node --import tsx ../../vendor/cordis/bin.js` 手动跑。

## 达标标准的含义

「达标标准」不是及格线，是**「能默写」的等价物**。每章的达标标准 = 该章那个「最小版本」的核心。比如：

- s01 达标 = 能默写 `ctx.effect` 的 body/disposer 两段。
- s03 达标 = 能默写 `super(ctx, 'greeter')` + `inject` 的完整形态。
- s08 达标 = 能默写 `parameters/output/execute` + 管线四点。

**卡住时，回正文重读，而不是「大概懂了」往下走。**
