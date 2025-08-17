<template>
  <div 
    class="card flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
    @click="handleClick"
  >
    <div class="flex items-center space-x-3">
      <div class="w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg"
           :class="currencyColors[currency]">
        {{ currencySymbols[currency] }}
      </div>
      <div>
        <div class="font-semibold text-lg">{{ currency }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">{{ currencyNames[currency] }}</div>
      </div>
    </div>

    <div class="text-right">
      <div v-if="!loading" class="space-y-1">
        <div class="flex items-center justify-end space-x-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">Покупка:</span>
          <span class="font-semibold">{{ buyRate.toFixed(2) }}</span>
        </div>
        <div class="flex items-center justify-end space-x-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">Продажа:</span>
          <span class="font-semibold">{{ sellRate.toFixed(2) }}</span>
        </div>
        <div class="flex items-center justify-end space-x-1 text-xs">
          <component 
            :is="trendIcon" 
            class="w-3 h-3"
            :class="trendColor"
          />
          <span :class="trendColor">
            {{ change > 0 ? '+' : '' }}{{ change.toFixed(2) }}%
          </span>
        </div>
      </div>
      <div v-else class="space-y-2">
        <div class="skeleton h-4 w-16"></div>
        <div class="skeleton h-4 w-16"></div>
        <div class="skeleton h-3 w-12"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'
import TrendUpIcon from '@/components/icons/TrendUpIcon.vue'
import TrendDownIcon from '@/components/icons/TrendDownIcon.vue'
import TrendStableIcon from '@/components/icons/TrendStableIcon.vue'

interface Props {
  currency: string
  buyRate: number
  sellRate: number
  trend: 'up' | 'down' | 'stable'
  change: number
  loading?: boolean
}

const props = defineProps<Props>()
const router = useRouter()
const { hapticFeedback } = useTelegram()

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  MDL: 'L',
  UAH: '₴',
  RUB: '₽'
}

const currencyNames: Record<string, string> = {
  USD: 'Доллар США',
  EUR: 'Евро',
  MDL: 'Молдавский лей',
  UAH: 'Гривна',
  RUB: 'Рубль РФ'
}

const currencyColors: Record<string, string> = {
  USD: 'from-green-400 to-green-600',
  EUR: 'from-blue-400 to-blue-600',
  MDL: 'from-purple-400 to-purple-600',
  UAH: 'from-yellow-400 to-yellow-600',
  RUB: 'from-red-400 to-red-600'
}

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up': return TrendUpIcon
    case 'down': return TrendDownIcon
    default: return TrendStableIcon
  }
})

const trendColor = computed(() => {
  switch (props.trend) {
    case 'up': return 'text-green-500'
    case 'down': return 'text-red-500'
    default: return 'text-gray-500'
  }
})

const handleClick = () => {
  hapticFeedback('light')
  router.push({
    path: '/exchange',
    query: { currency: props.currency }
  })
}
</script>