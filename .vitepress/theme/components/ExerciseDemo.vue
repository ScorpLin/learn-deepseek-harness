<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 「代码执行轨迹」动画：顶部流程图（阶段）+ 底部代码步骤（code/comment/output）。
// steps: [{ code, comment?, output?, stage?, color? }]
//   code   = 实际代码
//   comment= 这行干嘛
//   output = 执行效果
//   stage  = 这一步属于哪个功能/阶段（用于顶部流程图高亮）
const props = defineProps({
  steps: { type: Array, required: true },
  interval: { type: Number, default: 1400 },
})

const visible = ref(1)     // 已揭示的步数：默认停在第一步，不自动播
const playing = ref(false)
let timer = null

// 去重保留顺序，得到「阶段」列表（顶部流程图）
const stageOrder = computed(() => {
  const seen = []
  for (const s of props.steps) {
    if (s.stage && !seen.includes(s.stage)) seen.push(s.stage)
  }
  return seen
})

// 当前高亮的阶段（当前步的 stage）
const currentStage = computed(() => {
  const idx = Math.min(visible.value, props.steps.length) - 1
  return idx >= 0 ? props.steps[idx].stage : null
})

function isStageActive(st) { return st === currentStage.value }

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
    if (visible.value >= props.steps.length) visible.value = 1  // 已播完，重新开始
    playing.value = true
    run()
  }
}
function next() {
  stop(); playing.value = false
  if (visible.value >= props.steps.length) visible.value = 1  // 已到末尾，回到第 1 步
  else visible.value++
}

onMounted(stop)          // 不自动播放，停在第一步
onBeforeUnmount(stop)
</script>

<template>
  <div class="trace">
    <!-- 顶部流程图：阶段节点 + 箭头 -->
    <div v-if="stageOrder.length > 0" class="flowmap">
      <template v-for="(st, i) in stageOrder" :key="st">
        <span class="flow-node" :class="{ active: isStageActive(st) }">{{ st }}</span>
        <span v-if="i < stageOrder.length - 1" class="flow-arrow">→</span>
      </template>
    </div>

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
          <div class="meta-row">
            <span v-if="s.stage" class="badge" :style="{ '--c': s.color || '#38bdf8' }">{{ s.stage }}</span>
            <span v-if="s.comment" class="comment"># {{ s.comment }}</span>
          </div>
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
</template>

<style scoped>
.trace { max-width: 720px; margin: 0 auto; }
.flowmap { display: flex; align-items: center; flex-wrap: wrap; gap: .4rem; margin: 0 0 1.1rem; padding: .6rem .8rem; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg-soft); }
.flow-node { font-size: .82rem; font-weight: 600; color: var(--vp-c-text-2); padding: .2rem .55rem; border-radius: 999px; border: 1px solid var(--vp-c-divider); transition: all .3s ease; }
.flow-node.active { color: #fff; background: var(--vp-c-brand); border-color: var(--vp-c-brand); }
.flow-arrow { color: var(--vp-c-text-3); }
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
.meta-row { display: flex; align-items: center; flex-wrap: wrap; gap: .45rem; margin-top: .35rem; }
.badge { font-size: .72rem; font-weight: 600; color: var(--c); border: 1px solid color-mix(in srgb, var(--c) 40%, transparent); background: color-mix(in srgb, var(--c) 10%, transparent); padding: .05rem .5rem; border-radius: 999px; flex: none; }
.comment { font-size: .82rem; color: var(--vp-c-text-2); }
.output { margin-top: .3rem; font-size: .85rem; color: #34d399; font-family: var(--vp-font-family-mono); }
.controls { display: flex; gap: .5rem; margin-top: .8rem; }
.btn { padding: .35rem .9rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: transparent; color: var(--vp-c-text-1); cursor: pointer; font-size: .85rem; }
.btn:hover { border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 28%, transparent); }
  50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--c) 10%, transparent); }
}
</style>
