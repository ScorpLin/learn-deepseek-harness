<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import HeroArch from './components/HeroArch.vue'
import ReadingProgress from './components/ReadingProgress.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #layout-top>
      <ReadingProgress />
    </template>
    <template #home-features-before>
      <div class="home-section">
        <h2 class="home-section-title">核心结论</h2>
      </div>
    </template>
    <template #home-hero-image>
      <HeroArch />
    </template>
  </Layout>
</template>
