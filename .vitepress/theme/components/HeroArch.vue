<script setup lang="ts">
const branches = ['Tools', 'Memory', 'Context']
</script>

<template>
  <div class="hero-arch">
    <div class="node" style="--d:.05s"><span class="t">User Request</span><span class="s">用户请求</span></div>
    <div class="arrow" style="--d:.12s">↓</div>
    <div class="node model" style="--d:.20s"><span class="t">Model</span><span class="s">理解 · 推理 · 决策</span></div>
    <div class="arrow" style="--d:.28s">↓</div>
    <div class="node harness" style="--d:.36s"><span class="t">Harness / Runtime</span><span class="s">运行环境</span></div>
    <div class="branches" style="--d:.46s">
      <div v-for="b in branches" :key="b" class="branch">{{ b }}</div>
    </div>
    <div class="arrow" style="--d:.56s">↓</div>
    <div class="node" style="--d:.64s"><span class="t">Result</span><span class="s">结果</span></div>
  </div>
</template>

<style scoped>
.hero-arch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 300px;
  padding: 8px 0;
}
.node, .arrow, .branches {
  animation: fade-up .5s ease both;
  animation-delay: var(--d, 0s);
}
.node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 9px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  min-width: 150px;
}
.node .t {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.node .s {
  font-size: 11px;
  color: var(--vp-c-text-2);
}
.node.model { border-color: var(--vp-c-brand-1); }
.node.model .t { color: var(--vp-c-brand-1); }
.node.harness { border-color: var(--vp-c-brand-2); }
.node.harness .t { color: var(--vp-c-brand-2); }
.branches { display: flex; gap: 6px; }
.branch {
  padding: 4px 9px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-2);
}
.arrow { color: var(--vp-c-text-3); line-height: 1; font-size: 14px; }
@keyframes fade-up {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
</style>
