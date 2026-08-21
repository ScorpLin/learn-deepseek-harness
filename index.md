---
layout: home
hero:
  name: Learn DeepSeek Harness
  text: 深入浅出，吃透这套 harness
  tagline: 模型负责推理，harness 给模型一个可工作的环境 —— 而这一切皆插件。
  actions:
    - theme: brand
      text: 从主线开始
      link: /timeline
    - theme: alt
      text: 直接读第一章
      link: /docs/s01-cordis-foundation
features:
  - title: 先框架，后 agent
    details: 从 Cordis 地基（插件/事件/服务/配置）开始，而不是从 agent loop 开始——因为 loop 本身也是个插件。
  - title: 一条主线，四个阶段
    details: 地图 → 地基 → 主干 → 动手 → 平台。每章「是什么 → 为什么 → 怎么做 → 读源码 → 自测」。
  - title: 贴近真实源码
    details: 每章指到 vendor/ 和 packages/ 的具体文件，s05a 带你逐行精读 shell seam。
---

## 三个入口，随你选

- **[主线 Timeline](/timeline)** —— 第一次来先看这个：19 章 + 地图，一条线看全。
- **[四阶段 Layers](/layers)** —— 阶段边界和「每阶段学完能干嘛」。
- **[相邻对比 Compare](/compare)** —— 读到中间卡住时，看相邻两章「升级了什么」。

## 一句话模型

> **模型负责推理，harness 给模型一个可工作的环境。**

而 DeepSeek Harness 构建这个环境的方式只有一句话：

> **一切皆插件（everything is a plugin）。**

## 怎么读

1. 从 [s00 架构总览](/docs/s00-architecture-overview) 拿地图
2. 按 [s00f 代码阅读顺序](/docs/s00f-code-reading-order) 知道先开哪些文件
3. 走四阶段：`s01-s04 → s05-s09 → s10-s14 → s15-s19`
4. **每走完一个阶段，停下来自己重建一遍最小版本**

## 可运行例子

阶段一（s01-s04）和工具章有 `./run.sh <name>` 一键运行的例子（无需 API key），见仓库 [examples/](https://github.com/../tree/main/examples) 目录。
