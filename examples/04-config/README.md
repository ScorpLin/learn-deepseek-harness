# 04 · 配置与 Loader

对应 [s04 · 配置与 Loader](../../docs/s04-config-and-loader.md)。

## 运行

```sh
cd /Users/bytedance/github/learn-deepseek-harness
./run.sh 04-config
```

预期输出：

```
Hello, alpha!
Hello, beta!
```

`greeting` 省略了，schema 默认值 `Hello` 补齐了它。

## 试着改

1. 把 `cordis.yml` 的 `targets` 改成字符串 `'not-an-array'`，看 `ValidationError` 和 exit 1——坏配置响亮失败。
2. 加 `greeting: 'Hi'` 覆盖默认值。
3. 把 `greeting` 改成 `!!js process.env.DEMO_GREETING ?? 'Hello'`，用 `DEMO_GREETING=Yo ./run.sh 04-config` 跑（注意 run.sh 用 `exec` 前要 export）。

## 关键点

- `Config` 既是 TS 接口又是运行时 schema；`apply(ctx, config)` 收到完整校验过的 config。
- `!!js` 只在 `config` 和 `disabled` 字段有效。
