---
layout: home
hero:
  name: Learn DeepSeek Harness
  text: 深入浅出，吃透这套 harness
  tagline: 模型负责推理，harness 给模型一个可工作的环境 —— 而这一切皆插件。
  image:
    src: /logo.svg
    alt: DeepSeek Harness
  actions:
    - theme: brand
      text: 从主线开始
      link: /timeline
    - theme: alt
      text: 先看架构地图
      link: /docs/s00-architecture-overview
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/ScorpLin/learn-deepseek-harness
features:
  - title: 先框架，后 agent
    details: 从 Cordis 地基（插件 / 事件 / 服务 / 配置）开始，而不是从 agent loop —— 因为 loop 本身也是个插件。
  - title: 一条主线，四个阶段
    details: 地图 → 地基 → 主干 → 动手。每章按「是什么 → 为什么 → 怎么做 → 读源码 → 自测」推进。
  - title: 贴近真实源码
    details: 每章指到 vendor/ 与 packages/ 的具体文件，另有五篇逐行源码精读。
---

## 怎么开始

从 [s00 架构总览](/docs/s00-architecture-overview) 拿地图，按四阶段读：`s01-s04 → s05-s09 → s10-s14 → s15-s19`；每走完一个阶段，停下来自己重建一遍最小版本。

阶段一的例子到工具章都能 `./run.sh <name>` 一键运行，无需 API key。另备 [四阶段分层](/layers)、[相邻章对比](/compare)、[代码阅读顺序](/docs/s00f-code-reading-order)。
