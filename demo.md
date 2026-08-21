# 小作业 · 演示动画

每个练习对应一张**流程图**：节点有形状（圆角=开始/结束，方框=步骤，菱形=判断），带箭头。点「▶ 播放」逐步走，当前节点高亮，右侧显示这一步在干嘛。

<script setup>
// —— s01 插件与 effect ——
const s01Nodes = [
  { type: 'start', label: '加载插件 apply(ctx)', color: '#34d399' },
  { type: 'process', label: 'ctx.effect(body)', color: '#38bdf8' },
  { type: 'process', label: 'setInterval 每 200ms', color: '#38bdf8' },
  { type: 'process', label: 'return () => clearInterval', color: '#38bdf8' },
  { type: 'process', label: 'fiber.dispose()', color: '#38bdf8' },
  { type: 'end', label: '清理完成', color: '#34d399' },
]
const s01Steps = [
  { title: '加载插件', desc: 'Cordis 调用 apply(ctx)，fiber 进入 LOADING。' },
  { title: 'ctx.effect(body)', desc: '挂一个可撤销副作用：body 在加载时立即执行。' },
  { title: '启动定时器', desc: '每 200ms 打印一次 tick，属于「执行」阶段。' },
  { title: '返回 disposer', desc: 'body 返回清理函数，卸载时自动调用（清理阶段）。' },
  { title: 'fiber.dispose()', desc: '触发卸载，逆序执行所有 disposer（卸载阶段）。' },
  { title: '清理完成', desc: 'clearInterval 被调用，输出 heartbeat cleaned up。' },
]

// —— s02 事件与 waterfall ——
const s02Nodes = [
  { type: 'start', label: 'ctx.waterfall(...)', color: '#a78bfa' },
  { type: 'process', label: '监听器1：包装结果', color: '#38bdf8' },
  { type: 'decision', label: '输入含 blocked?', color: '#fbbf24' },
  { type: 'process', label: '短路 return', color: '#f87171' },
  { type: 'process', label: '默认函数执行', color: '#38bdf8' },
  { type: 'end', label: '结果沿链返回', color: '#34d399' },
]
const s02Steps = [
  { title: '发起调用', desc: '最后一个参数是最内层默认函数（next 的落点）。' },
  { title: '监听器1：包装', desc: '调 next() 拿下游结果，再 toUpperCase（包装）。' },
  { title: '判断', desc: '监听器2 检查输入是否含 blocked（决策点）。' },
  { title: '短路', desc: '含 blocked 就直接 return，不调 next()，下游全跳过（veto）。' },
  { title: '默认函数', desc: '不含 blocked 时放行，落到最内层默认函数执行。' },
  { title: '返回', desc: '返回值沿链从内向外逐层返回，得到最终结果。' },
]

// —— s03 服务与依赖注入 ——
const s03Nodes = [
  { type: 'start', label: '注册服务 super(ctx, name)', color: '#38bdf8' },
  { type: 'process', label: '声明 inject', color: '#fbbf24' },
  { type: 'process', label: 'PENDING 等待', color: '#fbbf24' },
  { type: 'process', label: '服务就绪 → 激活', color: '#34d399' },
  { type: 'end', label: '调用服务方法', color: '#34d399' },
]
const s03Steps = [
  { title: '注册服务', desc: 'Provider 用 super(ctx, "greeter") 把实现挂到 ctx.greeter。' },
  { title: '声明 inject', desc: 'Consumer 声明 inject: ["greeter"]，表示「我需要它」。' },
  { title: 'PENDING 等待', desc: '依赖没就绪时安静等待，不报错（合法状态）。' },
  { title: '激活', desc: '服务就绪后自动激活——加载顺序由依赖决定，不由文件顺序。' },
  { title: '调用', desc: 'apply 里 ctx.greeter.greet("world")，输出 Hello, world!。' },
]

// —— s04 配置校验 ——
const s04Nodes = [
  { type: 'start', label: '声明 Config schema', color: '#38bdf8' },
  { type: 'process', label: 'schemastery 校验', color: '#38bdf8' },
  { type: 'decision', label: '配置合法?', color: '#fbbf24' },
  { type: 'process', label: '补默认值 → apply', color: '#34d399' },
  { type: 'process', label: 'ValidationError', color: '#f87171' },
]
const s04Steps = [
  { title: '声明 schema', desc: 'interface + const 同名共存：类型给编译器、schema 给运行时。' },
  { title: '校验', desc: 'schemastery 在 apply 之前校验 cordis.yml 里的 config。' },
  { title: '判断', desc: '检查配置是否通过 schema（决策点）。' },
  { title: '补默认值', desc: '合法时用默认值补齐省略字段，apply 收到完整配置。' },
  { title: '失败', desc: '非法时抛 ValidationError，响亮失败（fiber FAILED + exit 1）。' },
]

// —— s05 capability seam ——
const s05Nodes = [
  { type: 'start', label: 'Definition 占 ctx.shell', color: '#a78bfa' },
  { type: 'process', label: 'Provider 实现接口', color: '#38bdf8' },
  { type: 'process', label: 'Consumer inject', color: '#fbbf24' },
  { type: 'process', label: '注册成模型工具', color: '#38bdf8' },
  { type: 'process', label: 'resolve → run', color: '#34d399' },
  { type: 'end', label: '返回结果', color: '#34d399' },
]
const s05Steps = [
  { title: 'Definition', desc: '抽象类 ShellExecutor 声明接口 + 占 ctx.shell。' },
  { title: 'Provider', desc: 'EchoExecutor 实现 resolve/run/start，挂进 ctx.shell。' },
  { title: 'Consumer', desc: 'inject ["tools","shell"]，不 import 具体实现。' },
  { title: '包装成工具', desc: 'defineTool 把 shell 能力变成模型可调的 echo 工具。' },
  { title: 'resolve → run', desc: '先 resolve 成完整 spec（显式>隐式），再 run 执行。' },
  { title: '返回', desc: '换 Provider 只改配置，Consumer 不动——这就是 seam。' },
]

// —— s06 agent loop ——
const s06Nodes = [
  { type: 'start', label: '收到消息', color: '#38bdf8' },
  { type: 'process', label: 'turn/start 落日志', color: '#a78bfa' },
  { type: 'process', label: 'agent/pre-step', color: '#fbbf24' },
  { type: 'process', label: '组装请求(deriveMessages)', color: '#38bdf8' },
  { type: 'decision', label: '要调工具?', color: '#fbbf24' },
  { type: 'process', label: '执行工具 → tool/result', color: '#fbbf24' },
  { type: 'end', label: 'turn/end 落日志', color: '#34d399' },
]
const s06Steps = [
  { title: '收到消息', desc: '输入进入 inbox，唤醒驱动。' },
  { title: 'turn/start', desc: '先写日志，打开一个 turn（模型可见⟺已记录）。' },
  { title: 'agent/pre-step', desc: 'waterfall 扩展点：可改写消息或 reject，这里放行。' },
  { title: '组装请求', desc: '从 session log 投影历史（deriveMessages），拼 prompt+工具。' },
  { title: '判断', desc: '模型回复里有没有 tool-call（决策点）。' },
  { title: '执行工具', desc: '有就执行，结果写回 log，进入下一步。' },
  { title: 'turn/end', desc: '没有更多步骤就关 turn，一个回合完成。' },
]

// —— s08 工具执行管线 ——
const s08Nodes = [
  { type: 'start', label: '注册工具', color: '#a78bfa' },
  { type: 'process', label: '校验 arguments', color: '#38bdf8' },
  { type: 'decision', label: 'pre-execute 放行?', color: '#fbbf24' },
  { type: 'process', label: 'execute 执行', color: '#38bdf8' },
  { type: 'process', label: 'tools/result 发出', color: '#34d399' },
  { type: 'end', label: '调用方收到结果', color: '#34d399' },
]
const s08Steps = [
  { title: '注册工具', desc: 'defineTool 注册 greet，schema 自动进提示词。' },
  { title: '校验', desc: '模型给的 arguments 先过 schema（defineTool 自动）。' },
  { title: '权限门', desc: 'tools/pre-execute：next() 放行 / return deny 拒绝（决策点）。' },
  { title: '执行', desc: 'execute(args) 真正干活，返回 Hello, Cordis!。' },
  { title: 'tools/result', desc: '结果物化时发出，只读深冻结，供观察/审计。' },
  { title: '返回', desc: '调用方（模型）拿到规范化结果，管线走完。' },
]

// —— s10 scope 作用域 ——
const s10Nodes = [
  { type: 'start', label: '全局注册 greet', color: '#38bdf8' },
  { type: 'process', label: '作用域注册同名 greet', color: '#a78bfa' },
  { type: 'process', label: 'most-specific-wins', color: '#fbbf24' },
  { type: 'process', label: 'tools.restrict 过滤', color: '#38bdf8' },
  { type: 'end', label: '该 agent 看到最终集', color: '#34d399' },
]
const s10Steps = [
  { title: '全局注册', desc: 'greet 工具对所有 agent 可见。' },
  { title: '作用域注册', desc: '某 agent 的 agent.ctx 注册同名 greet（scope-local）。' },
  { title: 'shadowing', desc: 'most-specific-wins：作用域内同名覆盖全局（每-agent 变体）。' },
  { title: 'restriction', desc: '多个 restriction 取交集，过滤全局工具集（越收越窄）。' },
  { title: '最终集', desc: '先 restriction 过滤，再合并 scope-local，才是该 agent 看到的。' },
]

// —— s11 llm adapter ——
const s11Nodes = [
  { type: 'start', label: 'registerAdapter', color: '#38bdf8' },
  { type: 'process', label: '组装请求', color: '#38bdf8' },
  { type: 'process', label: 'adapter.stream()', color: '#38bdf8' },
  { type: 'process', label: 'StreamChunk 流', color: '#38bdf8' },
  { type: 'end', label: '换 adapter = 改配置', color: '#34d399' },
]
const s11Steps = [
  { title: 'registerAdapter', desc: 'Provider 把 adapter 挂进 ctx.llm（seam 的注册）。' },
  { title: '组装请求', desc: '用 Message/ContentBlock 词汇 + deriveMessages 历史。' },
  { title: 'stream()', desc: 'LlmAdapter 唯一抽象方法：把请求变成 chunk 流。' },
  { title: 'StreamChunk', desc: 'text-delta / tool-call / finish 逐块吐出。' },
  { title: '替换', desc: '换模型 = 换 adapter 注册，agent-loop 不用改。' },
]

// —— s13 subagent ——
const s13Nodes = [
  { type: 'start', label: '发起委派', color: '#a78bfa' },
  { type: 'process', label: 'provider spawn 子 agent', color: '#38bdf8' },
  { type: 'process', label: '作用域不继承', color: '#f87171' },
  { type: 'process', label: 'lineage 谱系数据', color: '#38bdf8' },
  { type: 'end', label: '结果返回父 agent', color: '#34d399' },
]
const s13Steps = [
  { title: '发起委派', desc: '父 agent 通过 ctx.subagents.start 委派一个子 agent。' },
  { title: 'spawn', desc: 'provider 派生独立上下文、独立 session 的子 agent。' },
  { title: '隔离', desc: '子 agent 拿不到父的 scope-local 注册（作用域不继承）。' },
  { title: '谱系', desc: '父子关系用 lineage 数据携带（parentSession/delegationDepth）。' },
  { title: '返回', desc: '结果作为 tool/result 返回给父 agent。' },
]

// —— s14 skill ——
const s14Nodes = [
  { type: 'start', label: '目录摘要 SkillSummary', color: '#38bdf8' },
  { type: 'process', label: '模型判断需要', color: '#fbbf24' },
  { type: 'process', label: 'skill.load(name)', color: '#38bdf8' },
  { type: 'process', label: 'agent.inject(内容)', color: '#38bdf8' },
  { type: 'end', label: '按指令干活', color: '#34d399' },
]
const s14Steps = [
  { title: '目录', desc: '会话前缀只有 SkillSummary（name+description），不占上下文。' },
  { title: '渐进披露', desc: '模型判断需要哪个技能，再按需加载。' },
  { title: '加载', desc: 'skill.load 拿到完整 SkillDefinition（正文内容）。' },
  { title: '注入', desc: 'agent.inject() 把内容注入上下文，不常驻。' },
  { title: '执行', desc: '模型按技能指令完成任务。' },
]

// —— s15 workflow ——
const s15Nodes = [
  { type: 'start', label: '调 workflow 工具', color: '#a78bfa' },
  { type: 'process', label: 'worker 引擎解析', color: '#38bdf8' },
  { type: 'process', label: '并行派发子 agent', color: '#38bdf8' },
  { type: 'process', label: '单调工具守卫', color: '#fbbf24' },
  { type: 'end', label: '结构化结果汇总', color: '#34d399' },
]
const s15Steps = [
  { title: '发起', desc: '模型调 workflow 工具，传入 script + meta。' },
  { title: '引擎', desc: 'worker 线程引擎解析脚本，fan-out 到多个子 agent。' },
  { title: '并行', desc: 'parallel 并发派发，各自独立工作。' },
  { title: '守卫', desc: '结构化子进程只能用固定工具，不能再注册（单调守卫）。' },
  { title: '汇总', desc: '结构化结果汇总，作为 workflow/result 返回。' },
]

// —— s16 权限门 ——
const s16Nodes = [
  { type: 'start', label: '模型要调 bash', color: '#a78bfa' },
  { type: 'decision', label: 'isAllowed?', color: '#fbbf24' },
  { type: 'process', label: 'return deny 拒绝', color: '#f87171' },
  { type: 'process', label: 'next() 放行', color: '#34d399' },
  { type: 'end', label: '（或 ask 走审批）', color: '#fbbf24' },
]
const s16Steps = [
  { title: '调用', desc: '模型返回 tool/call { name: bash }，想执行命令。' },
  { title: '权限门', desc: 'tools/pre-execute 挂在执行前，检查 isAllowed（决策点）。' },
  { title: '拒绝', desc: 'return { kind: deny } 短路，工具不执行。' },
  { title: '放行', desc: 'return next() 委托，继续执行。' },
  { title: '审批', desc: '也可返回 ask，走 ctx.approval 由 answerer 回答。' },
]

// —— s17 goal 生命周期 ——
const s17Nodes = [
  { type: 'start', label: '创建目标', color: '#a78bfa' },
  { type: 'process', label: 'activation: armed', color: '#38bdf8' },
  { type: 'process', label: 'goal round（一轮 turn）', color: '#38bdf8' },
  { type: 'decision', label: '完成/卡住?', color: '#fbbf24' },
  { type: 'end', label: 'complete / blocked', color: '#34d399' },
]
const s17Steps = [
  { title: '创建', desc: 'ctx.goals.create 创建一个持久完成目标（active）。' },
  { title: '激活', desc: 'activation 是进程本地权限，armed 才能再接纳一轮。' },
  { title: 'goal round', desc: '一轮 = 一个 goal-sourced turn，由 goal 驱动。' },
  { title: '判断', desc: '是否完成或卡住（决策点）。' },
  { title: '结束', desc: 'complete 完成；blocked 带原因；resume/fork 需重新授权。' },
]

// —— s18 沙箱与执行世界 ——
const s18Nodes = [
  { type: 'start', label: '要执行命令', color: '#a78bfa' },
  { type: 'process', label: 'pre-execute 能力级', color: '#38bdf8' },
  { type: 'process', label: 'ctx.sandbox 进程级', color: '#fbbf24' },
  { type: 'process', label: 'spawn(confinedArgv)', color: '#38bdf8' },
  { type: 'end', label: '受约束运行', color: '#34d399' },
]
const s18Steps = [
  { title: '命令', desc: '模型想执行一条 bash 命令。' },
  { title: '能力级', desc: 'tools/pre-execute 决定「要不要执行」。' },
  { title: '进程级', desc: 'ctx.sandbox 解析 per-session 策略，决定「怎么执行」。' },
  { title: '包裹', desc: 'provider 把命令包进 ConfinedArgv，spawn 前套上沙箱。' },
  { title: '受约束', desc: '文件操作被拒时报告 denied；bash/PTY/LSP 一个执行世界。' },
]
</script>

## s01 · 插件与 effect

<FlowDemo :nodes="s01Nodes" :steps="s01Steps" />

## s02 · 事件与 waterfall

<FlowDemo :nodes="s02Nodes" :steps="s02Steps" />

## s03 · 服务与依赖注入

<FlowDemo :nodes="s03Nodes" :steps="s03Steps" />

## s04 · 配置校验

<FlowDemo :nodes="s04Nodes" :steps="s04Steps" />

## s05 · capability seam

<FlowDemo :nodes="s05Nodes" :steps="s05Steps" />

## s06 · Agent Loop

<FlowDemo :nodes="s06Nodes" :steps="s06Steps" />

## s08 · 工具执行管线

<FlowDemo :nodes="s08Nodes" :steps="s08Steps" />

## s10 · Scope 作用域

<FlowDemo :nodes="s10Nodes" :steps="s10Steps" />

## s11 · LLM Adapter

<FlowDemo :nodes="s11Nodes" :steps="s11Steps" />

## s13 · Subagent 委派

<FlowDemo :nodes="s13Nodes" :steps="s13Steps" />

## s14 · Skill 按需加载

<FlowDemo :nodes="s14Nodes" :steps="s14Steps" />

## s15 · Workflow 编排

<FlowDemo :nodes="s15Nodes" :steps="s15Steps" />

## s16 · 权限门

<FlowDemo :nodes="s16Nodes" :steps="s16Steps" />

## s17 · Goal 生命周期

<FlowDemo :nodes="s17Nodes" :steps="s17Steps" />

## s18 · 沙箱与执行世界

<FlowDemo :nodes="s18Nodes" :steps="s18Steps" />

---

这些流程图是「你脑子里应该有的执行顺序」：每个节点做什么、判断点往哪走，逐步点「下一步」跟一遍。做完练习后对照着走，对不上就回正文重读。
