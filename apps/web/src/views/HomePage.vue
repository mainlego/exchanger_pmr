<template>
  <div class="pb-20 px-4 py-4 space-y-4">
    <header class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold">Обменник ПМР</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ currentDate }}</p>
      </div>
      <button
        @click="refreshRates"
        class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 transition-transform"
        :class="{ 'animate-spin': isRefreshing }"
      >
        <RefreshIcon class="w-5 h-5" />
      </button>
    </header>

    <div class="grid grid-cols-1 gap-3">
      <RateCard
        v-for="rate in currentRates"
        :key="rate.currency"
        :currency="rate.currency"
        :buyRate="rate.buyRate"
        :sellRate="rate.sellRate"
        :trend="rate.trend"
        :change="rate.change"
        :loading="ratesLoading"
      />
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-3">Быстрый расчет</h2>
      <QuickCalculator />
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-3">Быстрый обмен</h2>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="amount in quickAmounts"
          :key="amount.value"
          @click="quickExchange(amount)"
          class="btn-secondary py-3"
        >
          {{ amount.label }}
        </button>
      </div>
    </div>

    <div v-if="recentOperations.length > 0" class="card">
      <h2 class="text-lg font-semibold mb-3">Последние операции</h2>
      <div class="space-y-2">
        <OperationItem
          v-for="operation in recentOperations"
          :key="operation.id"
          :operation="operation"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import RateCard from '@/components/RateCard.vue'
import QuickCalculator from '@/components/QuickCalculator.vue'
import OperationItem from '@/components/OperationItem.vue'
import RefreshIcon from '@/components/icons/RefreshIcon.vue'
import { useRatesStore } from '@/stores/rates'
import { useOperationsStore } from '@/stores/operations'
import { useTelegram } from '@/composables/useTelegram'

const router = useRouter()
const ratesStore = useRatesStore()
const operationsStore = useOperationsStore()
const { hapticFeedback } = useTelegram()

const isRefreshing = ref(false)
const ratesLoading = ref(true)

const currentDate = computed(() => {
  return format(new Date(), 'd MMMM yyyy', { locale: ru })
})

const currentRates = computed(() => ratesStore.rates)
const recentOperations = computed(() => operationsStore.recentOperations)

const quickAmounts = [
  { value: 100, currency: 'USD', label: '$100' },
  { value: 500, currency: 'USD', label: '$500' },
  { value: 100, currency: 'EUR', label: '€100' },
  { value: 1000, currency: 'MDL', label: '1000 MDL' }
]

const refreshRates = async () => {
  hapticFeedback('light')
  isRefreshing.value = true
  await ratesStore.fetchRates()
  setTimeout(() => {
    isRefreshing.value = false
    hapticFeedback('success')
  }, 500)
}

const quickExchange = (amount: typeof quickAmounts[0]) => {
  hapticFeedback('light')
  router.push({
    path: '/exchange',
    query: {
      amount: amount.value,
      currency: amount.currency
    }
  })
}

onMounted(async () => {
  await Promise.all([
    ratesStore.fetchRates(),
    operationsStore.fetchRecentOperations()
  ])
  ratesLoading.value = false
})
</script>