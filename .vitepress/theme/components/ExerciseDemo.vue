<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 「代码执行轨迹」动画：每步 = 一段实际代码 + 这行干嘛（注释）+ 执行输出（→）。
// 像调试器单步执行，而不是抽象的文字描述。
// steps: [{ code: '实际代码', comment: '这行干嘛', output: '执行效果', color }]
const props = defineProps({
  steps: { type: Array, required: true },
  interval: { type: Number, default: 1300 },
})

const visible = ref(0)
const playing = ref(true)
let timer = null

function run() {
  stop()
  timer = setInterval(() => {
    if (visible.value < props.steps.length) visible.value++
    else { stop(); playing.value = false }
  }, props.interval)
}
function stop() { if (timer) { clearInterval(timer); timer = null } }
function start() { visible.value = 0; playing.value = true; run() }
function togglePlay() {
  if (playing.value) { stop(); playing.value = false }
  else { playing.value = true; run() }
}
function next() {
  stop(); playing.value = false
  if (visible.value < props.steps.length) visible.value++
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
          <pre class="code">{{ s.code }}</pre>
          <div v-if="s.comment" class="comment"># {{ s.comment }}</div>
          <div v-if="s.output" class="output">→ {{ s.output }}</div>
        </div>
      </li>
    </ol>
    <div class="controls">
      <button class="btn" @click="togglePlay">{{ playing ? '⏸ 暂停' : '▶ 播放' }}</button>
      <button class="btn" @click="next" :disabled="visible >= steps.length">⏭ 下一步</button>
      <button class="btn" @click="start">↻ 重播</button>
    </div>
  </div>
</template>

<style scoped>
.trace { max-width: 720px; margin: 0 auto; }
.steps { list-style: none; margin: 0; padding: 0; }
.step { display: flex; gap: .8rem; opacity: 0; transform: translateY(6px); transition: opacity .4s ease, transform .4s ease; }
.step.on { opacity: 1; transform: translateY(0); }
.step.current .dot { animation: pulse 1s ease-in-out infinite; }
.rail { position: relative; display: flex; flex-direction: column; align-items: center; flex: none; }
.rail::after { content: ''; width: 2px; flex: 1; background: var(--vp-c-divider); margin-top: 4px; }
.step:last-child .rail::after { display: none; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--c); flex: none; }
.card { flex: 1; border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: .55rem .75rem; margin-bottom: .7rem; background: var(--vp-c-bg-soft); }
.code { margin: 0; padding: .45rem .6rem; background: var(--vp-code-block-bg); border-radius: 6px; font-size: .85rem; font-family: var(--vp-font-family-mono); overflow-x: auto; color: var(--vp-c-text-1); white-space: pre-wrap; word-break: break-word; }
.comment { margin-top: .35rem; font-size: .82rem; color: var(--vp-c-text-2); }
.output { margin-top: .3rem; font-size: .85rem; color: #34d399; font-family: var(--vp-font-family-mono); }
.controls { display: flex; gap: .5rem; margin-top: .8rem; }
.btn { padding: .35rem .9rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: transparent; color: var(--vp-c-text-1); cursor: pointer; font-size: .85rem; }
.btn:hover:not(:disabled) { border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
.btn:disabled { opacity: .4; cursor: default; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 28%, transparent); }
  50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--c) 10%, transparent); }
}
</style>
