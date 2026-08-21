<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 可复用的「执行轨迹」动画：按顺序逐步播放代码执行的关键步骤，像程序运行时打日志。
// steps: [{ label, detail?, code?, color? }]  —— label 是这一步的标题，detail 是说明，code 是可选代码块。
const props = defineProps({
  steps: { type: Array, required: true },
  interval: { type: Number, default: 1100 },
})

const visible = ref(0)   // 已揭示的步数
let timer = null

function start() {
  stop()
  visible.value = 0
  timer = setInterval(() => {
    if (visible.value < props.steps.length) visible.value++
    else stop()
  }, props.interval)
}

function stop() {
  if (timer) { clearInterval(timer); timer = null }
}

onMounted(start)
onBeforeUnmount(stop)
</script>

<template>
  <div class="trace">
    <ol class="steps">
      <li
        v-for="(s, i) in steps"
        :key="i"
        class="step"
        :class="{ on: i < visible, current: i === visible - 1 }"
        :style="{ '--c': s.color || '#38bdf8' }"
      >
        <span class="rail"><span class="dot"></span></span>
        <div class="card">
          <div class="label">{{ s.label }}</div>
          <div v-if="s.detail" class="detail">{{ s.detail }}</div>
          <pre v-if="s.code" class="code">{{ s.code }}</pre>
        </div>
      </li>
    </ol>
    <button class="replay" @click="start">↻ 重播</button>
  </div>
</template>

<style scoped>
.trace { max-width: 680px; margin: 0 auto; }
.steps { list-style: none; margin: 0; padding: 0; }
.step { display: flex; gap: .9rem; opacity: 0; transform: translateY(8px); transition: opacity .45s ease, transform .45s ease; }
.step.on { opacity: 1; transform: translateY(0); }
.step.current .dot { box-shadow: 0 0 0 5px color-mix(in srgb, var(--c) 28%, transparent); animation: pulse 1s ease-in-out infinite; }
.rail { position: relative; display: flex; flex-direction: column; align-items: center; flex: none; }
.rail::after { content: ''; width: 2px; flex: 1; background: var(--vp-c-divider); margin-top: 4px; }
.step:last-child .rail::after { display: none; }
.dot { width: 11px; height: 11px; border-radius: 50%; background: var(--c); flex: none; }
.card { flex: 1; border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: .6rem .8rem; margin-bottom: .9rem; background: var(--vp-c-bg-soft); }
.label { font-weight: 600; color: var(--vp-c-text-1); }
.detail { font-size: .85rem; color: var(--vp-c-text-2); margin-top: .15rem; }
.code { margin: .4rem 0 0; padding: .5rem .7rem; background: var(--vp-code-block-bg); border-radius: 6px; font-size: .82rem; overflow-x: auto; }
.replay { margin-top: .8rem; padding: .35rem .9rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: transparent; color: var(--vp-c-text-1); cursor: pointer; font-size: .85rem; }
.replay:hover { border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--c) 28%, transparent); }
  50% { box-shadow: 0 0 0 9px color-mix(in srgb, var(--c) 10%, transparent); }
}
</style>
