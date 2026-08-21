# s10 · Scope（作用域）

> **一句话**：scope 是「每个 agent 的注册空间」——一个贡献（工具、prompt 分节、变量、限制、监听器）要么**全局**（每个 agent 可见），要么**作用域化**（归某一个 agent 独有）。作用域注册**不继承**到子 agent。

## 是什么

两层，扁平（官方 glossary 的精确定义）：

- **全局** —— 每个 agent 都可见。
- **作用域（scoped）** —— 由某个 **scope key** 独有。harness 约定：**一个活 agent 就是它自己 scope 的 key**。

作用域注册走 **agent context（`agent.ctx`）**——通过它注册的东西既是 scope 可见的，又是 scope 生命周期的（一个事实驱动两者）。`agent.ctx` 上的监听器参与该 agent 的 scope 过滤分发。

## 为什么：隔离 + 定制

scope 解决两个问题：

1. **隔离** —— 一个 agent 的定制（persona、工具变体、变量）不泄漏给别的 agent。
2. **影子覆盖（shadowing）** —— most-specific-wins 名字解析：作用域内同名工具/分节/变量替换全局同名者。这是「每 agent persona」和「每 agent 工具变体」的机制。

## 关键语义：restriction vs scope-local

（官方 glossary，务必读准这两个概念的区别）

- **restriction（限制）** —— `tools.restrict` 过滤**全局**工具集（按交集组合）。被过滤掉的全局工具，**在 prompt 里不可见且拒绝执行**，和「不存在」不可区分。
- **scope-local registration（作用域局部注册）** —— 在 restriction 过滤**之后**合并进来。

所以组合顺序是：先 restriction 过滤全局集，再合并 scope-local。

## setup window（创建槽）

创建 agent 时有一个 `CreateAgentOptions.setup` 槽：作用域和 agent 对象已存在、但 agent/session 尚未发布、`agent/session-start` 未触发、首个 prompt 未组装之前。**setup 只注册，不驱动 agent**。

## 不继承，用 lineage 表达

作用域**不继承**到子 agent（subagent）。子树行为用 **lineage（谱系）** 数据表达，而不是 scope 结构：

- lineage 是「父子事实」作为数据携带：`parentSession`、持久的 `delegationDepth`、运行时的 `subagentDepth`。
- lineage **从不影响可见性**。

这是理解 subagent 委派隔离（s13）的前提——子 agent 拿不到父 agent 的 scope-local 注册，只能靠 lineage 数据知道自己的谱系。

## 读源码

- `packages/core/scope/` —— 作用域注册身份、分发载体、`Scope` 上下文。
- 完整定义见官方 [subsystems/scope](../deepseek-harness/docs/subsystems/scope.md) 和 [glossary](../deepseek-harness/docs/glossary.md)。

## 自测

1. 全局和 scoped 的两层怎么区分？一个贡献默认是哪层？
2. shadowing 是什么？它支撑了哪些「每 agent」特性？
3. restriction 和 scope-local registration 的区别？组合顺序是什么？
4. 为什么说「作用域不继承到子 agent」？子树行为用什么表达？
5. lineage 影响可见性吗？

---

**下一章**：[s11 · LLM Adapter](s11-llm-adapter.md) —— 模型怎么接进来，stream 协议长什么样。
