# 01 · 第一个插件

对应 [s01 · Cordis 地基](../../docs/s01-cordis-foundation.md)。

## 运行

需要一份 `deepseek-harness` checkout（`pnpm install` 过）。把下面路径换成你机器上的实际路径：

```sh
cd /Users/bytedance/github/learn-deepseek-harness/examples/01-first-plugin
node --import tsx /Users/bytedance/github/deepseek-harness/vendor/cordis/bin.js
```

预期输出：

```
hello from my first plugin
```

进程在「没什么在跑」后自己退出。

## 试一试

1. 把 `apply` 里的日志改掉，再跑，看输出变化。
2. 让 `apply` 抛 `throw new Error('boom')`，看进程如何「响亮地失败」。
3. 把 `cordis.yml` 里的 `name` 改成不存在的路径，看会发生什么（提示：拼写错误是走 logger 上报的，boot 早期可能看不到——检查拼写）。
4. 再加一个条目 `- name: './hello.ts'` 重复挂两次，观察 `apply` 被调了几次（一个条目 = 一个插件实例 = 一次 `apply`）。

## 关键点

- 插件就是 `apply(ctx)` 函数；`ctx` 是它注册一切贡献的通道。
- `cordis.yml` 是「应用由哪些插件组成」的列表。
- 启动器 `vendor/cordis/bin.js` 只做四件事：建 `Context` → 挂 Loader → Loader 读 yml → 挂你写的插件。
