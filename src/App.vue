<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useSeo } from '@/composables/useSeo.js'

useSeo()
</script>

<template>
  <AppHeader />
  <main class="main">
    <router-view />
  </main>
  <AppFooter />
</template>

<style scoped>
.main {
  min-height: calc(100vh - 64px - 200px);
}
</style>
