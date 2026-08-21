# s19 · 扩展与自修改

> **一句话**：extensions 让 agent 在运行时检查、挂载/卸载自己的插件——「agent 修改自己的运行时」。HMR 则让「改代码 → 热替换」免费成立（s01 的 effect + s03 的依赖加载的推论）。

## 是什么

`packages/extensions/` 是「agent 运行时自修改」：活插件/服务检查 + 模型写的插件 mount/unmount。

`vendor/hmr/` 是 HMR：监听文件，保存即热替换运行中的插件。

## 为什么：一切皆插件的最终形态

如果一切皆插件、且注册是可撤销 effect（s01），那么「运行时挂/卸载插件」就和「改配置文件」是同一件事。extensions 把这个能力暴露给 agent 自己——agent 能检查它有哪些插件，甚至写一个新插件挂上。这是「一切皆插件」哲学走到头的自然结果。

## HMR 为什么免费

（这是阶段一埋下的伏笔，现在收束）

1. 卸载释放 effect（s01）。
2. 加载跟随依赖（s03）。

所以「替换运行中的插件」= 卸载（撤销 effects）→ 加载新代码（按依赖激活）。HMR 只是把这个循环自动化的 watcher。

## 读源码

- `packages/extensions/` —— 动态 Cordis 插件/包、host/client 激活、审批、运行时检查、生命周期 teardown。
- `vendor/hmr/` —— 文件 watcher、热替换。
- 完整契约见官方 `deepseek-harness/docs/subsystems/extensions.md`。

## 自测

1. 「agent 修改自己的运行时」靠什么机制成立？
2. HMR 为什么「免费」？它依赖阶段一的哪两条机制？
3. extensions 和 HMR 的区别？
4. 动态挂载插件时，审批在哪里？
5. 你学完全部 19 章了——用一句话说清「DeepSeek Harness 的设计主干」。


## 小作业

1. 解释 **HMR 为什么免费**：指出它依赖阶段一的哪两条机制。
   **达标标准**：能说出「卸载释放 effect」+「加载跟随依赖」两条，并说清这为什么是 s01/s03 的收束。
2. 用一句话说清「一切皆插件」如何走到「agent 修改自己的运行时」。
---

## 🎓 全课程完成

你已经走完 19 章。回顾整条主线：

**Cordis（地基）→ seam（范式）→ loop+log+tools+prompt（心脏）→ scope+adapter+动手（手脚）→ workflow+权限+goal/plan+沙箱+扩展（平台）。**

最后一步：**回到 [s00-architecture-overview.md](s00-architecture-overview.md)，重新读一遍全系统地图**——现在每一条你都懂了。然后挑一个感兴趣的能力，去 [code-reading-order](s00f-code-reading-order.md) 里找到它的源码，逐包追 Definition → Provider → Consumer。
