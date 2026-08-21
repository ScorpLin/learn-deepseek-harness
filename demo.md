# 小作业 · 演示动画

每个练习的「答案」按**代码执行顺序**逐步播放：每步 = 一段实际代码 + 注释（这行干嘛）+ 输出（执行效果）。像调试器单步执行。点「⏭ 下一步」手动跟，或「▶ 播放」自动走。

<script setup>
const s01Steps = [{", comment: '挂一个可撤销副作用：body 在加载时执行', stage: '挂载', color: '#38bdf8' },{ code: "  const t = setInterval(() => console.log('tick'), 200)", comment: 'body 里启动定时器', output: 'tick tick tick …', stage: '执行', color: '#fbbf24' },{ code: "  return () => clearInterval(t)", comment: '返回的 disposer 负责清理', stage: '清理', color: '#38bdf8' },{ code: "},{ code: "const fiber = ctx.plugin(heartbeat)", comment: '从代码挂一个子插件，拿到 fiber 句柄', stage: '挂载', color: '#38bdf8' },{ code: "await fiber.dispose()", comment: '触发卸载，逆序执行 disposer', output: 'heartbeat cleaned up', stage: '卸载', color: '#34d399' }]

const s02Steps = [{ code: "ctx.waterfall('demo/transform', 'hello', async () => 'default')", comment: '发起调用：最后一个参数是最内层默认值', stage: '发起', color: '#a78bfa' },{ code: "return (await next()).toUpperCase()", comment: '监听器1（最外层）：调 next() 拿下游结果再改', stage: '包装', color: '#38bdf8' },{ code: "if (input.includes('blocked')) return '** blocked **'", comment: '监听器2：含 blocked 就直接 return，不调 next()', stage: '短路', color: '#f87171' },{ code: "return next()", comment: '否则放行，落到默认函数', stage: '放行', color: '#38bdf8' },{ code: "async () => 'default'", comment: '最内层默认函数执行', output: "hello → HELLO", stage: '输出', color: '#34d399' },{ code: "ctx.waterfall('demo/transform', 'blocked words', ...)", comment: '第二次调用，含 blocked', output: "** blocked ** → ** BLOCKED **（下游没执行）", stage: '短路', color: '#f87171' }]

const s03Steps = [{ code: "super(ctx, 'greeter')", comment: 'Provider：super(ctx, name) 注册到 ctx.greeter', stage: '注册', color: '#38bdf8' },{ code: "export const inject = ['greeter']", comment: 'Consumer：声明硬依赖', stage: '声明', color: '#fbbf24' },{ code: "// consumer 处于 PENDING", comment: '依赖没就绪，安静等待', output: '（无输出）', stage: '等待', color: '#fbbf24' },{ code: "// greeter 服务就绪 → consumer 激活", comment: '依赖驱动加载：顺序由依赖决定', stage: '激活', color: '#34d399' },{ code: "ctx.greeter.greet('world')", comment: 'apply 里调用服务方法', output: 'Hello, world!', stage: '调用', color: '#34d399' },{ code: "const g = ctx.get('greeter')", comment: '可选依赖：没有就 undefined，不阻塞', stage: '可选依赖', color: '#38bdf8' }]

const s04Steps = [{ code: "greeting: Schema.string().default('Hello')", comment: '声明 schema：greeting 有默认值', stage: '声明', color: '#38bdf8' },{ code: "// cordis.yml 里只给了 targets: ['alpha','beta']", comment: 'greeting 省略', stage: '配置', color: '#fbbf24' },{ code: "apply(ctx, config)", comment: '收到校验补全后的 config', output: 'config.greeting = "Hello"', stage: '校验', color: '#34d399' },{ code: "console.log(config.greeting + ', ' + target + '!')", comment: '遍历 targets 打印', output: 'Hello, alpha!\nHello, beta!', stage: '输出', color: '#34d399' },{ code: "targets: 'not-an-array'", comment: '喂一个坏值', stage: '失败', color: '#f87171' },{ code: "// schemastery 校验失败", comment: '响亮失败，不是半初始化', output: 'ValidationError → exit 1', stage: '失败', color: '#f87171' }]

const s05Steps = [{ super(ctx, 'shell') },{ ... },{ code: "export const inject = ['tools', 'shell']", comment: 'Consumer：声明依赖', stage: 'Consumer', color: '#fbbf24' },{ name: 'echo', ... },{ command: 'echo hi' },{ code: "await ctx.shell.run(spec)", comment: 'Provider 执行', output: 'echo: echo hi', stage: '执行', color: '#34d399' }]

const s06Steps = [{ code: "this.inbox.claim(target, turn)", comment: '认领输入：从 inbox 取消息', stage: '输入', color: '#38bdf8' },{ turn },{ messages },{ turn, step },{ code: "buildRequest(turn, step, tools, system, this.session.deriveMessages())", comment: '从 log 投影历史，组装请求', stage: '请求', color: '#38bdf8' },{ code: "for await (const chunk of llm.stream(request)) append('assistant/chunk', chunk)", comment: '逐 token 流回并落日志', output: 'chunk chunk chunk …', stage: '模型', color: '#38bdf8' },{ code: "executeToolCalls(...)", comment: '若模型要调工具', output: 'tool/result 写回 log', stage: '工具', color: '#fbbf24' },{ turn, reason }]

const s08Steps = [{ name: 'greet', parameters, output, execute },{ callId, name: 'greet', arguments, signal },{ code: "// defineTool 自动校验 arguments", comment: '模型给的参数先过 schema', stage: '校验', color: '#38bdf8' },{ code: "ctx.on('tools/pre-execute', (exec, next) => next())", comment: '权限门：调 next() 放行 / return deny 拒绝', stage: '权限门', color: '#fbbf24' },{ return 'Hello, ' + args.name + '!' },{ code: "ctx.on('tools/result', (exec, result) => ...)", comment: '观察最终结果（只读，深冻结）', output: '[tool-logger] greet -> Hello, Cordis!', stage: '观察', color: '#34d399' }]

const s10Steps = [{ name: 'greet', ... },{ name: 'greet', ... 变体 },{ code: "// 该 agent 调用 greet 时", comment: 'most-specific-wins', output: '用作用域内的变体（shadowing）', stage: 'shadowing', color: '#fbbf24' },{ code: "ctx.tools.restrict(scope, ['bash'])", comment: 'restriction：过滤全局工具集（取交集）', stage: '过滤', color: '#38bdf8' },{ code: "// 被过滤掉的工具", comment: 'prompt 里不可见 + 拒绝执行，和不存在不可区分', stage: '过滤', color: '#f87171' }]

const s11Steps = [{ code: "ctx.llm.registerAdapter(['deepseek'], adapter)", comment: 'Provider 注册：挂进 ctx.llm', stage: '注册', color: '#38bdf8' },{ code: "abstract stream(options): AsyncIterable<StreamChunk>", comment: 'Definition：唯一抽象方法是 stream', stage: 'Definition', color: '#a78bfa' },{ code: "buildRequest(turn, step, tools, system, session.deriveMessages())", comment: '组装请求（Message/ContentBlock 词汇）', stage: '请求', color: '#38bdf8' },{ code: "for await (const chunk of adapter.stream(request))", comment: '吐 StreamChunk', output: 'text-delta / tool-call / finish', stage: '流', color: '#38bdf8' },{ code: "// 换模型", comment: '换 adapter = 改配置，loop 不动', stage: '替换', color: '#34d399' }]

const s13Steps = [{ provider: 'spawn-in-process', ... },{ code: "// provider spawn 一个子 agent", comment: '独立上下文、独立 session', stage: 'spawn', color: '#38bdf8' },{ code: "// 子 agent 拿不到父的 scope-local 注册", comment: '作用域不继承到子 agent', stage: '隔离', color: '#f87171' },{ code: "// 谱系用 lineage 数据携带", comment: 'parentSession / delegationDepth / subagentDepth', stage: '谱系', color: '#38bdf8' },{ code: "return subagentResult", comment: '结果返回给父 agent', output: 'tool/result', stage: '返回', color: '#34d399' }]

const s14Steps = [{ code: "// 会话前缀里列出技能目录", comment: '只有 SkillSummary（name + description）', stage: '目录', color: '#38bdf8' },{ code: "模型判断需要某个技能 → 调 skill 工具", comment: '渐进披露：先摘要，再按需', stage: '渐进披露', color: '#fbbf24' },{ code: "skill.load(name)", comment: '加载完整 SkillDefinition（正文内容）', stage: '加载', color: '#38bdf8' },{ code: "agent.inject(skillContent)", comment: '内容注入进上下文，不常驻', stage: '注入', color: '#38bdf8' },{ code: "// 模型按技能指令干活", output: '任务执行', stage: '执行', color: '#34d399' }]

const s15Steps = [{ script, meta },{ code: "// worker 线程引擎解析脚本", comment: 'fan-out 到多个子 agent', stage: '引擎', color: '#38bdf8' },{ code: "parallel([task1, task2, task3, ...])", comment: '并发派发，各自独立工作', stage: '并行', color: '#38bdf8' },{ code: "// 结构化子进程：受限 prompt/工具集 + 单调工具守卫", comment: '子 agent 只能用固定工具，不能再注册', stage: '守卫', color: '#fbbf24' },{ code: "return aggregatedResult", comment: '结构化结果汇总', output: 'workflow/result', stage: '汇总', color: '#34d399' }]

const s16Steps = [{...},{", comment: '权限门挂在执行前', stage: '权限门', color: '#38bdf8' },{ kind: 'deny', reason },{ code: "return next()", comment: '允许：调 next() 放行', stage: '放行', color: '#34d399' },{ code: "// 或返回 ask，走 ctx.approval 由 answerer 回答", comment: '审批：区别于普通提问', stage: '审批', color: '#fbbf24' }]

const s17Steps = [{ objective, maxGoalRounds },{ code: "// activation: armed", comment: '进程本地允许再接纳一轮', stage: '激活', color: '#38bdf8' },{ code: "// 一轮 goal round = 一个 goal-sourced turn", comment: '由 goal 驱动，而非用户新消息', stage: '轮次', color: '#38bdf8' },{ code: "// 完成 → complete；卡住 → blocked（带原因）", comment: '阶段：active/paused/blocked/complete', stage: '阶段', color: '#fbbf24' },{ code: "// resume/fork 需要重新授权", comment: 'activation 刻意不在持久回放里', stage: '授权', color: '#f87171' }]

const s18Steps = [{ code: "ctx.on('tools/pre-execute', ...)", comment: '能力级拒绝：决定「要不要执行」', stage: '能力级', color: '#38bdf8' },{ code: "ctx.sandbox.resolve(policy)", comment: '进程级约束：决定「怎么执行」', stage: '进程级', color: '#fbbf24' },{ code: "spawn(confinedArgv)", comment: 'provider 包裹 argv（ConfinedArgv）', stage: '包裹', color: '#38bdf8' },{ code: "// 进程在沙箱里运行，文件操作受约束", output: 'file access denied under <mode>', stage: '约束', color: '#f87171' },{ code: "// 一个执行世界", comment: '换 fs/subprocess provider，bash/PTY/LSP 一起搬', stage: '执行世界', color: '#34d399' }]
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
