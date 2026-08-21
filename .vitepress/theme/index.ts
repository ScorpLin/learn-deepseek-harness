import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import AnimatedTimeline from './components/AnimatedTimeline.vue'
import Reveal from './components/Reveal.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AnimatedTimeline', AnimatedTimeline)
    app.component('Reveal', Reveal)
  },
} satisfies Theme
