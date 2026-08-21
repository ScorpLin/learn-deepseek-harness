import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import AnimatedTimeline from './components/AnimatedTimeline.vue'
import Reveal from './components/Reveal.vue'
import ExerciseDemo from './components/ExerciseDemo.vue'
import FlowDemo from './components/FlowDemo.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AnimatedTimeline', AnimatedTimeline)
    app.component('Reveal', Reveal)
    app.component('ExerciseDemo', ExerciseDemo)
    app.component('FlowDemo', FlowDemo)
  },
} satisfies Theme
