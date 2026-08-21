# 小作业 · 演示动画

每个练习的「答案」像程序执行一样逐步播放。点「↻ 重播」再看一遍。动画里的每一步，就是你在做练习时应该自己在脑子里过一遍的执行顺序。

<script setup>
const s01Steps = [
  { label: 'apply(ctx) 被 Cordis 调用', detail: '插件开始加载，fiber 进入 LOADING', color: '#38bdf8' },
  { label: 'ctx.plugin(heartbeat) 挂载子插件', detail: '输出 "heartbeat plugin loading"', code: 'const fiber = ctx.plugin(heartbeat)', color: '#38bdf8' },
  { label: 'ctx.effect(body) 执行 body', detail: 'setInterval 启动，每 200ms 一次', code: 'ctx.effect(() => { const t = setInterval(...); return () => clearInterval(t) })', color: '#38bdf8' },
  { label: '每 200ms → 输出 tick', detail: 'timer 持续触发（示意 3 次）', code: 'tick  tick  tick', color: '#fbbf24' },
  { label: '700ms 后 fiber.dispose()', detail: '父插件里 setTimeout 到期，调用 dispose', code: 'await fiber.dispose()', color: '#fbbf24' },
  { label: 'disposer 执行 → clearInterval', detail: '输出 "heartbeat cleaned up"（effect 逆序撤销）', code: 'heartbeat cleaned up', color: '#34d399' },
  { label: '输出 disposed → 进程退出', detail: '所有 effect 撤销完成，fiber 进入 DISPOSED', color: '#34d399' },
]

const s02Steps = [
  { label: "ctx.waterfall('demo/transform', 'hello', default)", detail: '第一次调用，输入 hello', color: '#a78bfa' },
  { label: '监听器1 收到 hello → 调 next()', detail: '继续往下委托（包装者）', color: '#a78bfa' },
  { label: '监听器2 收到 hello（不含 blocked）→ 调 next()', detail: '放行', color: '#a78bfa' },
  { label: '最内层 default 返回 hello', detail: '默认函数执行', color: '#a78bfa' },
  { label: '监听器1 把结果 toUpperCase', detail: '包装下游结果', code: "return downstream.toUpperCase()", color: '#fbbf24' },
  { label: '输出 HELLO', detail: '第一次调用完成', color: '#34d399' },
  { label: "第二次 blocked words → 监听器2 短路", detail: '含 blocked，直接 return，不调 next()', code: "return '** blocked **'", color: '#f87171' },
  { label: '监听器1 toUpperCase → 输出 ** BLOCKED **', detail: '下游和 default 都没执行（veto 短路）', color: '#34d399' },
]

const s03Steps = [
  { label: 'Loader 读 cordis.yml，条目并发启动', detail: 'greeter 和 consumer 同时挂载', color: '#38bdf8' },
  { label: 'greeter.apply → ctx.plugin(GreeterService)', detail: '注册服务到 ctx.greeter', code: "super(ctx, 'greeter')", color: '#38bdf8' },
  { label: 'consumer 声明 inject:["greeter"] → PENDING', detail: '依赖还没就绪，安静等待', color: '#fbbf24' },
  { label: 'greeter 服务就绪 → consumer PENDING → ACTIVE', detail: '依赖驱动加载：顺序由依赖决定，不由文件顺序', color: '#fbbf24' },
  { label: "consumer.apply → ctx.greeter.greet('world')", detail: '调用服务方法', code: "ctx.greeter.greet('world')", color: '#34d399' },
  { label: "输出 Hello, world!", detail: '进程跑完退出', color: '#34d399' },
]

const s05Steps = [
  { label: 'Loader 挂 dsh-tools + dsh-system-prompt', detail: '工具注册表 + 提示词组装服务', color: '#a78bfa' },
  { label: 'echo-executor.apply → ctx.plugin(EchoExecutor)', detail: 'Provider 注册 ctx.shell（真实 ShellExecutor 接口）', color: '#38bdf8' },
  { label: 'echo-tool (inject:["tools","shell"]) 等 shell 就绪', detail: 'Consumer 声明依赖，PENDING 等待', color: '#fbbf24' },
  { label: 'echo-tool.apply → defineTool 注册 echo 工具', detail: '把 shell 能力包装成模型可调工具', color: '#fbbf24' },
  { label: 'ctx.tools.execute → ctx.shell.resolve(request)', detail: '请求 → 解析成完整 spec（显式 > 隐式）', code: "ctx.shell.resolve({ command: 'echo hi' })", color: '#34d399' },
  { label: 'ctx.shell.run(spec) → EchoExecutor 回显', detail: 'Provider 执行，不碰 subprocess', color: '#34d399' },
  { label: '输出 echo tool replied: ...', detail: 'Consumer 拿到结果，管线走完', color: '#34d399' },
]

const s08Steps = [
  { label: 'defineTool 注册 greet 工具', detail: 'parameters + output.schema + output.render + execute', color: '#a78bfa' },
  { label: "ctx.tools.execute({ name:'greet', arguments:{name:'Cordis'} })", detail: '代替模型发起一次调用', color: '#38bdf8' },
  { label: '校验 arguments → 通过', detail: 'defineTool 自动校验模型给的参数', color: '#38bdf8' },
  { label: 'tools/pre-execute（waterfall）→ 放行', detail: '权限门调 next()（若 return deny 则拒绝）', color: '#fbbf24' },
  { label: 'execute → 返回 Hello, Cordis!', detail: '真正干活', code: "return 'Hello, ' + args.name + '!'", color: '#34d399' },
  { label: "tools/result 发出 → 监听器打印 [tool-logger] ...", detail: '结果物化时广播，早于 execute 的 promise 解析', color: '#34d399' },
  { label: '调用方收到 result', detail: '执行管线完整走完', color: '#34d399' },
]
</script>

## s01 · heartbeat（effect 生命周期）

对应 [s01 小作业](/docs/s01-cordis-foundation)。

<ExerciseDemo :steps="s01Steps" />

## s02 · waterfall（包装 vs 短路）

对应 [s02 小作业](/docs/s02-events-and-waterfall)。

<ExerciseDemo :steps="s02Steps" :interval="1200" />

## s03 · 服务与依赖注入

对应 [s03 小作业](/docs/s03-services-and-inject)。

<ExerciseDemo :steps="s03Steps" :interval="1200" />

## s05 · capability seam（三角色）

对应 [s05 小作业](/docs/s05-capability-seam)。

<ExerciseDemo :steps="s05Steps" :interval="1300" />

## s08 · 工具执行管线

对应 [s08 小作业](/docs/s08-tools)。

<ExerciseDemo :steps="s08Steps" :interval="1300" />

---

这些动画是「你脑子里应该有的执行顺序」。做完练习后，再看一遍动画，确认每一步你都能对上号；对不上，说明那一步的机制还没吃透，回正文重读。
