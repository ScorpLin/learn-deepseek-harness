# s15 · Workflow（工作流）

> **一句话**：workflow 是「多 agent 编排」的 seam——一个 worker 线程引擎 + 一个模型可调的 `workflow` 工具。它把「fan-out 到多个子 agent」变成模型能调用的一项能力。

## 是什么

`packages/workflow/` 是 workflow 能力族：

- **seam** —— `ctx.workflowEngine`；
- **engine** —— worker 线程引擎；
- **Consumer** —— `workflow` 工具（还有 `ralph` 工具，见下）。

workflow 脚本编排多个子 agent，靠「结构化子进程」强制输出。三个机制各是一件事：

- **结构化子进程** —— 用受限的 prompt/工具集跑一个子 agent；
- **单调工具守卫** —— 子进程只能用固定的一套工具，不能再注册新工具；
- **最终结果** —— 通过 `tools/result` 提交，而不是任意返回。

脚本自己的身份是一份 `meta`（`name` / `description` / `phases`）：

```ts
// meta —— workflow 脚本的身份标识
{
  name: 'audit-files',        // 短横线命名的脚本名
  description: '多文件审计',   // 一句话说明这个 workflow 干什么
  phases: [                   // 可选的进度分组
    { title: 'collect', detail: '收集待审计文件' },
    { title: 'verify', detail: '核对结果' },
  ],
}
```

## 为什么：单 agent 内核长成平台

一个 agent 适合「一段连续推理」。当任务要 fan-out 到多路独立工作（审计多文件、多角度研究、迁移），一个 agent 会串行拖慢。workflow 把「编排」本身变成模型可调的能力：模型决定「这任务值得 fan-out」，就调 `workflow`。

## 相关：Ralph 与 goal 的区别

（官方 glossary 划得清楚，别混）

- **workflow** —— 通用 fan-out 编排。
- **Ralph loop** —— 一种**前景 fresh-agent** 工作流，朝一个不可变目标跑多轮，每轮开新 child，共享 workspace 做记忆。
- **goal**（s17）—— 同会话持久目标，**不是**独立会话、不是 scheduler。

三者是「编排」的不同形态，别把它们当一个。

## 读源码

- `packages/workflow/` —— seam、worker 线程引擎、工具 Consumer。
- 完整契约见官方 `deepseek-harness/docs/subsystems/workflow.md`。

## 自测

1. workflow 的 seam / engine / Consumer 分别是什么？
2. workflow 解决什么「单 agent 做不好」的问题？
3. workflow、Ralph、goal 三者的区别？
4. 结构化子进程靠什么强制输出？


## 小作业

1. **设计一个 workflow 的 meta**：`name` / `description` / `phases`。
   **达标标准**：能区分 workflow（通用 fan-out）、Ralph（fresh-agent 前景循环）、goal（同会话持久目标）。
---

**下一章**：[s16 · 权限与审批](s16-permission-approval.md)。
