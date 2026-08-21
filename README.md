# Learn DeepSeek Harness

一套写给「想真正吃透 DeepSeek Harness」的人的教学仓库。它不追求复刻产品的每一个细节，只聚焦**真正决定 agent 能不能跑好的那一套机制**，并且用「先懂概念 → 再读源码 → 最后动手重建」的顺序，带你从零走到能自己扩展、甚至重写这套 harness。

本仓库对标 [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) 的做法：同样的「设计主干」教学理念，套在 DeepSeek Harness（`dsh`）上。

## 一句话，先建立心智模型

> **模型负责推理，harness 给模型一个可工作的环境。**

而 DeepSeek Harness 构建这个「环境」的方式，只有一句话：

> **一切皆插件（everything is a plugin）。**

模型适配器、工具注册表、会话日志、甚至 agent 循环本身，全都是插件。没有「特权核心」可以打补丁——你要扩展它，就是往旁边再挂一个插件。这套思想的底层框架叫 **Cordis**（vendored 在 `vendor/` 里——即把 Cordis 源码直接拷进仓库的目录），所以**整个学习路线从 Cordis 开始，而不是从 agent 开始**。

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

**阶段一（s01-s04）完全自包含**：Cordis 已 vendor（内置）进本仓库的 `vendor/`，你只需要装一次依赖：

```sh
cd learn-deepseek-harness
npm install
```

然后一键跑例子：

```sh
./run.sh 01-first-plugin
```

阶段一的例子无需 API key。

> **阶段二（s05+）** 要写真正的 dsh 工具/seam，例子会 `import` deepseek-harness 的业务包（`dsh-shell`、`dsh-tools`…），那时才需要一份 deepseek-harness 源码（`git clone https://github.com/deepseek-ai/deepseek-harness.git` + `pnpm install`）。到 s05 章会讲。

## 推荐阅读顺序

**第一次来，不要随机开章节。** 最稳的路径：

1. 读 [docs/s00-architecture-overview.md](docs/s00-architecture-overview.md) —— 全系统地图
2. 读 [docs/s00d-chapter-order-rationale.md](docs/s00d-chapter-order-rationale.md) —— 为什么是这个顺序
3. 读 [docs/s00f-code-reading-order.md](docs/s00f-code-reading-order.md) —— 每章先开哪些文件
4. 按四个阶段顺序走：`s01-s04 → s05-s09 → s10-s14 → s15-s19`
5. **每走完一个阶段，停下来，自己重建一遍最小版本再继续**
6. 每章结尾的 `## 小作业` + 达标标准，动手做——**能默写才算过**（见 [exercises/](exercises/README.md)）

如果读到中间开始模糊，按这个顺序「复位」：

1. [docs/glossary.md](docs/glossary.md)
2. [docs/data-structures.md](docs/data-structures.md)
3. 卡住的那一章最近的「桥接」章节
4. 回到章节正文

## 课程地图

按四阶段分组，每个章节点进去即可读（`a` 结尾的是对应主章的「源码精读」）。

### 0 · 地图

- [**s00 架构总览**](docs/s00-architecture-overview.md) —— 全系统地图、turn flow 一图流
- [**s00d 章节顺序理由**](docs/s00d-chapter-order-rationale.md) —— 为什么先 Cordis 后 agent
- [**s00f 代码阅读顺序**](docs/s00f-code-reading-order.md) —— 每章先开哪些文件

### 1 · 地基（Cordis）

- [**s01 Cordis 地基**](docs/s01-cordis-foundation.md) —— 插件 / effect / fiber 状态机
- [**s02 事件与 waterfall**](docs/s02-events-and-waterfall.md) —— 五种分发模式 + veto 短路
- [**s03 服务与依赖注入**](docs/s03-services-and-inject.md) —— Service / inject / 依赖驱动加载
- [**s04 配置与 Loader**](docs/s04-config-and-loader.md) —— Config schema / HMR

### 2 · 主干

- [**s05 Capability Seam**](docs/s05-capability-seam.md) —— Definition / Provider / Consumer 三角色
- [**s05a shell seam 精读**](docs/s05a-shell-seam-deep-read.md) —— 逐文件追三角色
- [**s06 Agent Loop**](docs/s06-agent-loop.md) —— turn / step / round
- [**s06a agent-loop 精读**](docs/s06a-agent-loop-deep-read.md) —— 逐文件追 turn 循环
- [**s07 Session Log**](docs/s07-session-log.md) —— 模型可见 ⟺ 已记录
- [**s07a session-log 精读**](docs/s07a-session-log-deep-read.md) —— 逐文件追 log 派生
- [**s08 Tools**](docs/s08-tools.md) —— pre→execute→post→result 管线
- [**s08a tools 管线精读**](docs/s08a-tools-deep-read.md) —— 逐文件追执行管线
- [**s09 Prompt Assembly**](docs/s09-prompt-assembly.md) —— section 分节 + schema 注入

### 3 · 动手

- [**s10 Scope**](docs/s10-scope.md) —— 每 agent 注册空间 + shadowing
- [**s11 LLM Adapter**](docs/s11-llm-adapter.md) —— LlmAdapter seam
- [**s11a llm adapter 精读**](docs/s11a-llm-adapter-deep-read.md) —— 逐文件追 adapter 契约
- [**s12 写一个工具**](docs/s12-write-a-tool.md) —— defineTool 全流程
- [**s13 Subagent**](docs/s13-subagent.md) —— 委派 + lineage
- [**s14 Skill**](docs/s14-skill.md) —— 目录加载 + 按需注入

### 4 · 平台

- [**s15 Workflow**](docs/s15-workflow.md) —— 多 agent 编排
- [**s16 权限与审批**](docs/s16-permission-approval.md) —— pre-execute 门 + approval
- [**s17 Goal 与 Plan**](docs/s17-goal-plan.md) —— 同会话目标 + plan mode
- [**s18 沙箱与执行世界**](docs/s18-sandbox-execution.md) —— sandbox/fs 共享执行世界
- [**s19 扩展与自修改**](docs/s19-extensions.md) —— extensions + HMR

## 可运行例子

- **独立可运行例子**（`examples/01-first-plugin` ~ `06-seam`）：阶段一（s01-s04）的 Cordis 地基、s05 的「capability seam」（→ `examples/06-seam`）、s08/s12 的「写工具」（→ `examples/05-tool`），都有 `./run.sh <name>` 一键运行的例子，无需 API key。
- **源码精读章**（s06-s07、s09-s11、s13-s19，另有 s05a/s06a/s07a/s08a/s11a 五篇逐行精读）：这些章讲的是真实 harness 能力（loop/log/tools/adapter/subagent…），它们的「例子」就是**读 `packages/` 里的真实源码**——按 [s00f · 代码阅读顺序](docs/s00f-code-reading-order.md) 逐包追 Definition → Provider → Consumer。

`run.sh` 会用本仓库 `vendor/cordis/bin.js` 直接运行例子（自包含，无需 deepseek-harness）。

## 目录结构

```
learn-deepseek-harness/
├── README.md                  # 你正在读的入口 + 路线图
├── run.sh                     # 一键运行例子（自包含，无需 deepseek-harness）
├── docs/                      # 课程正文（s00 地图 + s01-s19 章节 + 5 篇源码精读）
│   ├── s00-architecture-overview.md
│   ├── s00d-chapter-order-rationale.md
│   ├── s00f-code-reading-order.md
│   ├── glossary.md / teaching-scope.md / data-structures.md / entity-map.md
│   ├── s01-cordis-foundation.md ... s19-extensions.md
│   └── s05a/s06a/s07a/s08a/s11a 五篇源码精读（*-deep-read.md）
├── examples/                  # 每章的可运行最小例子（01-06）
│   ├── 01-first-plugin/ ... 06-seam/
│   └── ...
├── exercises/                 # 小作业：参考答案 + 达标标准说明
│   ├── README.md
│   └── answers/
├── index.md / timeline.md / layers.md / compare.md   # VitePress 自定义页
├── .vitepress/config.ts       # VitePress 配置（侧边栏 + mermaid）
└── package.json               # npm 脚本（dev/build/preview）
```

## Web 教学站

仓库带一个 VitePress 站点，把课程投影成可视化视图：

```sh
npm install       # 首次
npm run dev       # http://127.0.0.1:5173
```

三个可视化路由：

- `/timeline` —— 主线：19 章 + 地图，一条 mermaid 流程图看全
- `/layers` —— 四阶段边界 + 每阶段「学完的标志」
- `/compare` —— 相邻两章「升级了什么」，卡住时的诊断入口

```

## 与官方文档的关系

本仓库**不是**官方文档的替代品，而是它的「教学线」。官方文档（`deepseek-harness/docs/`）是按系统结构组织的**参考手册**；本仓库是按「依赖顺序」组织的**教程**。每章会链回官方的对应页面，让你既能按主线学习，也能随时跳去查权威细节。

## License

MIT

> 在线预览：https://scorplin.github.io/learn-deepseek-harness/
