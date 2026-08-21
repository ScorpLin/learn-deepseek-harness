<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const progress = ref(0)

function onScroll() {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? (h.scrollTop / max) * 100 : 0
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="reading-progress">
    <div class="bar" :style="{ width: progress + '%' }" />
  </div>
</template>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 100;
  pointer-events: none;
}
.bar {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width .1s linear;
}
</style>
