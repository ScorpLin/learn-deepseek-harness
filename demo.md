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

const s04Steps = [
  { label: 'Loader 读 cordis.yml，条目带 config', detail: 'targets: [alpha, beta]，greeting 省略', color: '#38bdf8' },
  { label: 'schemastery 校验 config', detail: 'greeting 用默认值 Hello 补齐', code: "Schema.string().default('Hello')", color: '#38bdf8' },
  { label: 'apply(ctx, config) 收到完整配置', detail: 'config.greeting 已是 Hello', color: '#34d399' },
  { label: '输出 Hello, alpha! / Hello, beta!', detail: '配置生效', color: '#34d399' },
  { label: '（改坏）targets 喂成字符串', detail: '不是数组，schema 校验失败', code: "targets: 'not-an-array'", color: '#f87171' },
  { label: 'ValidationError → fiber FAILED → exit 1', detail: '坏配置响亮失败，不是半初始化', color: '#f87171' },
]

const s16Steps = [
  { label: '模型返回 tool/call { name:"bash" }', detail: '想执行一条命令', color: '#a78bfa' },
  { label: 'tools/pre-execute（waterfall）被触发', detail: '权限门监听器收到 exec', color: '#38bdf8' },
  { label: '权限门判断 isAllowed(exec)', detail: '允许则调 next()，拒绝则 return deny', color: '#38bdf8' },
  { label: '若 return { kind:"deny" } → 短路', detail: '下游不执行，工具被拒', code: "return { kind: 'deny', reason: '...' }", color: '#f87171' },
  { label: '若 return next() → 放行', detail: '继续 execute', color: '#34d399' },
  { label: '审批(ask)：走 ctx.approval 由 answerer 回答', detail: '区别于普通提问 ask_user_question', color: '#fbbf24' },
]

const s10Steps = [
  { label: '全局注册工具 greet', detail: '每个 agent 都可见（扁平两层的第一层）', code: 'ctx.tools.register(greet)', color: '#a78bfa' },
  { label: 'createAgent({ setup }) 打开创建槽', detail: '作用域和 agent 对象已存在，但首个 prompt 未组装', code: 'createAgent({ setup: (ctx) => { ... } })', color: '#38bdf8' },
  { label: 'setup 里作用域局部注册同名 greet', detail: 'scope-local 在 restriction 过滤之后合并进来', code: 'ctx.tools.register(greetScoped)', color: '#38bdf8' },
  { label: '名字解析：most-specific-wins', detail: '作用域内同名工具替换全局同名者（shadowing）', color: '#fbbf24' },
  { label: '调用 greet → 命中作用域版本', detail: '全局版本被遮蔽，本 agent 用作用域定制版', color: '#34d399' },
  { label: '其它 agent 仍见全局 greet', detail: '隔离：作用域定制不泄漏给别的 agent', color: '#34d399' },
]

const s13Steps = [
  { label: '模型调委派工具（tool-subagent）', detail: '父 agent 发起委派，触发配置好的 provider', color: '#38bdf8' },
  { label: 'provider spawn 独立子 agent', detail: 'fresh 子进程 / 同进程 fork / 其它产品（codex、acp…）', color: '#38bdf8' },
  { label: 'start-time 能力作为参数传入', detail: '初始 prompt、隔离配置在子 agent 出生时就固定', color: '#a78bfa' },
  { label: '子 agent 独立上下文运行', detail: '作用域不继承：拿不到父 agent 的 scope-local 注册', color: '#fbbf24' },
  { label: 'lineage 记录父子事实', detail: 'parentSession / delegationDepth / subagentDepth，从不影响可见性', color: '#a78bfa' },
  { label: '子 agent 经 tools/result 返回结果', detail: '父 agent 收到 Result，委派结束', color: '#34d399' },
]

const s14Steps = [
  { label: '目录摘要 SkillSummary 进入会话前缀', detail: '模型先看到每个 skill 的 name + description（渐进披露第一层）', code: "{ name: 'write-docs', description: '按仓库规范写文档' }", color: '#a78bfa' },
  { label: '模型判断需要 write-docs', detail: '只按需加载，不全塞进 prompt', color: '#38bdf8' },
  { label: '模型调 skill 工具（catalog/loader）', detail: '列出 / 加载指定技能', color: '#38bdf8' },
  { label: 'local provider 加载 SkillDefinition', detail: '完整定义：summary + content 指令正文', color: '#38bdf8' },
  { label: 'content inject() 进上下文', detail: '走 agent.inject()，按需注入而非常驻', code: 'agent.inject(skill.content)', color: '#fbbf24' },
  { label: '模型获得完整指令正文', detail: '按 skill 规范执行任务', color: '#34d399' },
]

const s15Steps = [
  { label: '模型调 workflow 工具', detail: '传入 meta（name/description/phases）+ 脚本', color: '#38bdf8' },
  { label: 'worker 线程引擎接收入口', detail: 'ctx.workflowEngine 开始编排', color: '#38bdf8' },
  { label: 'fan-out：并行派发多个子 agent', detail: '结构化子进程，多路独立工作同时跑', color: '#38bdf8' },
  { label: '单调工具守卫约束每个子进程', detail: '只能用固定工具集，不能再注册新工具', color: '#f87171' },
  { label: '各子 agent 经 tools/result 提交最终结果', detail: '结构化输出，而非任意返回', color: '#fbbf24' },
  { label: 'worker 汇总结构化结果', detail: '收集所有子进程结果，汇总返回', color: '#34d399' },
  { label: '模型收到汇总结果', detail: 'fan-out 编排走完', color: '#34d399' },
]

const s17Steps = [
  { label: '创建 goal（create_goal）', detail: '持久完成目标附在 session 上，进入 active 阶段（是状态，不是 scheduler）', code: 'create_goal({ objective })', color: '#a78bfa' },
  { label: 'goal activation 置 armed', detail: '进程本地「允许再接纳一轮」权限', color: '#fbbf24' },
  { label: 'driver 物化一轮 goal round', detail: 'goal-sourced turn：由当前 goal 发起、而非普通用户消息，零到多步', color: '#38bdf8' },
  { label: '无关人类 turn 不消耗轮数上限', detail: '只有 goal-sourced turn 消耗 goal-round', color: '#fbbf24' },
  { label: '目标达成 → complete', detail: 'revisioned 阶段迁移，session log 仍是真理之源', color: '#34d399' },
  { label: '或暂停 → paused / 拦阻 → blocked', detail: '不再自动延续', color: '#fbbf24' },
  { label: 'activation 置 disarmed', detail: '不再接纳新轮；resume/fork 需接手方授权（刻意不在持久回放里）', color: '#f87171' },
]

const s06Steps = [
  { label: 'inbox 收到一条用户消息', detail: '输入进入 inbox，唤醒驱动', color: '#38bdf8' },
  { label: 'turn/start 落日志', detail: '打开一个 turn，先写 turn/start', color: '#a78bfa' },
  { label: 'preStep：claim 输入 + 组装 prompt', detail: '认领输入 + systemPrompt.assemble 拼分节和工具 schema', color: '#38bdf8' },
  { label: 'agent/pre-step（waterfall）放行', detail: '监听器可改写消息或 reject，这里放行 enter', color: '#fbbf24' },
  { label: 'step/start + user/message 落日志', detail: '打开一步，消息写进 log', color: '#38bdf8' },
  { label: 'buildRequest(deriveMessages()) → llm.stream', detail: '从 log 投影历史，发起模型请求，逐 token 流回', color: '#38bdf8' },
  { label: 'assistant/chunk* → assistant/message', detail: '每个 chunk 落日志，聚合后写 assistant/message', color: '#34d399' },
  { label: '若 tool-call → 执行工具 → tool/result', detail: '工具结果写回 log，进入下一步', color: '#fbbf24' },
  { label: 'step/end → turn/end 落日志', detail: '关 step、关 turn，一个 turn 完成', color: '#34d399' },
]

const s11Steps = [
  { label: 'dsh-llm 提供 ctx.llm 服务', detail: 'Definition + Consumer：词汇 + LlmAdapter 抽象类', color: '#a78bfa' },
  { label: 'llm-deepseek adapter 注册', detail: "registerAdapter(['deepseek'], adapter) 挂进 ctx.llm", color: '#38bdf8' },
  { label: 'agent-loop 依赖 ctx.llm', detail: '不依赖具体 adapter，只认 ctx.llm 接口', color: '#fbbf24' },
  { label: 'buildRequest 组装请求', detail: 'Message/ContentBlock 词汇 + deriveMessages 历史', color: '#38bdf8' },
  { label: 'adapter.stream(options) → chunk 流', detail: 'LlmAdapter 唯一抽象方法，吐 StreamChunk', color: '#38bdf8' },
  { label: '换 adapter = 改配置', detail: '换 provider 不改 loop（seam 的 provider 可替换）', color: '#34d399' },
]

const s18Steps = [
  { label: '模型返回 bash tool/call', detail: '想执行一条命令', color: '#a78bfa' },
  { label: 'tools/pre-execute 权限门放行', detail: '能力级拒绝：决定「要不要执行」', color: '#38bdf8' },
  { label: 'ctx.sandbox 解析 per-session 策略', detail: '进程级约束：决定「怎么执行」', color: '#fbbf24' },
  { label: 'provider 包裹 argv（ConfinedArgv）', detail: 'spawn 前把命令包进沙箱', color: '#38bdf8' },
  { label: '进程在沙箱里运行', detail: '文件操作受沙箱策略约束', color: '#38bdf8' },
  { label: '文件操作被拒 → 报告 denied', detail: 'sandbox 报告 file access denied（策略拒绝，非 bug）', color: '#f87171' },
  { label: '结果返回给模型', detail: '一个执行世界：bash/PTY/LSP 一起受约束', color: '#34d399' },
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

## s04 · 配置校验（坏配置响亮失败）

对应 [s04 小作业](/docs/s04-config-and-loader)。

<ExerciseDemo :steps="s04Steps" :interval="1200" />

## s16 · 权限门（allow / deny / ask）

对应 [s16 小作业](/docs/s16-permission-approval)。

<ExerciseDemo :steps="s16Steps" :interval="1200" />

## s10 · Scope（作用域 shadowing）

对应 [s10 小作业](/docs/s10-scope)。

<ExerciseDemo :steps="s10Steps" :interval="1200" />

## s13 · Subagent（委派与隔离）

对应 [s13 小作业](/docs/s13-subagent)。

<ExerciseDemo :steps="s13Steps" :interval="1200" />

## s14 · Skill（按需加载）

对应 [s14 小作业](/docs/s14-skill)。

<ExerciseDemo :steps="s14Steps" :interval="1200" />

## s15 · Workflow（fan-out 编排）

对应 [s15 小作业](/docs/s15-workflow)。

<ExerciseDemo :steps="s15Steps" :interval="1300" />

## s17 · Goal（生命周期与 activation）

对应 [s17 小作业](/docs/s17-goal-plan)。

<ExerciseDemo :steps="s17Steps" :interval="1300" />

## s06 · Agent Loop（turn 时序）

对应 [s06 小作业](/docs/s06-agent-loop)。

<ExerciseDemo :steps="s06Steps" :interval="1300" />

## s11 · LLM Adapter（registerAdapter）

对应 [s11 小作业](/docs/s11-llm-adapter)。

<ExerciseDemo :steps="s11Steps" :interval="1200" />

## s18 · 沙箱与执行世界

对应 [s18 小作业](/docs/s18-sandbox-execution)。

<ExerciseDemo :steps="s18Steps" :interval="1200" />

---
---

这些动画是「你脑子里应该有的执行顺序」。做完练习后，再看一遍动画，确认每一步你都能对上号；对不上，说明那一步的机制还没吃透，回正文重读。
