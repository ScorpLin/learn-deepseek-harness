<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

// 滚动渐入：内容进入视口时淡入上移。用于 layers / compare 页面。
const el = ref(null)
const shown = ref(false)
let io = null

onMounted(() => {
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        shown.value = true
        io.unobserve(e.target)
      }
    }
  }, { threshold: 0.12 })
  if (el.value) io.observe(el.value)
})

onBeforeUnmount(() => io && io.disconnect())
</script>

<template>
  <div ref="el" class="reveal" :class="{ 'is-shown': shown }">
    <slot />
  </div>
</template>

<style scoped>
.reveal { opacity: 0; transform: translateY(14px); transition: opacity .5s ease, transform .5s ease; }
.reveal.is-shown { opacity: 1; transform: translateY(0); }
</style>
