# 05 · 注册一个工具（走真实执行管线）

对应 [s08 · Tools](../../docs/s08-tools.md) 和 [s12 · 写一个工具](../../docs/s12-write-a-tool.md)。无 API key，不调模型。

## 运行

```sh
cd /Users/bytedance/github/learn-deepseek-harness
./run.sh 05-tool
```

预期输出（顺序可能略有不同）：

```
[tool-logger] greet -> Hello, Cordis!
tool replied: [{"type":"text","text":"Hello, Cordis!"}]
```

注意 logger 先打：`tools/result` 在结果物化时发出，早于 `execute` 的 promise 解析给调用方。

## 这个例子在演示什么

- `inject: ['tools']`（s03）让插件等工具注册表就绪。
- `ctx.tools.register(defineTool(...))` 的 disposer 自动挂到插件（s01），卸载即取消注册。
- `defineTool` 把 `parameters` 转成给模型的 JSON Schema、推断 `args` 类型、执行前校验模型给的参数。
- 两个插件互不知道对方存在——注册表服务 + `tools/result` 事件把它们连起来（s02 + s03）。
- `@deepseek-ai/dsh-tools` `inject` 了 `systemPrompt` 服务（工具要给 prompt 贡献 schema），所以 composition 里列了 `dsh-system-prompt`。

## 试着改

1. 删掉 `- name: '@deepseek-ai/dsh-system-prompt'`，看 `dsh-tools` 停在 PENDING，什么都不打印（s01 的诊断技能）。
2. 给 `greet-tool` 加一个 `tools/pre-execute` 监听器返回 `deny`，看调用如何被拒绝（s16 的权限门）。

## 关键点

这是「从零写一个真工具」的最小闭环：定义 → 注册 → 走管线 → 观察结果。
