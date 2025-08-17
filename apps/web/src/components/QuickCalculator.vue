<template>
  <div class="space-y-3">
    <div class="flex space-x-2">
      <div class="flex-1">
        <input
          v-model.number="fromAmount"
          type="number"
          placeholder="0.00"
          class="input text-lg font-semibold"
          @input="handleFromInput"
        />
      </div>
      <select
        v-model="fromCurrency"
        class="input w-24"
        @change="handleCurrencyChange"
      >
        <option value="RUP">руб ПМР</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="MDL">MDL</option>
        <option value="UAH">UAH</option>
        <option value="RUB">RUB</option>
      </select>
    </div>

    <div class="flex justify-center">
      <button
        @click="swapCurrencies"
        class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 transition-transform active:scale-95"
      >
        <SwapIcon class="w-5 h-5" />
      </button>
    </div>

    <div class="flex space-x-2">
      <div class="flex-1">
        <input
          v-model.number="toAmount"
          type="number"
          placeholder="0.00"
          class="input text-lg font-semibold"
          @input="handleToInput"
        />
      </div>
      <select
        v-model="toCurrency"
        class="input w-24"
        @change="handleCurrencyChange"
      >
        <option value="RUP">руб ПМР</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="MDL">MDL</option>
        <option value="UAH">UAH</option>
        <option value="RUB">RUB</option>
      </select>
    </div>

    <div v-if="commission > 0" class="text-sm text-gray-500 dark:text-gray-400 text-center">
      Комиссия: {{ commission.toFixed(2) }} руб
    </div>

    <button
      @click="proceedToExchange"
      class="btn-primary w-full"
      :disabled="!fromAmount || !toAmount"
    >
      Оформить обмен
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import SwapIcon from '@/components/icons/SwapIcon.vue'
import { useRatesStore } from '@/stores/rates'
import { useTelegram } from '@/composables/useTelegram'

const router = useRouter()
const ratesStore = useRatesStore()
const { hapticFeedback } = useTelegram()

const fromAmount = ref<number>(0)
const toAmount = ref<number>(0)
const fromCurrency = ref('USD')
const toCurrency = ref('RUP')
const lastChanged = ref<'from' | 'to'>('from')

const commission = computed(() => {
  if (!fromAmount.value) return 0
  return fromAmount.value * 0.01
})

const handleFromInput = () => {
  lastChanged.value = 'from'
  calculateTo()
}

const handleToInput = () => {
  lastChanged.value = 'to'
  calculateFrom()
}

const handleCurrencyChange = () => {
  if (lastChanged.value === 'from') {
    calculateTo()
  } else {
    calculateFrom()
  }
}

const calculateTo = () => {
  if (!fromAmount.value) {
    toAmount.value = 0
    return
  }
  
  toAmount.value = Number(
    ratesStore.calculateExchange(
      fromAmount.value,
      fromCurrency.value,
      toCurrency.value,
      'sell'
    ).toFixed(2)
  )
}

const calculateFrom = () => {
  if (!toAmount.value) {
    fromAmount.value = 0
    return
  }
  
  fromAmount.value = Number(
    ratesStore.calculateExchange(
      toAmount.value,
      toCurrency.value,
      fromCurrency.value,
      'buy'
    ).toFixed(2)
  )
}

const swapCurrencies = () => {
  hapticFeedback('light')
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
  
  const tempAmount = fromAmount.value
  fromAmount.value = toAmount.value
  toAmount.value = tempAmount
}

const proceedToExchange = () => {
  hapticFeedback('light')
  router.push({
    path: '/exchange',
    query: {
      amount: fromAmount.value,
      from: fromCurrency.value,
      to: toCurrency.value
    }
  })
}
</script>