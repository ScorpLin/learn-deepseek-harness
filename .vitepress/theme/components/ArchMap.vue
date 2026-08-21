<script setup lang="ts">
import { withBase } from 'vitepress'

const leaves = [
  { label: 'Tool Interface', chapter: 'Tools · s08', link: '/docs/s08-tools' },
  { label: 'Context & Memory', chapter: 'Prompt Assembly · s09', link: '/docs/s09-prompt-assembly' },
  { label: 'Execution Sandbox', chapter: 'Sandbox · s18', link: '/docs/s18-sandbox-execution' },
  { label: 'Lifecycle & Orchestration', chapter: 'Goal & Plan · s17', link: '/docs/s17-goal-plan' },
]
</script>

<template>
  <div class="archmap">
    <a class="node" :href="withBase('/docs/s11-llm-adapter')"><span class="label">Model</span><span class="chapter">LLM Adapter · s11</span></a>
    <div class="link">↓</div>
    <a class="node" :href="withBase('/docs/s06-agent-loop')"><span class="label">Agent Loop</span><span class="chapter">Agent Loop · s06</span></a>
    <div class="link">↓</div>
    <a class="node core" :href="withBase('/docs/s00-architecture-overview')"><span class="label">Runtime</span><span class="chapter">架构总览 · s00</span></a>
    <div class="link">↓</div>
    <div class="leaves">
      <a v-for="l in leaves" :key="l.label" class="leaf" :href="withBase(l.link)"><span class="label">{{ l.label }}</span><span class="chapter">{{ l.chapter }}</span></a>
    </div>
    <div class="link">↓</div>
    <a class="node" :href="withBase('/docs/s07-session-log')"><span class="label">Observation / Trace / Evaluation</span><span class="chapter">Session Log · s07</span></a>
  </div>
</template>

<style scoped>
.archmap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
}
.node, .leaf {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: border-color .15s ease, background .15s ease;
}
.node:hover, .leaf:hover { border-color: var(--vp-c-brand-1); }
.node .label, .leaf .label {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.node .chapter, .leaf .chapter { font-size: 11px; color: var(--vp-c-text-3); }
.node.core { border-color: var(--vp-c-brand-1); }
.node.core .label { color: var(--vp-c-brand-1); }
.leaves {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 760px;
}
@media (max-width: 720px) {
  .leaves { grid-template-columns: repeat(2, 1fr); }
}
.leaf { padding: 10px 12px; text-align: center; }
.link { color: var(--vp-c-text-3); line-height: 1; font-size: 14px; }
</style>
