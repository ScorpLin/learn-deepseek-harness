import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import AnimatedTimeline from './components/AnimatedTimeline.vue'
import Reveal from './components/Reveal.vue'
import ExerciseDemo from './components/ExerciseDemo.vue'
import FlowDemo from './components/FlowDemo.vue'
import EntryCards from './components/EntryCards.vue'
import ArchMap from './components/ArchMap.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('AnimatedTimeline', AnimatedTimeline)
    app.component('Reveal', Reveal)
    app.component('ExerciseDemo', ExerciseDemo)
    app.component('FlowDemo', FlowDemo)
    app.component('EntryCards', EntryCards)
    app.component('ArchMap', ArchMap)
  },
} satisfies Theme
