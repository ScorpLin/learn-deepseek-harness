# Code Reading Order（代码阅读顺序）

每章「读源码」前，先按这里的顺序开文件。原则是：**先读入口和最小启动器，再读状态机，最后读能力实现**。所有路径都相对于 `deepseek-harness` checkout 根目录。

## 万能起点：一个 5 行的启动器

读任何 Cordis 相关代码前，先读 `vendor/cordis/bin.js`（约 15 行）。它是整个框架的「最小可运行入口」：

```js
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'

const ctx = new Context()
await ctx.plugin(Loader)
await ctx.loader.create({ name: '@deepseek-ai/cordis-plugin-include', config: { path: './cordis.yml' } })
```

四件事，就是 Cordis 的全部：新建 `Context` → 挂 Loader 插件 → 让 Loader 读 `cordis.yml`。你写的每个插件，最终都挂进这个树。

## 按章节的阅读顺序

| 章节 | 先开这些文件（顺序即建议） |
|---|---|
| s01 Cordis 地基 | `vendor/cordis/bin.js` → `vendor/cordis/src/context.ts` → `vendor/cordis/src/fiber.ts`（看 `FiberState` 与 `effect`） |
| s02 事件与 waterfall | `vendor/cordis/src/events.ts`（看 `waterfall` 分发） |
| s03 服务与依赖 | `vendor/cordis/src/service.ts` → `vendor/cordis/src/registry.ts` |
| s04 配置与 Loader | `vendor/loader/src/` → `packages/boot/app-boot/` |
| s05 Capability Seam | `packages/shell/shell/`（Definition）→ `packages/shell/bash-local/`（Provider）→ `packages/shell/tool-bash/`（Consumer） |
| s06 Agent Loop | `packages/core/agent/`（接口）→ `packages/core/agent-loop/`（驱动） |
| s07 Session Log | `packages/core/session/`（看 `SessionEventMap` 与 `deriveMessages`） |
| s08 Tools | `packages/core/tools/`（看 `ToolDefinition` 与执行管线） |
| s09 Prompt Assembly | `packages/core/system-prompt/` |
| s10 Scope | `packages/core/scope/` |
| s11 LLM Adapter | `packages/llm/llm/`（Definition + Consumer）→ `packages/llm/deepseek/`（Provider） |
| s12 写一个工具 | `packages/tool/` 下任意一个（如 `dsh-tool-bash`）→ `packages/core/tools/` |
| s13 Subagent | `packages/subagent/subagent/`（Definition）→ `packages/subagent/spawn-in-process/`（Provider） |
| s14 Skill | `packages/skill/` |
| s15 Workflow | `packages/workflow/` |
| s16 权限与审批 | `packages/interaction/` → `packages/hooks/` |
| s17 Goal 与 Plan | `packages/goal/` → `packages/plan/` |
| s18 沙箱与执行世界 | `packages/sandbox/` → `packages/fs/` → `packages/shell/` |
| s19 扩展与自修改 | `packages/extensions/` → `vendor/hmr/` |

## 三条通用读法

1. **先读 README 里的「设计」段落，再读代码** — 每个包的 `README.md` 有「目的 / API / 扩展点」三件套，是比源码更快的入口。
2. **读 seam 时，按 Definition → Provider → Consumer 顺序** — 先搞清接口契约，再看实现，最后看谁在消费。
3. **读事件时，回到 `deepseek-harness/docs/event-producer-consumer.md`** — 官方那份列出每个事件的 producer 和 consumer，是「谁发、谁听」的权威地图。
