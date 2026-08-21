<script setup lang="ts">
import { withBase } from 'vitepress'

const entries = [
  { n: '01', title: '主线 Timeline', desc: '一条线看全 19 章 + 地图 + 源码精读', link: '/timeline' },
  { n: '02', title: '四阶段 Layers', desc: '每阶段「学完的标志」和怎么自查', link: '/layers' },
  { n: '03', title: '相邻对比 Compare', desc: '看相邻两章「升级了什么」', link: '/compare' },
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
  gap: 20px;
}
@media (max-width: 768px) {
  .entries { grid-template-columns: 1fr; }
}
.entry {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 28px 26px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  transition: border-color .15s ease;
}
.entry:hover { border-color: var(--vp-c-brand-1); }
.num {
  font-family: var(--vp-font-family-mono);
  font-size: 30px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  opacity: .45;
}
.body { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.title { font-size: 20px; font-weight: 700; color: var(--vp-c-text-1); }
.desc { font-size: 15px; color: var(--vp-c-text-2); line-height: 1.6; }
.go { color: var(--vp-c-text-3); font-size: 20px; }
</style>
