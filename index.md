---
layout: home
hero:
  name: DeepSeek Harness
  text: 看懂模型之外的那套运行系统
  tagline: 从模型调用、插件机制到 Agent Runtime，逐层拆解 DeepSeek Harness。
  actions:
    - theme: brand
      text: 开始阅读
      link: /timeline
    - theme: alt
      text: 查看架构图
      link: /docs/s00-architecture-overview
    - theme: alt
      text: 在线 Demo
      link: /demo
    - theme: alt
      text: GitHub
      link: https://github.com/ScorpLin/learn-deepseek-harness
features:
  - title: Model
    details: 负责理解、推理和决策。
  - title: Harness
    details: 负责提供工具、上下文、状态和执行环境。
  - title: Agent
    details: 把模型和 Harness 组合成可持续运行的任务系统。
---

## 三条学习路径

<EntryCards />

## 架构地图

<ArchMap />

## 这套系统怎么运转

::: tip 一句话结论
Harness 不是模型本身，而是让模型能稳定完成任务的一套运行环境。
:::

- **模型负责思考** —— 理解、推理、决策。
- **Harness 负责执行** —— 提供工具、上下文、状态。
- **Tool 负责连接外部能力** —— 跑命令、读写文件、查网络。
- **Runtime 负责管理循环** —— Agent Loop 一调一调地推进。
- **Trace 负责记录过程** —— 模型可见的，都已写进 session log。

## 每一章怎么读

每章固定五步，结论先行：

1. **一句话结论** —— 这章解决什么问题，先给答案。
2. **核心概念** —— 3~5 个关键术语。
3. **代码 / 流程图** —— 最小可运行的例子。
4. **源码入口** —— 指到 vendor/ 和 packages/ 的具体文件。
5. **自测 / 小作业** —— 能不能自己重建一遍。

从 [主线 Timeline](/timeline) 开始，s01 起每个例子都能 `./run.sh <name>` 一键运行（无需 API key）。
