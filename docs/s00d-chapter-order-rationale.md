# Chapter Order Rationale（为什么是这个顺序）

这一章解释章节顺序背后的逻辑，让你在深入机制前先理解「为什么要先讲这个」。

## 核心判断：先框架，后 agent

一个直观的误区是「学 agent 系统就从 agent loop 开始」。但 DeepSeek Harness 里 **agent loop 本身就是一个插件**，它依赖 `ctx.tools`、`ctx.llm`、`ctx.sessions` 这些服务。如果一上来就讲 loop，你会在理解「为什么能热替换 loop」时一头雾水。

所以顺序倒过来：

1. **先讲 Cordis**（s01-s04）——因为它是承载其余一切的底座。不懂插件/context/inject/event，后面每一章的「为什么能这么做」都讲不清。
2. **再讲 seam**（s05）——因为它是「换 provider 换掉整个产品」的钥匙，是 Cordis 思想在 harness 里的具体化。
3. **然后讲 loop + log + tools + prompt**（s06-s09）——这些是 harness 的「心脏」，但它们的「为什么」都建立在 seam 之上。
4. **接着动手**（s10-s14）——scope、adapter、写工具、subagent、skill，让你把前两阶段的机制用起来。
5. **最后平台化**（s15-s19）——workflow、权限、goal/plan、沙箱、扩展，把单 agent 内核长成大平台。

## 每个「先」的理由

| 先讲 | 后讲 | 因为 |
|---|---|---|
| effect（可撤销副作用） | HMR / 热替换 | HMR 能工作，是 effect 卸载 + 依赖加载的推论 |
| inject（依赖注入） | capability seam | seam 的 Consumer 靠 inject 拿到服务，换 provider 靠依赖驱动的卸载/重载 |
| waterfall（事件） | 权限 / 审批 / 拦截 | 权限门、plan mode 都挂在 waterfall 事件上 |
| seam（三角色） | tools / shell / fs / llm | 这些能力全是 seam，先讲范式再讲实例 |
| session log | deriveMessages / 上下文 | 模型上下文从 log 派生，不懂 log 就不懂「模型可见⟺已记录」 |
| scope | subagent | 作用域不继承到子 agent，是理解委派隔离的前提 |

## 如果卡住，回退的锚点

读到中间模糊时，不是「继续硬啃」，而是按这个顺序复位：

1. [glossary.md](glossary.md) —— 查术语
2. [data-structures.md](data-structures.md) —— 查核心数据结构
3. 卡住那章最近的前一章 —— 依赖链断了就往回找
4. 回到章节正文

## 一句话总结这个顺序

**Cordis 是地基，seam 是范式，loop+log+tools+prompt 是心脏，scope+adapter+动手是手脚，workflow+权限+沙箱+扩展是平台。** 地基不稳，后面全是空中楼阁。
