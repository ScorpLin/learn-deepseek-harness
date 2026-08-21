# s18 · 沙箱与执行世界

> **一句话**：sandbox 是进程隔离的 seam（bwrap/Landlock/Seatbelt 后端）；fs 是文件系统 seam。它们和 shell/subprocess 共享「一个执行世界」，所以换一个 provider，Bash/PTY/LSP 一起搬。

## 是什么

- **sandbox** —— `packages/sandbox/`：进程隔离 seam。per-session 策略解析 + 进程约束（文件效应模式、执行/provider 策略、`ConfinedArgv`、强制与 fail-closed 错误）。
- **fs** —— `packages/fs/`：文件系统 seam。`FsTarget`、read/write/edit 结果、观察文件状态、`FsErrorCode`。

## 为什么：一个执行世界的后果

回到 s05 的「共享执行世界」：fs 与 subprocess 的 provider 共享同一执行世界。指向远程沙箱时，**Bash、PTY、LSP 一起搬走**，无需 fork provider。

这意味着「沙箱化」不是一个能力独享的：它是一层 provider，套在所有需要进程/文件的执行上。

## 策略的分层

- **能力级拒绝** —— 用 `tools/pre-execute`（s16 的权限门）。
- **进程级约束** —— 用 `ctx.sandbox` 后端；consumer 在 spawn 前包裹 argv（`ConfinedArgv`）。

两者在不同层：一个挡在「要不要执行」，一个约束「怎么执行」。

## 读源码

- `packages/sandbox/` —— 策略解析 + 进程约束 seam。
- `packages/fs/` —— 文件系统 seam + 策略。
- 完整契约见官方 `deepseek-harness/docs/subsystems/sandbox.md` 和 `deepseek-harness/docs/subsystems/filesystem.md`。

## 自测

1. sandbox 和 fs 是同一件事吗？各自 seam 什么？
2. 「一个执行世界」带来什么后果？
3. 能力级拒绝和进程级约束分别在哪做？
4. `ConfinedArgv` 是什么、谁用？
5. 换一个 fs provider 到远程沙箱，哪些能力跟着变？


## 小作业

1. 解释「**一个执行世界**」怎么让 bash / PTY / LSP 一起搬。
   **达标标准**：能说清「能力级拒绝（`tools/pre-execute`）」和「进程级约束（`ctx.sandbox` + `ConfinedArgv`）」的层次。
---

**下一章**：[s19 · 扩展与自修改](s19-extensions.md)。
