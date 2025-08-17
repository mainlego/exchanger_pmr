<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 pb-safe">
    <div class="grid grid-cols-4 h-16">
      <router-link
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.path"
        class="flex flex-col items-center justify-center space-y-1 transition-colors"
        :class="[
          isActive(tab.path)
            ? 'text-telegram-blue dark:text-telegram-accent'
            : 'text-gray-500 dark:text-gray-400'
        ]"
        @click="handleClick"
      >
        <component :is="tab.icon" class="w-6 h-6" />
        <span class="text-xs font-medium">{{ tab.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'
import HomeIcon from '@/components/icons/HomeIcon.vue'
import ExchangeIcon from '@/components/icons/ExchangeIcon.vue'
import HistoryIcon from '@/components/icons/HistoryIcon.vue'
import ProfileIcon from '@/components/icons/ProfileIcon.vue'

const route = useRoute()
const { hapticFeedback } = useTelegram()

const tabs = [
  { name: 'home', path: '/', label: 'Главная', icon: HomeIcon },
  { name: 'exchange', path: '/exchange', label: 'Обмен', icon: ExchangeIcon },
  { name: 'history', path: '/history', label: 'История', icon: HistoryIcon },
  { name: 'profile', path: '/profile', label: 'Профиль', icon: ProfileIcon }
]

const isActive = (path: string) => {
  return route.path === path
}

const handleClick = () => {
  hapticFeedback('light')
}
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>