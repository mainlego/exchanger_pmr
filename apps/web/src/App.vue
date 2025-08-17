<template>
  <div id="app" class="min-h-screen flex flex-col">
    <router-view v-slot="{ Component }" class="flex-1">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { useTelegram } from '@/composables/useTelegram'
import { useTheme } from '@/composables/useTheme'

const { initWebApp } = useTelegram()
const { initTheme } = useTheme()

onMounted(() => {
  initWebApp()
  initTheme()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>