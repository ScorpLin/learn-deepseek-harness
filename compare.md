# 相邻对比 Compare

读到中间卡住时，看「相邻两章升级了什么」——卡点通常是你漏掉了上一章埋的伏笔。

<Reveal>

## 地基四连（s01 → s04）

| 从 | 到 | 升级了什么 |
|---|---|---|
| s01 插件 | s02 事件 | 从「一个插件」到「插件之间通信」：`ctx.on` 监听、waterfall 拦截 |
| s02 事件 | s03 服务 | 从「广播」到「点到点」：`Service` + `inject`，加载顺序由依赖推导 |
| s03 服务 | s04 配置 | 从「代码写死」到「`cordis.yml` 配置」：schema 校验、HMR |

## 主干五连（s05 → s09）

| 从 | 到 | 升级了什么 |
|---|---|---|
| s04 配置 | s05 seam | 把「服务+依赖+事件」拼成「可替换能力」的三角色范式 |
| s05 seam | s06 loop | 从「静态能力」到「转起来的循环」：turn/step 时序 |
| s06 loop | s07 log | 从「跑」到「记录」：log 是模型上下文的唯一来源 |
| s07 log | s08 tools | 从「记录」到「干活」：工具 + 有守卫的执行管线 |
| s08 tools | s09 prompt | 从「手」到「嘴」：schema 怎么进模型输入 |

## 动手五连（s10 → s14）

| 从 | 到 | 升级了什么 |
|---|---|---|
| s09 prompt | s10 scope | 从「全局」到「每 agent」：注册空间 + shadowing |
| s10 scope | s11 adapter | 从「隔离」到「接模型」：LlmAdapter seam |
| s11 adapter | s12 写工具 | 从「读」到「写」：defineTool 全流程 |
| s12 写工具 | s13 subagent | 从「一个 agent」到「委派」：隔离 + lineage |
| s13 subagent | s14 skill | 从「委派」到「按需加载」：渐进披露 |

## 平台五连（s15 → s19）

| 从 | 到 | 升级了什么 |
|---|---|---|
| s14 skill | s15 workflow | 从「一个任务」到「fan-out 编排」 |
| s15 workflow | s16 权限 | 从「编排」到「受控执行」：pre-execute 门 |
| s16 权限 | s17 goal/plan | 从「执行」到「长期目标 + 协作计划」 |
| s17 goal/plan | s18 沙箱 | 从「策略」到「进程级约束」：共享执行世界 |
| s18 沙箱 | s19 扩展 | 从「约束」到「自修改」：一切皆插件走到头 |

## 最常卡的三个「跳变」

1. **s04 → s05**：seam 不是新概念，是 s01-s03 的组合。卡这里说明地基没吃透，回 s03 重读 `inject`。
2. **s06 → s07**：log 是 loop 的「记忆」。卡这里说明没懂「模型可见⟺已记录」，回 s07 重读 deriveMessages。
3. **s10 → s13**：subagent 的隔离建立在 scope「不继承」上。卡这里说明没吃透 s10 的 lineage。

</Reveal>
