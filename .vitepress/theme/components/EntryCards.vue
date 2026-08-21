<script setup lang="ts">
import { withBase } from 'vitepress'

const entries = [
  { n: '01', title: 'Timeline', desc: '从代码演进看 Harness 如何形成', link: '/timeline' },
  { n: '02', title: 'Layers', desc: '从四个层次理解系统结构', link: '/layers' },
  { n: '03', title: 'Compare', desc: '看不同 Agent Harness 的设计差异', link: '/compare' },
]
</script>

<template>
  <div class="entries">
    <a v-for="e in entries" :key="e.link" class="entry" :href="withBase(e.link)">
      <span class="num">{{ e.n }}</span>
      <span class="body">
        <span class="title">{{ e.title }}</span>
        <span class="desc">{{ e.desc }}</span>
      </span>
      <span class="go">→</span>
    </a>
  </div>
</template>

<style scoped>
.entries {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 768px) {
  .entries { grid-template-columns: 1fr; }
}
.entry {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  text-decoration: none;
  transition: border-color .15s ease;
}
.entry:hover { border-color: var(--vp-c-brand-1); }
.num {
  font-family: var(--vp-font-family-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  opacity: .45;
}
.body { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.title { font-size: 16px; font-weight: 700; color: var(--vp-c-text-1); }
.desc { font-size: 13px; color: var(--vp-c-text-2); line-height: 1.5; }
.go { color: var(--vp-c-text-3); font-size: 16px; }
</style>
