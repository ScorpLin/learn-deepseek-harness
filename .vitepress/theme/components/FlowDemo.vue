<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

// SVG 流程图动画（仿 learn-claude-code）：节点有形状（start/process/decision/end），
// 带箭头的边连接，逐步高亮当前节点，右栏显示标题+说明。
// nodes: [{ type, label, color }]   type: start|process|decision|end
// steps: [{ title, desc }]          与 nodes 等长
const props = defineProps({
  nodes: { type: Array, required: true },
  steps: { type: Array, required: true },
  interval: { type: Number, default: 2000 },
})

const visible = ref(1)
const playing = ref(false)
let timer = null

const NODE_W = 180
const NODE_H = 46
const DIAMOND_H = 60
const GAP = 74
const PAD = 26
const W = computed(() => NODE_W + PAD * 2)
const H = computed(() => props.nodes.length * GAP + PAD * 2)

function nodeY(i) { return PAD + i * GAP }
function nodeH(n) { return n.type === 'decision' ? DIAMOND_H : NODE_H }
const curIdx = computed(() => Math.min(visible.value, props.nodes.length) - 1)
function stateOf(i) {
  if (i < curIdx.value) return 'done'
  if (i === curIdx.value) return 'active'
  return 'todo'
}
function edgeOn(i) { return i < curIdx.value }

function run() {
  stop()
  timer = setInterval(() => {
    if (visible.value < props.nodes.length) visible.value++
    else { stop(); playing.value = false }
  }, props.interval)
}
function stop() { if (timer) { clearInterval(timer); timer = null } }
function start() { visible.value = 1; playing.value = true; run() }
function togglePlay() {
  if (playing.value) { stop(); playing.value = false }
  else { if (visible.value >= props.nodes.length) visible.value = 1; playing.value = true; run() }
}
function next() { stop(); playing.value = false; if (visible.value >= props.nodes.length) visible.value = 1; else visible.value++ }
function prev() { stop(); playing.value = false; if (visible.value > 1) visible.value-- }
onBeforeUnmount(stop)
</script>

<template>
  <div class="flowdemo">
    <div class="layout">
      <div class="svg-panel">
        <svg :viewBox="'0 0 ' + W + ' ' + H" :width="'100%'" :style="{ maxWidth: W + 'px' }">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#38bdf8" />
            </marker>
          </defs>
          <g v-for="(n, i) in nodes.slice(0, -1)" :key="'e' + i">
            <line
              :x1="W / 2" :y1="nodeY(i) + nodeH(nodes[i]) / 2"
              :x2="W / 2" :y2="nodeY(i + 1) - nodeH(nodes[i + 1]) / 2"
              :stroke="edgeOn(i) ? (nodes[i].color || '#38bdf8') : 'var(--vp-c-divider)'"
              :stroke-width="edgeOn(i) ? 2 : 1.5"
              marker-end="url(#arrow)"
            />
          </g>
          <g v-for="(n, i) in nodes" :key="'n' + i" :class="['node', stateOf(i)]" :style="{ '--c': n.color || '#38bdf8' }">
            <rect
              v-if="n.type !== 'decision'"
              :x="W / 2 - NODE_W / 2" :y="nodeY(i)" :width="NODE_W" :height="NODE_H"
              :rx="n.type === 'start' || n.type === 'end' ? NODE_H / 2 : 6"
              class="node-shape"
            />
            <path
              v-else
              :d="'M ' + (W / 2) + ',' + nodeY(i) + ' L ' + (W / 2 + 80) + ',' + (nodeY(i) + DIAMOND_H / 2) + ' L ' + (W / 2) + ',' + (nodeY(i) + DIAMOND_H) + ' L ' + (W / 2 - 80) + ',' + (nodeY(i) + DIAMOND_H / 2) + ' Z'"
              class="node-shape"
            />
            <text :x="W / 2" :y="nodeY(i) + nodeH(n) / 2 + 4" text-anchor="middle" class="node-label">{{ n.label }}</text>
          </g>
        </svg>
      </div>

      <div class="info-panel">
        <div class="info-title">{{ steps[curIdx].title }}</div>
        <div class="info-desc">{{ steps[curIdx].desc }}</div>
        <div class="controls">
          <button class="btn" @click="prev" :disabled="visible <= 1">← 上一步</button>
          <button class="btn" @click="togglePlay">{{ playing ? '⏸ 暂停' : '▶ 播放' }}</button>
          <button class="btn" @click="next">下一步 →</button>
          <button class="btn" @click="start">↻ 重播</button>
        </div>
        <div class="progress">{{ curIdx + 1 }} / {{ nodes.length }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flowdemo { max-width: 760px; margin: 0 auto; }
.layout { display: grid; grid-template-columns: 1fr 260px; gap: 1rem; align-items: start; }
@media (max-width: 820px) { .layout { grid-template-columns: 1fr; } }
.svg-panel { border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: .5rem; background: var(--vp-c-bg-soft); }
.node-shape { fill: var(--vp-c-bg); stroke: var(--vp-c-divider); stroke-width: 1.5; transition: all .35s ease; }
.node-label { font-size: 12px; font-weight: 600; fill: var(--vp-c-text-2); transition: all .35s ease; }
.node.todo .node-shape { opacity: .4; }
.node.done .node-shape { fill: color-mix(in srgb, var(--c) 6%, var(--vp-c-bg)); stroke: color-mix(in srgb, var(--c) 45%, transparent); }
.node.done .node-label { fill: var(--vp-c-text-1); }
.node.active .node-shape { fill: color-mix(in srgb, var(--c) 14%, var(--vp-c-bg)); stroke: var(--c); stroke-width: 2.5; filter: drop-shadow(0 0 4px color-mix(in srgb, var(--c) 45%, transparent)); }
.node.active .node-label { fill: var(--c); font-weight: 700; }
.info-panel { position: sticky; top: 72px; border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: .9rem; background: var(--vp-c-bg-soft); }
.info-title { font-size: 1.05rem; font-weight: 700; color: var(--vp-c-text-1); }
.info-desc { margin-top: .4rem; font-size: .88rem; color: var(--vp-c-text-2); line-height: 1.6; }
.controls { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: .9rem; }
.btn { padding: .32rem .75rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: transparent; color: var(--vp-c-text-1); cursor: pointer; font-size: .83rem; }
.btn:hover:not(:disabled) { border-color: var(--vp-c-brand); color: var(--vp-c-brand); }
.btn:disabled { opacity: .4; cursor: default; }
.progress { margin-top: .6rem; font-size: .78rem; color: var(--vp-c-text-3); }
</style>
