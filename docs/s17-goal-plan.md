# s17 · Goal 与 Plan

> **一句话**：goal 是一个持久化的完成目标（带阶段和轮数上限），plan 是登录态的计划协作。二者都是「状态」，不是 scheduler、不是独立会话。

## Goal

`packages/goal/` 拥有同会话目标：

- **goal** —— 附在已有 session 上的一个持久完成目标，带 revisioned `active / paused / blocked / complete` 阶段 + goal-round 上限。**是状态，不是 scheduler、不是独立会话**——session log 仍是它的真理之源。
- **goal round** —— 当前目标接纳的一轮延续。同会话 driver 把它物化成一个 goal-sourced turn（一个由当前 goal 发起、而非普通用户消息发起的 turn，零到多步）。无关的人类 turn 不消耗 goal-round 上限。
- **goal activation** —— 进程本地的「允许再接纳一轮」权限：`armed` / `disarmed`。**刻意不在持久回放里**，所以 resume/fork 需要后续操作者（接手方）来授权的 resume 变更。

`ctx.goals` 拥有持久状态，`dsh-goal-round-driver` 通过公开 `Agent` 调度同会话轮次，command/tool 两个入口分别暴露人类/模型控制。

## Plan

`packages/plan/` 拥有 plan mode（登录态）：

- `plan/mode` 状态是 **log-only**（只记录，不驱动）。
- `/plan [message]` 进入，`/plan off` 直接退出。
- `exit_plan_mode` 经用户复核退出。
- 强制（enforcement）在**独立的 sandbox/approval 轴上**，不在 plan mode 里。

## 为什么：长期目标 + 协作计划

goal 解决「一个任务要跨多轮自动延续」的问题，但把「能不能再继续」交给显式激活——避免无限自跑。plan 解决「多步工作别跑偏」的问题，但把「真正动手」留在用户复核之后。

## 读源码

- `packages/goal/` —— 持久目标身份、生命周期快照、激活、变更记录、轮次归属。
- `packages/plan/` —— `plan/mode` 状态、pending 选择 flush、`exit_plan_mode` 复核弧。
- 完整契约见官方 `deepseek-harness/docs/subsystems/goal.md` 和 `deepseek-harness/docs/subsystems/plan.md`。

## 自测

1. goal 为什么「是状态，不是 scheduler」？
2. goal round 消耗什么、不消耗什么？
3. goal activation 为什么「刻意不在持久回放里」？
4. plan mode 的强制在哪个轴上？
5. `exit_plan_mode` 的复核是谁做的？


## 小作业

1. 说清 goal 的 `active/paused/blocked/complete` 四阶段，以及 **activation（armed/disarmed）** 为什么「刻意不在持久回放里」。
   **达标标准**：能说清 goal 是「状态不是 scheduler」，session log 仍是真理之源。
2. 说清 plan mode 的「强制」在哪个独立轴上。
---

**下一章**：[s18 · 沙箱与执行世界](s18-sandbox-execution.md)。
