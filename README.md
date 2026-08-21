# Learn DeepSeek Harness

一套写给「想真正吃透 DeepSeek Harness」的人的教学仓库。它不追求复刻产品的每一个细节，只聚焦**真正决定 agent 能不能跑好的那一套机制**，并且用「先懂概念 → 再读源码 → 最后动手重建」的顺序，带你从零走到能自己扩展、甚至重写这套 harness。

本仓库对标 [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) 的做法：同样的「设计主干」教学理念，套在 DeepSeek Harness（`dsh`）上。

## 一句话，先建立心智模型

> **模型负责推理，harness 给模型一个可工作的环境。**

而 DeepSeek Harness 构建这个「环境」的方式，只有一句话：

> **一切皆插件（everything is a plugin）。**

模型适配器、工具注册表、会话日志、甚至 agent 循环本身，全都是插件。没有「特权核心」可以打补丁——你要扩展它，就是往旁边再挂一个插件。这套思想的底层框架叫 **Cordis**（vendored 在 `vendor/` 里），所以**整个学习路线从 Cordis 开始，而不是从 agent 开始**。

## 这个仓库真正在教什么

一个 coding-agent harness 的「工作环境」由这几个相互配合的部分构成：

- **Cordis（插件运行时）**：插件、上下文、依赖注入、可撤销副作用——承载其余一切的底座
- **Event / Waterfall（事件系统）**：插件间通信与拦截，是 harness 的「神经」与「扩展点」
- **Capability Seam（能力接缝）**：Definition / Provider / Consumer 三角色，是「换个实现就换掉整个产品」的本质
- **Agent Loop（agent 循环）**：ask model → run tools → append results → continue，turn/step 的生命周期
- **Session Log（会话日志）**：一切模型可见内容的唯一来源——「模型可见 ⟺ 已记录」
- **Tools（工具）**：模型的手，以及它背后那条有守卫的执行管线
- **Scope（作用域）**：每个 agent 独立的注册空间，影子覆盖（shadowing）机制
- **Prompt Assembly（提示词组装）**：从稳定规则 + 运行时状态拼出模型输入
- **Skills / Subagent / Workflow / Permission / Sandbox**：把单 agent 内核长成更大平台的部件

教学承诺只有四条：

1. 用干净的顺序讲主线，不让你在零散碎片里自己拼系统
2. 每个概念先「是什么」→「为什么存在」→「怎么实现」，**先解释再使用**
3. 贴近真实源码结构，每章都指到具体的文件（`vendor/` 和 `packages/`）
4. 每一章配一个**可运行的最小例子**，让你跑起来、改一改、看它坏掉

## 这个仓库刻意不教什么

和参考项目一样，不把与「agent 核心运行模型」无关的细节放进教学主线：

- 打包与发布机制（`pnpm publish`、release 流程）
- 跨平台兼容层（Windows/wine 之类）
- 企业策略胶水、遥测与账号接线
- 历史兼容分支、命名事故

这些在生产里很重要，但不属于 0→1 教学路径的中心。

## 读者画像

假设你：

- 会基本的 TypeScript（函数、类、类型注解、`import type`；不熟的地方正文会解释）
- 了解函数、对象、数组、Promise
- 可能完全没接触过 agent 系统、也没接触过 Cordis

所以全程遵循几条硬规矩：概念先于使用、一个概念只在一处完整讲透、从「是什么」开始、不让新手从碎片里拼系统。

## 先决条件

跑本仓库的例子，需要一份 `deepseek-harness` 源码 checkout（因为例子直接 `import` 它的 vendored Cordis 和 `packages/`）：

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
```

然后把本仓库放在 `deepseek-harness` 的同级目录（默认约定），用自带的 `run.sh` 一键运行例子：

```sh
./run.sh 01-first-plugin
```

阶段一（Cordis 地基）的例子无需 API key。`run.sh` 会把你选中的例子**拷贝**进 `deepseek-harness/tmp/` 再运行（和官方 cordis-tutorial 一致）——这一步是必须的，因为 `tsx` 依赖 harness 根目录的 `tsconfig.json` 的 `paths` 把 `@deepseek-ai/*` 解析到源码 `src/`。如果你的 harness 不在 `../deepseek-harness`，用 `DSH_ROOT=/path/to/deepseek-harness ./run.sh 01-first-plugin` 覆盖。

## 推荐阅读顺序

**第一次来，不要随机开章节。** 最稳的路径：

1. 读 [docs/s00-architecture-overview.md](docs/s00-architecture-overview.md) —— 全系统地图
2. 读 [docs/s00d-chapter-order-rationale.md](docs/s00d-chapter-order-rationale.md) —— 为什么是这个顺序
3. 读 [docs/s00f-code-reading-order.md](docs/s00f-code-reading-order.md) —— 每章先开哪些文件
4. 按四个阶段顺序走：`s01-s04 → s05-s09 → s10-s14 → s15-s19`
5. **每走完一个阶段，停下来，自己重建一遍最小版本再继续**

如果读到中间开始模糊，按这个顺序「复位」：

1. [docs/glossary.md](docs/glossary.md)
2. [docs/data-structures.md](docs/data-structures.md)
3. 卡住的那一章最近的「桥接」章节
4. 回到章节正文

## 课程地图

| 阶段 | 章节 | 主题 | 你会吃透什么 | 源码锚点 |
|---|---|---|---|---|
| 0 地图 | s00 | 架构总览 | 全系统地图、profiles/bundles、turn flow 一图流 | [docs/architecture.md](../deepseek-harness/docs/architecture.md) |
| 0 地图 | s00d | 章节顺序理由 | 为什么先 Cordis 后 agent | — |
| 0 地图 | s00f | 代码阅读顺序 | 每章先开哪些文件 | `vendor/cordis/src/*.ts` |
| **1 地基** | s01 | Cordis 地基 | 插件/context/effect/fiber 状态机 | `vendor/cordis/src/{context,fiber}.ts` |
| 1 地基 | s02 | 事件与 waterfall | emit/parallel/serial/waterfall、veto 短路 | `vendor/cordis/src/events.ts` |
| 1 地基 | s03 | 服务与依赖注入 | Service/inject/ctx.get、依赖驱动加载 | `vendor/cordis/src/{service,registry}.ts` |
| 1 地基 | s04 | 配置与 Loader | cordis.yml/Config schema/profile/bundle | `vendor/loader/` `packages/boot/` |
| **2 主干** | s05 | Capability Seam | Definition/Provider/Consumer 三角色 | `packages/shell/` |
| 2 主干 | s06 | Agent Loop | turn/step/round、一步一模型的时序 | `packages/core/agent-loop/` |
| 2 主干 | s07 | Session Log | 模型可见⟺已记录、deriveMessages | `packages/core/session/` |
| 2 主干 | s08 | Tools | ToolDefinition、pre→execute→post→result 管线 | `packages/core/tools/` |
| 2 主干 | s09 | Prompt Assembly | section 分节、tool schema 注入 | `packages/core/system-prompt/` |
| **3 动手** | s10 | Scope | 每 agent 注册空间、shadowing | `packages/core/scope/` |
| 3 动手 | s11 | LLM Adapter | LlmAdapter seam、stream 协议 | `packages/llm/` |
| 3 动手 | s12 | 写一个工具 | defineTool、presentation/execute 全流程 | `packages/tool/*` `packages/fs/` |
| 3 动手 | s13 | Subagent | 委派 seam、provider 注册表 | `packages/subagent/` |
| 3 动手 | s14 | Skill | 目录加载、按需注入、catalog | `packages/skill/` |
| **4 平台** | s15 | Workflow | 多 agent 编排、结构化子进程 | `packages/workflow/` |
| 4 平台 | s16 | 权限与审批 | tools/pre-execute 门、approval seam、hooks | `packages/interaction/` `packages/hooks/` |
| 4 平台 | s17 | Goal 与 Plan | 同会话目标、plan mode | `packages/goal/` `packages/plan/` |
| 4 平台 | s18 | 沙箱与执行世界 | sandbox/fs/shell 共享执行世界 | `packages/sandbox/` `packages/fs/` |
| 4 平台 | s19 | 扩展与自修改 | extensions、HMR、agent 改自己 | `packages/extensions/` `vendor/hmr/` |

## 可运行例子

每个章节在 [examples/](examples/) 下有对应目录，各自 `README` 里写明运行命令。阶段一的例子无需 API key。

## 目录结构

```
learn-deepseek-harness/
├── README.md                  # 你正在读的入口 + 路线图
├── docs/                      # 课程正文（s00 地图 + s01-s19 章节）
│   ├── s00-architecture-overview.md
│   ├── s00d-chapter-order-rationale.md
│   ├── s00f-code-reading-order.md
│   ├── glossary.md
│   ├── teaching-scope.md
│   ├── data-structures.md
│   ├── entity-map.md
│   └── s01-cordis-foundation.md ... s19-*.md
└── examples/                  # 每章的可运行最小例子
    ├── 01-first-plugin/
    ├── 02-events/
    └── ...
```

## 与官方文档的关系

本仓库**不是**官方文档的替代品，而是它的「教学线」。官方文档（`deepseek-harness/docs/`）是按系统结构组织的**参考手册**；本仓库是按「依赖顺序」组织的**教程**。每章会链回官方的对应页面，让你既能按主线学习，也能随时跳去查权威细节。

## License

MIT
