<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 「代码执行轨迹」动画：左栏代码逐步演示，右栏功能流程图（竖排，当前阶段高亮）。
// steps: [{ code, comment?, output?, stage?, color? }]
const props = defineProps({
  steps: { type: Array, required: true },
  interval: { type: Number, default: 1400 },
})

const visible = ref(1)     // 已揭示步数，默认停在第一步
const playing = ref(false)
let timer = null

const stageOrder = computed(() => {
  const seen = []
  for (const s of props.steps) if (s.stage && !seen.includes(s.stage)) seen.push(s.stage)
  return seen
})

const currentIdx = computed(() => Math.min(visible.value, props.steps.length) - 1)
const currentStage = computed(() => currentIdx.value >= 0 ? props.steps[currentIdx.value].stage : null)
function stageState(st) {
  const ci = stageOrder.value.indexOf(st)
  const cur = stageOrder.value.indexOf(currentStage.value)
  if (ci < cur) return 'done'
  if (ci === cur) return 'active'
  return 'todo'
}
function colorOf(st) {
  const s = props.steps.find(x => x.stage === st)
  return s ? (s.color || '#38bdf8') : '#38bdf8'
}

function run() {
  stop()
  timer = setInterval(() => {
    if (visible.value < props.steps.length) visible.value++
    else { stop(); playing.value = false }
  }, props.interval)
}
function stop() { if (timer) { clearInterval(timer); timer = null } }
function start() { visible.value = 1; playing.value = true; run() }
function togglePlay() {
  if (playing.value) { stop(); playing.value = false }
  else {
    if (visible.value >= props.steps.length) visible.value = 1
    playing.value = true
    run()
  }
}
function next() {
  stop(); playing.value = false
  if (visible.value >= props.steps.length) visible.value = 1
  else visible.value++
}

onMounted(stop)
onBeforeUnmount(stop)
</script>

<template>
  <div class="demo">
    <div class="layout">
      <!-- 左栏：代码步骤 -->
      <div class="code-panel">
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
          <button class="btn" @click="next">⏭ 下一步</button>
          <button class="btn" @click="start">↻ 重播</button>
        </div>
      </div>

      <!-- 右栏：功能流程图 -->
      <div class="fn-panel">
        <div class="fn-title">功能流程</div>
        <div class="fn-flow">
          <template v-for="(st, i) in stageOrder" :key="st">
            <div class="fn-node" :class="stageState(st)" :style="{ '--c': colorOf(st) }">
              <span class="fn-dot"></span>
              <span class="fn-name">{{ st }}</span>
            </div>
            <div v-if="i < stageOrder.length - 1" class="fn-arrow">↓</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo { max-width: 980px; margin: 0 auto; }
.layout { display: grid; grid-template-columns: 1fr 240px; gap: 1.2rem; align-items: start; }
@media (max-width: 820px) { .layout { grid-template-columns: 1fr; } }
.steps { list-style: none; margin: 0; padding: 0; }
.step { display: flex; gap: .7rem; opacity: 0; transform: translateY(6px); transition: opacity .4s ease, transform .4s ease; }
.step.on { opacity: 1; transform: translateY(0); }
.step.current .dot { animation: pulse 1s ease-in-out infinite; }
.rail { position: relative; display: flex; flex-direction: column; align-items: center; flex: none; }
.rail::after { content: ''; width: 2px; flex: 1; background: var(--vp-c-divider); margin-top: 4px; }
.step:last-child .rail::after { display: none; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--c); flex: none; }
.card { flex: 1; border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: .5rem .7rem; margin-bottom: .6rem; background: var(--vp-c-bg-soft); }
.code { margin: 0; padding: .4rem .55rem; background: var(--vp-code-block-bg); border-radius: 6px; font-size: .84rem; font-family: var(--vp-font-family-mono); overflow-x: auto; color: var(--vp-c-text-1); white-space: pre-wrap; word-break: break-word; }
.comment { margin-top: .3rem; font-size: .8rem; color: var(--vp-c-text-2); }
.output { margin-top: .25rem; font-size: .84rem; color: #34d399; font-family: var(--vp-font-family-mono); }
.controls { display: flex; gap: .5rem; margin-top: .6rem; }
.btn { padding: .3rem .85rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: transparent; color: var(--vp-c-text-1); cursor: pointer; font-size: .85rem; }
.btn:hover { border-color: var(--vp-c-brand); color: var(--vp-c-brand); }

.fn-panel { position: sticky; top: 72px; border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: .8rem; background: var(--vp-c-bg-soft); }
.fn-title { font-size: .8rem; font-weight: 700; color: var(--vp-c-text-2); margin-bottom: .6rem; }
.fn-flow { display: flex; flex-direction: column; align-items: stretch; }
.fn-node { display: flex; align-items: center; gap: .45rem; padding: .4rem .5rem; border-radius: 8px; border: 1px solid transparent; transition: all .3s ease; }
.fn-node .fn-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c); flex: none; opacity: .35; transition: all .3s ease; }
.fn-node .fn-name { font-size: .85rem; color: var(--vp-c-text-2); transition: color .3s ease; }
.fn-node.active { border-color: color-mix(in srgb, var(--c) 55%, transparent); background: color-mix(in srgb, var(--c) 12%, transparent); }
.fn-node.active .fn-dot { opacity: 1; box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 25%, transparent); }
.fn-node.active .fn-name { color: var(--vp-c-text-1); font-weight: 700; }
.fn-node.done .fn-dot { opacity: .7; }
.fn-node.done .fn-name { color: var(--vp-c-text-1); }
.fn-arrow { text-align: center; color: var(--vp-c-text-3); font-size: .8rem; line-height: 1; padding: .1rem 0; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 28%, transparent); }
  50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--c) 10%, transparent); }
}
</style>
