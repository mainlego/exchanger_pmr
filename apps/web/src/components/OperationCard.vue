<template>
  <div 
    class="card cursor-pointer hover:shadow-md transition-shadow"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-lg font-semibold">
            {{ operation.amountFrom }} {{ operation.currencyFrom }}
          </span>
          <ArrowRightIcon class="w-4 h-4 text-gray-400" />
          <span class="text-lg font-semibold">
            {{ operation.amountTo }} {{ operation.currencyTo }}
          </span>
        </div>
        
        <div class="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
          <span class="flex items-center space-x-1">
            <CalendarIcon class="w-4 h-4" />
            <span>{{ formatDate(operation.createdAt) }}</span>
          </span>
          <span class="flex items-center space-x-1">
            <component :is="deliveryIcon" class="w-4 h-4" />
            <span>{{ deliveryText }}</span>
          </span>
        </div>
      </div>
      
      <div class="text-right">
        <div :class="statusClass" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
          {{ statusText }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          #{{ operation.code }}
        </div>
      </div>
    </div>
    
    <div v-if="canRepeat || canCancel" class="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <button
        v-if="canRepeat"
        @click.stop="handleRepeat"
        class="btn-secondary text-sm py-1 flex-1"
      >
        Повторить
      </button>
      <button
        v-if="canCancel"
        @click.stop="handleCancel"
        class="btn-secondary text-sm py-1 flex-1 text-red-500"
      >
        Отменить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Operation } from '@/stores/operations'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon.vue'
import CalendarIcon from '@/components/icons/CalendarIcon.vue'
import OfficeIcon from '@/components/icons/OfficeIcon.vue'
import DeliveryIcon from '@/components/icons/DeliveryIcon.vue'
import { useOperationsStore } from '@/stores/operations'
import { useTelegram } from '@/composables/useTelegram'

interface Props {
  operation: Operation
}

const props = defineProps<Props>()
const emit = defineEmits(['click'])

const router = useRouter()
const operationsStore = useOperationsStore()
const { hapticFeedback, showConfirm } = useTelegram()

const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    new: 'Новая',
    confirmed: 'Подтверждена',
    completed: 'Выполнена',
    cancelled: 'Отменена'
  }
  return statusMap[props.operation.status] || props.operation.status
})

const statusClass = computed(() => {
  const classMap: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    confirmed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
  return classMap[props.operation.status] || 'bg-gray-100 text-gray-700'
})

const deliveryIcon = computed(() => {
  return props.operation.deliveryType === 'office' ? OfficeIcon : DeliveryIcon
})

const deliveryText = computed(() => {
  return props.operation.deliveryType === 'office' ? 'В офисе' : 'Доставка'
})

const canRepeat = computed(() => {
  return ['completed', 'cancelled'].includes(props.operation.status)
})

const canCancel = computed(() => {
  return ['new', 'confirmed'].includes(props.operation.status)
})

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMMM, HH:mm', { locale: ru })
}

const handleRepeat = () => {
  hapticFeedback('light')
  const data = operationsStore.repeatOperation(props.operation)
  router.push({
    path: '/exchange',
    query: {
      amount: data.amountFrom,
      from: data.currencyFrom,
      to: data.currencyTo
    }
  })
}

const handleCancel = async () => {
  hapticFeedback('medium')
  const confirmed = await showConfirm('Вы уверены, что хотите отменить операцию?')
  
  if (confirmed) {
    const success = await operationsStore.cancelOperation(props.operation.id)
    if (success) {
      hapticFeedback('success')
    } else {
      hapticFeedback('error')
    }
  }
}
</script>