# 03 · 服务与依赖注入

对应 [s03 · 服务与依赖注入](../../docs/s03-services-and-inject.md)。

## 运行

```sh
cd learn-deepseek-harness
./run.sh 03-services
```

预期输出：

```
Hello, world!
```

## 试着改

1. 把 `cordis.yml` 里两行互换，输出不变——**顺序由 `inject` 决定，不由文件顺序**。
2. 删掉 `- name: './greeter.ts'` 这行，再跑——consumer 停在 PENDING，什么都不打印，进程静默退出（exit 0）。这是「插件没反应」的典型原因。
3. 把 `cordis.yml` 换成挂 `optional.ts`（可选依赖版），分别在有/无 provider 时观察输出。

## 关键点

- `super(ctx, 'greeter')` 注册服务到 `ctx.greeter`；`declare module` 让类型通过（纯编译时）。
- `inject: ['greeter']` 让 consumer 等 provider 就绪才 `apply`。
- `inject` 是硬依赖；可选依赖用 `ctx.get('greeter')` 现场探测。
