<template>
  <div 
    class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    @click="handleClick"
  >
    <div class="flex items-center space-x-3">
      <div :class="statusIcon" class="w-10 h-10 rounded-full flex items-center justify-center">
        <component :is="statusIconComponent" class="w-5 h-5" />
      </div>
      <div>
        <div class="font-medium">
          {{ operation.amountFrom }} {{ operation.currencyFrom }} → {{ operation.amountTo }} {{ operation.currencyTo }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatDate(operation.createdAt) }}
        </div>
      </div>
    </div>
    
    <div class="text-right">
      <div :class="statusColor" class="text-sm font-medium">
        {{ statusText }}
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400">
        #{{ operation.code }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Operation } from '@/stores/operations'
import { useTelegram } from '@/composables/useTelegram'
import CheckIcon from '@/components/icons/CheckIcon.vue'
import ClockIcon from '@/components/icons/ClockIcon.vue'
import XIcon from '@/components/icons/XIcon.vue'

interface Props {
  operation: Operation
}

const props = defineProps<Props>()
const router = useRouter()
const { hapticFeedback } = useTelegram()

const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    new: 'Новая',
    confirmed: 'Подтверждена',
    completed: 'Выполнена',
    cancelled: 'Отменена'
  }
  return statusMap[props.operation.status] || props.operation.status
})

const statusColor = computed(() => {
  const colorMap: Record<string, string> = {
    new: 'text-blue-500',
    confirmed: 'text-yellow-500',
    completed: 'text-green-500',
    cancelled: 'text-red-500'
  }
  return colorMap[props.operation.status] || 'text-gray-500'
})

const statusIcon = computed(() => {
  const iconMap: Record<string, string> = {
    new: 'bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-400',
    confirmed: 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-400'
  }
  return iconMap[props.operation.status] || 'bg-gray-100 text-gray-500'
})

const statusIconComponent = computed(() => {
  const iconMap: Record<string, any> = {
    new: ClockIcon,
    confirmed: ClockIcon,
    completed: CheckIcon,
    cancelled: XIcon
  }
  return iconMap[props.operation.status] || ClockIcon
})

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMM, HH:mm', { locale: ru })
}

const handleClick = () => {
  hapticFeedback('light')
  router.push(`/history/${props.operation.code}`)
}
</script>