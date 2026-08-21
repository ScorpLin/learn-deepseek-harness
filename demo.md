# 小作业 · 演示动画

每个练习的「答案」按**代码执行顺序**逐步播放：每步 = 一段实际代码 + 注释（这行干嘛）+ 输出（执行效果）。像调试器单步执行。点「⏭ 下一步」手动跟，或「▶ 播放」自动走。

<script setup>
const s01Steps = [
  { code: "ctx.effect(() => {", comment: '挂一个可撤销副作用：body 在加载时执行', color: '#38bdf8' },
  { code: "  const t = setInterval(() => console.log('tick'), 200)", comment: 'body 里启动定时器', output: 'tick tick tick …', color: '#fbbf24' },
  { code: "  return () => clearInterval(t)", comment: '返回的 disposer 负责清理', color: '#38bdf8' },
  { code: "})", color: '#38bdf8' },
  { code: "const fiber = ctx.plugin(heartbeat)", comment: '从代码挂一个子插件，拿到 fiber 句柄', color: '#38bdf8' },
  { code: "await fiber.dispose()", comment: '触发卸载，逆序执行 disposer', output: 'heartbeat cleaned up', color: '#34d399' },
]

const s02Steps = [
  { code: "ctx.waterfall('demo/transform', 'hello', async () => 'default')", comment: '发起调用：最后一个参数是最内层默认值', color: '#a78bfa' },
  { code: "return (await next()).toUpperCase()", comment: '监听器1（最外层）：调 next() 拿下游结果再改', color: '#38bdf8' },
  { code: "if (input.includes('blocked')) return '** blocked **'", comment: '监听器2：含 blocked 就直接 return，不调 next()', color: '#f87171' },
  { code: "return next()", comment: '否则放行，落到默认函数', color: '#38bdf8' },
  { code: "async () => 'default'", comment: '最内层默认函数执行', output: "hello → HELLO", color: '#34d399' },
  { code: "ctx.waterfall('demo/transform', 'blocked words', ...)", comment: '第二次调用，含 blocked', output: "** blocked ** → ** BLOCKED **（下游没执行）", color: '#f87171' },
]

const s03Steps = [
  { code: "super(ctx, 'greeter')", comment: 'Provider：super(ctx, name) 注册到 ctx.greeter', color: '#38bdf8' },
  { code: "export const inject = ['greeter']", comment: 'Consumer：声明硬依赖', color: '#fbbf24' },
  { code: "// consumer 处于 PENDING", comment: '依赖没就绪，安静等待', output: '（无输出）', color: '#fbbf24' },
  { code: "// greeter 服务就绪 → consumer 激活", comment: '依赖驱动加载：顺序由依赖决定', color: '#34d399' },
  { code: "ctx.greeter.greet('world')", comment: 'apply 里调用服务方法', output: 'Hello, world!', color: '#34d399' },
  { code: "const g = ctx.get('greeter')", comment: '可选依赖：没有就 undefined，不阻塞', color: '#38bdf8' },
]

const s04Steps = [
  { code: "greeting: Schema.string().default('Hello')", comment: '声明 schema：greeting 有默认值', color: '#38bdf8' },
  { code: "// cordis.yml 里只给了 targets: ['alpha','beta']", comment: 'greeting 省略', color: '#fbbf24' },
  { code: "apply(ctx, config)", comment: '收到校验补全后的 config', output: 'config.greeting = "Hello"', color: '#34d399' },
  { code: "console.log(config.greeting + ', ' + target + '!')", comment: '遍历 targets 打印', output: 'Hello, alpha!\nHello, beta!', color: '#34d399' },
  { code: "targets: 'not-an-array'", comment: '喂一个坏值', color: '#f87171' },
  { code: "// schemastery 校验失败", comment: '响亮失败，不是半初始化', output: 'ValidationError → exit 1', color: '#f87171' },
]

const s05Steps = [
  { code: "abstract class ShellExecutor extends Service { super(ctx, 'shell') }", comment: 'Definition：占 ctx.shell，声明抽象方法', color: '#a78bfa' },
  { code: "class EchoExecutor extends ShellExecutor { ... }", comment: 'Provider：实现 resolve/run/start', color: '#38bdf8' },
  { code: "export const inject = ['tools', 'shell']", comment: 'Consumer：声明依赖', color: '#fbbf24' },
  { code: "ctx.tools.register(defineTool({ name: 'echo', ... }))", comment: '把 shell 能力包装成模型工具', color: '#38bdf8' },
  { code: "ctx.shell.resolve({ command: 'echo hi' })", comment: '请求 → 解析成完整 spec（显式 > 隐式）', color: '#34d399' },
  { code: "await ctx.shell.run(spec)", comment: 'Provider 执行', output: 'echo: echo hi', color: '#34d399' },
]

const s06Steps = [
  { code: "this.inbox.claim(target, turn)", comment: '认领输入：从 inbox 取消息', color: '#38bdf8' },
  { code: "this.session.append('turn/start', { turn })", comment: '打开 turn，先写日志', color: '#a78bfa' },
  { code: "this.dispatch.waterfall('agent/pre-step', { messages }, next)", comment: '扩展点：可改写消息或 reject，这里放行', color: '#fbbf24' },
  { code: "this.session.append('step/start', { turn, step })", comment: '打开一步', color: '#38bdf8' },
  { code: "buildRequest(turn, step, tools, system, this.session.deriveMessages())", comment: '从 log 投影历史，组装请求', color: '#38bdf8' },
  { code: "for await (const chunk of llm.stream(request)) append('assistant/chunk', chunk)", comment: '逐 token 流回并落日志', output: 'chunk chunk chunk …', color: '#38bdf8' },
  { code: "executeToolCalls(...)", comment: '若模型要调工具', output: 'tool/result 写回 log', color: '#fbbf24' },
  { code: "this.session.append('turn/end', { turn, reason })", comment: '关 turn', color: '#34d399' },
]

const s08Steps = [
  { code: "ctx.tools.register(defineTool({ name: 'greet', parameters, output, execute }))", comment: '注册一个工具', color: '#a78bfa' },
  { code: "ctx.tools.execute({ callId, name: 'greet', arguments, signal })", comment: '发起一次调用（代替模型）', color: '#38bdf8' },
  { code: "// defineTool 自动校验 arguments", comment: '模型给的参数先过 schema', color: '#38bdf8' },
  { code: "ctx.on('tools/pre-execute', (exec, next) => next())", comment: '权限门：调 next() 放行 / return deny 拒绝', color: '#fbbf24' },
  { code: "async execute(args) { return 'Hello, ' + args.name + '!' }", comment: '真正干活', output: 'Hello, Cordis!', color: '#34d399' },
  { code: "ctx.on('tools/result', (exec, result) => ...)", comment: '观察最终结果（只读，深冻结）', output: '[tool-logger] greet -> Hello, Cordis!', color: '#34d399' },
]

const s10Steps = [
  { code: "ctx.tools.register(defineTool({ name: 'greet', ... }))", comment: '全局注册 greet 工具', color: '#38bdf8' },
  { code: "agent.ctx.tools.register(defineTool({ name: 'greet', ... 变体 }))", comment: '作用域内注册同名 greet（scope-local）', color: '#a78bfa' },
  { code: "// 该 agent 调用 greet 时", comment: 'most-specific-wins', output: '用作用域内的变体（shadowing）', color: '#fbbf24' },
  { code: "ctx.tools.restrict(scope, ['bash'])", comment: 'restriction：过滤全局工具集（取交集）', color: '#38bdf8' },
  { code: "// 被过滤掉的工具", comment: 'prompt 里不可见 + 拒绝执行，和不存在不可区分', color: '#f87171' },
]

const s11Steps = [
  { code: "ctx.llm.registerAdapter(['deepseek'], adapter)", comment: 'Provider 注册：挂进 ctx.llm', color: '#38bdf8' },
  { code: "abstract stream(options): AsyncIterable<StreamChunk>", comment: 'Definition：唯一抽象方法是 stream', color: '#a78bfa' },
  { code: "buildRequest(turn, step, tools, system, session.deriveMessages())", comment: '组装请求（Message/ContentBlock 词汇）', color: '#38bdf8' },
  { code: "for await (const chunk of adapter.stream(request))", comment: '吐 StreamChunk', output: 'text-delta / tool-call / finish', color: '#38bdf8' },
  { code: "// 换模型", comment: '换 adapter = 改配置，loop 不动', color: '#34d399' },
]

const s13Steps = [
  { code: "ctx.subagents.start({ provider: 'spawn-in-process', ... })", comment: '父 agent 发起委派', color: '#a78bfa' },
  { code: "// provider spawn 一个子 agent", comment: '独立上下文、独立 session', color: '#38bdf8' },
  { code: "// 子 agent 拿不到父的 scope-local 注册", comment: '作用域不继承到子 agent', color: '#f87171' },
  { code: "// 谱系用 lineage 数据携带", comment: 'parentSession / delegationDepth / subagentDepth', color: '#38bdf8' },
  { code: "return subagentResult", comment: '结果返回给父 agent', output: 'tool/result', color: '#34d399' },
]

const s14Steps = [
  { code: "// 会话前缀里列出技能目录", comment: '只有 SkillSummary（name + description）', color: '#38bdf8' },
  { code: "模型判断需要某个技能 → 调 skill 工具", comment: '渐进披露：先摘要，再按需', color: '#fbbf24' },
  { code: "skill.load(name)", comment: '加载完整 SkillDefinition（正文内容）', color: '#38bdf8' },
  { code: "agent.inject(skillContent)", comment: '内容注入进上下文，不常驻', color: '#38bdf8' },
  { code: "// 模型按技能指令干活", output: '任务执行', color: '#34d399' },
]

const s15Steps = [
  { code: "ctx.workflowEngine.run({ script, meta })", comment: '模型调 workflow 工具，发起编排', color: '#a78bfa' },
  { code: "// worker 线程引擎解析脚本", comment: 'fan-out 到多个子 agent', color: '#38bdf8' },
  { code: "parallel([task1, task2, task3, ...])", comment: '并发派发，各自独立工作', color: '#38bdf8' },
  { code: "// 结构化子进程：受限 prompt/工具集 + 单调工具守卫", comment: '子 agent 只能用固定工具，不能再注册', color: '#fbbf24' },
  { code: "return aggregatedResult", comment: '结构化结果汇总', output: 'workflow/result', color: '#34d399' },
]

const s16Steps = [
  { code: "// 模型返回 tool/call { name: 'bash', arguments: {...} }", comment: '想执行一条命令', color: '#a78bfa' },
  { code: "ctx.on('tools/pre-execute', (exec, next) => {", comment: '权限门挂在执行前', color: '#38bdf8' },
  { code: "if (!(await isAllowed(exec))) return { kind: 'deny', reason }", comment: '拒绝：return 短路', output: 'denied', color: '#f87171' },
  { code: "return next()", comment: '允许：调 next() 放行', color: '#34d399' },
  { code: "// 或返回 ask，走 ctx.approval 由 answerer 回答", comment: '审批：区别于普通提问', color: '#fbbf24' },
]

const s17Steps = [
  { code: "ctx.goals.create({ objective, maxGoalRounds })", comment: '创建一个持久完成目标', output: 'goal: active', color: '#a78bfa' },
  { code: "// activation: armed", comment: '进程本地允许再接纳一轮', color: '#38bdf8' },
  { code: "// 一轮 goal round = 一个 goal-sourced turn", comment: '由 goal 驱动，而非用户新消息', color: '#38bdf8' },
  { code: "// 完成 → complete；卡住 → blocked（带原因）", comment: '阶段：active/paused/blocked/complete', color: '#fbbf24' },
  { code: "// resume/fork 需要重新授权", comment: 'activation 刻意不在持久回放里', color: '#f87171' },
]

const s18Steps = [
  { code: "ctx.on('tools/pre-execute', ...)", comment: '能力级拒绝：决定「要不要执行」', color: '#38bdf8' },
  { code: "ctx.sandbox.resolve(policy)", comment: '进程级约束：决定「怎么执行」', color: '#fbbf24' },
  { code: "spawn(confinedArgv)", comment: 'provider 包裹 argv（ConfinedArgv）', color: '#38bdf8' },
  { code: "// 进程在沙箱里运行，文件操作受约束", output: 'file access denied under <mode>', color: '#f87171' },
  { code: "// 一个执行世界", comment: '换 fs/subprocess provider，bash/PTY/LSP 一起搬', color: '#34d399' },
]
</script>

## s01 · 插件与 effect

对应 [s01 小作业](/docs/s01-cordis-foundation)。

<ExerciseDemo :steps="s01Steps" />

## s02 · 事件与 waterfall

对应 [s02 小作业](/docs/s02-events-and-waterfall)。

<ExerciseDemo :steps="s02Steps" :interval="1400" />

## s03 · 服务与依赖注入

对应 [s03 小作业](/docs/s03-services-and-inject)。

<ExerciseDemo :steps="s03Steps" :interval="1400" />

## s04 · 配置校验

对应 [s04 小作业](/docs/s04-config-and-loader)。

<ExerciseDemo :steps="s04Steps" :interval="1400" />

## s05 · capability seam

对应 [s05 小作业](/docs/s05-capability-seam)。

<ExerciseDemo :steps="s05Steps" :interval="1500" />

## s06 · Agent Loop

对应 [s06 小作业](/docs/s06-agent-loop)。

<ExerciseDemo :steps="s06Steps" :interval="1500" />

## s08 · 工具执行管线

对应 [s08 小作业](/docs/s08-tools)。

<ExerciseDemo :steps="s08Steps" :interval="1400" />

## s10 · Scope 作用域

对应 [s10 小作业](/docs/s10-scope)。

<ExerciseDemo :steps="s10Steps" :interval="1400" />

## s11 · LLM Adapter

对应 [s11 小作业](/docs/s11-llm-adapter)。

<ExerciseDemo :steps="s11Steps" :interval="1400" />

## s13 · Subagent 委派

对应 [s13 小作业](/docs/s13-subagent)。

<ExerciseDemo :steps="s13Steps" :interval="1400" />

## s14 · Skill 按需加载

对应 [s14 小作业](/docs/s14-skill)。

<ExerciseDemo :steps="s14Steps" :interval="1400" />

## s15 · Workflow 编排

对应 [s15 小作业](/docs/s15-workflow)。

<ExerciseDemo :steps="s15Steps" :interval="1400" />

## s16 · 权限门

对应 [s16 小作业](/docs/s16-permission-approval)。

<ExerciseDemo :steps="s16Steps" :interval="1400" />

## s17 · Goal 生命周期

对应 [s17 小作业](/docs/s17-goal-plan)。

<ExerciseDemo :steps="s17Steps" :interval="1400" />

## s18 · 沙箱与执行世界

对应 [s18 小作业](/docs/s18-sandbox-execution)。

<ExerciseDemo :steps="s18Steps" :interval="1400" />

---

这些动画是「你脑子里应该有的执行顺序」：每一行代码做了什么、输出了什么。做完练习后对照着走一遍，对不上就回正文重读。
