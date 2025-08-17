<template>
  <div class="pb-20 px-4 py-4">
    <header class="mb-4">
      <h1 class="text-2xl font-bold">История операций</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Все ваши обмены</p>
    </header>

    <div v-if="!isLoading && operations.length === 0" class="card text-center py-8">
      <EmptyIcon class="w-16 h-16 mx-auto mb-3 text-gray-400" />
      <h3 class="text-lg font-medium mb-1">Нет операций</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Вы еще не совершали обменов
      </p>
      <router-link to="/exchange" class="btn-primary inline-block">
        Создать первую заявку
      </router-link>
    </div>

    <div v-else class="space-y-3">
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="card">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <div class="skeleton h-5 w-32"></div>
              <div class="skeleton h-4 w-24"></div>
            </div>
            <div class="space-y-2">
              <div class="skeleton h-4 w-20"></div>
              <div class="skeleton h-3 w-16"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-3">
          <div class="flex space-x-2">
            <button
              v-for="filter in filters"
              :key="filter.value"
              @click="activeFilter = filter.value"
              class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              :class="activeFilter === filter.value 
                ? 'bg-telegram-blue text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <TransitionGroup name="list" tag="div" class="space-y-3">
          <div v-for="operation in filteredOperations" :key="operation.id">
            <OperationCard :operation="operation" @click="openOperation(operation)" />
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OperationCard from '@/components/OperationCard.vue'
import EmptyIcon from '@/components/icons/EmptyIcon.vue'
import { useOperationsStore } from '@/stores/operations'
import { useTelegram } from '@/composables/useTelegram'

const router = useRouter()
const operationsStore = useOperationsStore()
const { hapticFeedback } = useTelegram()

const activeFilter = ref('all')
const filters = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
  { value: 'cancelled', label: 'Отмененные' }
]

const isLoading = computed(() => operationsStore.isLoading)
const operations = computed(() => operationsStore.operations)

const filteredOperations = computed(() => {
  if (activeFilter.value === 'all') {
    return operations.value
  }
  
  if (activeFilter.value === 'active') {
    return operations.value.filter(op => ['new', 'confirmed'].includes(op.status))
  }
  
  if (activeFilter.value === 'completed') {
    return operations.value.filter(op => op.status === 'completed')
  }
  
  if (activeFilter.value === 'cancelled') {
    return operations.value.filter(op => op.status === 'cancelled')
  }
  
  return operations.value
})

const openOperation = (operation: any) => {
  hapticFeedback('light')
  router.push(`/history/${operation.code}`)
}

onMounted(() => {
  operationsStore.fetchOperations()
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>