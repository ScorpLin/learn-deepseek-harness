# s16 · 权限与审批

> **一句话**：权限不是「在工具里写 if」——它挂在 s08 的 `tools/pre-execute` 门上，返回 `deny`/请求审批；审批走 `ctx.approval` seam，hook 是「挂在这些拦截点上的普通插件」。

## 是什么

`packages/interaction/` 是「人机协作平面」：approval/interaction seam、权限 preset、commands、ask-user 工具。`packages/hooks/` 是 hook 桥 + Claude Code/Codex 的 wire 协议库。

权限门的本质（s02 + s08 的组合）：`tools/pre-execute` 是一个 waterfall，一个策略监听器可以在「自己拥有决策」时**返回而不调 `next()`**（veto）。这就是「允许 / 拒绝 / ask」的决策点。

## 为什么：让模型意图不直接变成不安全执行

模型想执行什么，不该直接落到系统上。权限门插在「模型返回 tool/call」和「工具真正执行」之间（s08 的管线），把「意图」变成「受控的执行」。

## 扩展点：hook 系统

hook 是「拦截点上的普通插件」，不是外部协议（官方 extension-cookbook 的原话：native hook 就是 interception point 上的普通 Cordis 插件）。hook 系统 = 用户级 + 项目级 hook，映射到这些 extension point 上：

```text
agent/session-start, agent/pre-step, agent/request,
tools/pre-execute, tools/post-execute, agent/turn-stopping
```

waterfall 返回类型化决策，`agent/turn-stopping` 可以再引导一步。`dsh-hooks-claude-code` / `dsh-hooks-codex` 桥把 hook 配置文件映射到这些扩展点。

## 一个权限门例子

（来自官方 [extension-cookbook](../deepseek-harness/docs/cookbook/extension-cookbook.md)）

```ts
export const name = 'permission-gate'
export function apply(ctx: Context) {
  ctx.on('tools/pre-execute', async (exec, next): Promise<PreToolDecision> => {
    if (!(await isAllowed(exec))) return { kind: 'deny', reason: 'Denied by policy.' }
    return next()
  })
}
```

注意：**允许时调 `next()` 委托**（s02 的铁律），拒绝时 return 短路。

## 审批 vs 普通提问

- **审批（approval）** —— 权限门返回 `ask`，走 `ctx.approval` seam，由 answerer 回答。
- **普通用户提问** —— 单独的模型工具 `ask_user_question`（UI-backed）。

两者不同：一个是「执行前的门」，一个是「模型主动问用户」。

## 读源码

- `packages/interaction/` —— approval seam、权限 preset、commands。
- `packages/hooks/` —— hook 桥。
- 完整契约见官方 [subsystems/approval](../deepseek-harness/docs/subsystems/approval.md) 和 [subsystems/user-questions](../deepseek-harness/docs/subsystems/user-questions.md)。

## 自测

1. 权限门挂在哪？它靠 s02 的什么机制工作？
2. 「允许」和「拒绝」在代码上分别对应什么动作？
3. hook 是什么？「native hook」和「外部协议」的区别？
4. 审批和普通提问的区别？
5. 为什么「在工具里写 if」不是权限的正确做法？

---

**下一章**：[s17 · Goal 与 Plan](s17-goal-plan.md)。
