<script setup>
import { withBase } from 'vitepress'
// 动态主线：章节节点按顺序逐个点亮，悬停高亮，点击跳转到对应章节。
const raw = [
  { name: '0 · 地图', color: '#64748b', chapters: [
    ['s00-architecture-overview', 's00 架构总览', '全系统地图 + turn flow 一图流'],
    ['s00d-chapter-order-rationale', 's00d 顺序理由', '为什么先 Cordis 后 agent'],
    ['s00f-code-reading-order', 's00f 阅读顺序', '每章先开哪些文件'],
  ]},
  { name: '1 · 地基（Cordis）', color: '#38bdf8', chapters: [
    ['s01-cordis-foundation', 's01 Cordis 地基', '插件 / effect / fiber 状态机'],
    ['s02-events-and-waterfall', 's02 事件与 waterfall', '五种分发模式 + veto 短路'],
    ['s03-services-and-inject', 's03 服务与依赖注入', 'Service / inject / 依赖驱动加载'],
    ['s04-config-and-loader', 's04 配置与 Loader', 'Config schema / HMR'],
  ]},
  { name: '2 · 主干', color: '#a78bfa', chapters: [
    ['s05-capability-seam', 's05 Capability Seam', 'Definition / Provider / Consumer'],
    ['s05a-shell-seam-deep-read', 's05a shell seam 精读', '逐行追 shell 三角色'],
    ['s06-agent-loop', 's06 Agent Loop', 'turn / step / round'],
    ['s07-session-log', 's07 Session Log', '模型可见 ⟺ 已记录'],
    ['s08-tools', 's08 Tools', 'pre→execute→post→result'],
    ['s09-prompt-assembly', 's09 Prompt Assembly', 'section 分节 + schema 注入'],
  ]},
  { name: '3 · 动手', color: '#fbbf24', chapters: [
    ['s10-scope', 's10 Scope', '每 agent 注册空间 + shadowing'],
    ['s11-llm-adapter', 's11 LLM Adapter', 'LlmAdapter seam'],
    ['s12-write-a-tool', 's12 写一个工具', 'defineTool 全流程'],
    ['s13-subagent', 's13 Subagent', '委派 + lineage'],
    ['s14-skill', 's14 Skill', '目录加载 + 按需注入'],
  ]},
  { name: '4 · 平台', color: '#34d399', chapters: [
    ['s15-workflow', 's15 Workflow', '多 agent 编排'],
    ['s16-permission-approval', 's16 权限与审批', 'pre-execute 门 + approval'],
    ['s17-goal-plan', 's17 Goal 与 Plan', '同会话目标 + plan mode'],
    ['s18-sandbox-execution', 's18 沙箱与执行世界', 'sandbox/fs 共享执行世界'],
    ['s19-extensions', 's19 扩展与自修改', 'extensions + HMR 收束'],
  ]},
]

// 把每个章节展开成 { id, label, sub, n }，n 是全局序号，用于错开点亮时机
let seq = 0
const stages = raw.map(st => ({
  name: st.name,
  color: st.color,
  chapters: st.chapters.map(([id, label, sub]) => ({ id, label, sub, n: seq++ })),
}))

function delay(n) { return (n * 85) + 120 + 'ms' }
</script>

<template>
  <div class="mainline">
    <section v-for="stage in stages" :key="stage.name" class="stage">
      <div class="stage-head" :style="{ '--c': stage.color }">
        <span class="stage-dot"></span>
        <h2 class="stage-name">{{ stage.name }}</h2>
      </div>
      <ol class="chapters">
        <li v-for="ch in stage.chapters" :key="ch.id" class="chapter" :style="{ '--c': stage.color, '--d': delay(ch.n) }">
          <a :href="withBase('/docs/' + ch.id)" class="node">
            <span class="dot"></span>
            <span class="meta">
              <span class="label">{{ ch.label }}</span>
              <span class="sub">{{ ch.sub }}</span>
            </span>
          </a>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.mainline { max-width: 720px; margin: 0 auto; }
.stage { position: relative; margin: 1.4rem 0 2.2rem; padding-left: 1.4rem; border-left: 2px solid var(--vp-c-divider); }
.stage-head { display: flex; align-items: center; gap: .5rem; margin: 0 0 .6rem -1.55rem; }
.stage-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 25%, transparent); }
.stage-name { font-size: 1.05rem; font-weight: 700; margin: 0; }
.chapters { list-style: none; margin: 0; padding: 0; display: grid; gap: .5rem; }
.chapter { opacity: 0; animation: lightup .55s cubic-bezier(.2,.7,.3,1) forwards; animation-delay: var(--d); }
.node { display: flex; align-items: center; gap: .8rem; padding: .55rem .8rem; border-radius: 10px; text-decoration: none; border: 1px solid transparent; transition: border-color .2s, background .2s, transform .2s; }
.node:hover { border-color: color-mix(in srgb, var(--c) 45%, transparent); background: color-mix(in srgb, var(--c) 9%, transparent); transform: translateX(4px); }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c); flex: none; transition: box-shadow .2s, transform .2s; }
.node:hover .dot { box-shadow: 0 0 0 5px color-mix(in srgb, var(--c) 22%, transparent); transform: scale(1.25); }
.meta { display: flex; flex-direction: column; }
.label { font-weight: 600; color: var(--vp-c-text-1); }
.sub { font-size: .82rem; color: var(--vp-c-text-2); }
@keyframes lightup {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
