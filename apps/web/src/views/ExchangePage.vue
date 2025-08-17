<template>
  <div class="pb-20 px-4 py-4">
    <header class="mb-4">
      <h1 class="text-2xl font-bold">Обмен валюты</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Оформите заявку на обмен</p>
    </header>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="card">
        <h2 class="text-lg font-semibold mb-3">Параметры обмена</h2>
        
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Отдаю
            </label>
            <div class="flex space-x-2">
              <input
                v-model.number="formData.amountFrom"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                class="input flex-1"
                @input="calculateTo"
              />
              <select
                v-model="formData.currencyFrom"
                class="input w-24"
                @change="calculateTo"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MDL">MDL</option>
                <option value="RUB">руб</option>
              </select>
            </div>
          </div>

          <div class="flex justify-center">
            <button
              type="button"
              @click="swapCurrencies"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 transition-transform active:scale-95"
            >
              <SwapIcon class="w-5 h-5" />
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Получаю
            </label>
            <div class="flex space-x-2">
              <input
                v-model.number="formData.amountTo"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                class="input flex-1"
                @input="calculateFrom"
              />
              <select
                v-model="formData.currencyTo"
                class="input w-24"
                @change="calculateTo"
              >
                <option value="RUB">руб</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MDL">MDL</option>
              </select>
            </div>
          </div>

          <div v-if="currentRate" class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <div>Курс: 1 {{ formData.currencyFrom }} = {{ currentRate.toFixed(4) }} {{ formData.currencyTo }}</div>
            <div v-if="commission > 0">Комиссия: {{ commission.toFixed(2) }} руб</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-3">Способ получения</h2>
        
        <div class="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            @click="formData.deliveryType = 'office'"
            class="p-3 rounded-lg border-2 transition-colors"
            :class="formData.deliveryType === 'office' 
              ? 'border-telegram-blue bg-telegram-blue/10' 
              : 'border-gray-300 dark:border-gray-600'"
          >
            <OfficeIcon class="w-6 h-6 mx-auto mb-1" />
            <span class="text-sm">В офисе</span>
          </button>
          <button
            type="button"
            @click="formData.deliveryType = 'delivery'"
            class="p-3 rounded-lg border-2 transition-colors"
            :class="formData.deliveryType === 'delivery' 
              ? 'border-telegram-blue bg-telegram-blue/10' 
              : 'border-gray-300 dark:border-gray-600'"
          >
            <DeliveryIcon class="w-6 h-6 mx-auto mb-1" />
            <span class="text-sm">Доставка</span>
          </button>
        </div>

        <div v-if="formData.deliveryType === 'office'" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Выберите офис
            </label>
            <select v-model="formData.officeId" class="input w-full" required>
              <option value="">Выберите офис</option>
              <option value="1">ул. 25 Октября, 101</option>
              <option value="2">ул. Ленина, 28</option>
              <option value="3">ул. Советская, 45</option>
            </select>
          </div>
        </div>

        <div v-else-if="formData.deliveryType === 'delivery'" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Адрес доставки
            </label>
            <textarea
              v-model="formData.deliveryAddress"
              rows="2"
              class="input w-full"
              placeholder="Введите адрес доставки"
              required
            ></textarea>
          </div>
        </div>

        <div class="mt-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Время встречи
          </label>
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="formData.date"
              type="date"
              class="input"
              :min="minDate"
              required
            />
            <select v-model="formData.time" class="input" required>
              <option value="">Время</option>
              <option v-for="slot in timeSlots" :key="slot" :value="slot">
                {{ slot }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-3">Контактные данные</h2>
        
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Телефон
            </label>
            <input
              v-model="formData.phone"
              type="tel"
              class="input w-full"
              placeholder="+373 ..."
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Комментарий (необязательно)
            </label>
            <textarea
              v-model="formData.comment"
              rows="2"
              class="input w-full"
              placeholder="Дополнительная информация"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <div class="flex items-start space-x-2">
          <InfoIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div class="text-sm text-yellow-800 dark:text-yellow-200">
            <p class="font-medium mb-1">Важно!</p>
            <p>Курс будет зафиксирован на 30 минут после подтверждения заявки. При опоздании курс может быть пересчитан.</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        class="btn-primary w-full py-3 text-lg font-semibold"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Оформление...' : 'Оформить заявку' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, addDays } from 'date-fns'
import SwapIcon from '@/components/icons/SwapIcon.vue'
import OfficeIcon from '@/components/icons/OfficeIcon.vue'
import DeliveryIcon from '@/components/icons/DeliveryIcon.vue'
import InfoIcon from '@/components/icons/InfoIcon.vue'
import { useRatesStore } from '@/stores/rates'
import { useOperationsStore } from '@/stores/operations'
import { useTelegram } from '@/composables/useTelegram'

const route = useRoute()
const router = useRouter()
const ratesStore = useRatesStore()
const operationsStore = useOperationsStore()
const { hapticFeedback, showMainButton, hideMainButton, user } = useTelegram()

const formData = reactive({
  amountFrom: 0,
  currencyFrom: 'USD',
  amountTo: 0,
  currencyTo: 'RUB',
  deliveryType: 'office' as 'office' | 'delivery',
  officeId: '',
  deliveryAddress: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '',
  phone: '',
  comment: ''
})

const isSubmitting = ref(false)
const lastChanged = ref<'from' | 'to'>('from')

const minDate = computed(() => format(new Date(), 'yyyy-MM-dd'))
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 9; hour < 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
})

const currentRate = computed(() => {
  if (!formData.amountFrom) return null
  const rate = ratesStore.calculateExchange(1, formData.currencyFrom, formData.currencyTo, 'sell')
  return rate
})

const commission = computed(() => {
  if (!formData.amountFrom) return 0
  return formData.amountFrom * 0.01
})

const calculateTo = () => {
  if (!formData.amountFrom) {
    formData.amountTo = 0
    return
  }
  
  formData.amountTo = Number(
    ratesStore.calculateExchange(
      formData.amountFrom,
      formData.currencyFrom,
      formData.currencyTo,
      'sell'
    ).toFixed(2)
  )
}

const calculateFrom = () => {
  if (!formData.amountTo) {
    formData.amountFrom = 0
    return
  }
  
  formData.amountFrom = Number(
    ratesStore.calculateExchange(
      formData.amountTo,
      formData.currencyTo,
      formData.currencyFrom,
      'buy'
    ).toFixed(2)
  )
}

const swapCurrencies = () => {
  hapticFeedback('light')
  const temp = formData.currencyFrom
  formData.currencyFrom = formData.currencyTo
  formData.currencyTo = temp
  
  const tempAmount = formData.amountFrom
  formData.amountFrom = formData.amountTo
  formData.amountTo = tempAmount
}

const handleSubmit = async () => {
  hapticFeedback('medium')
  isSubmitting.value = true
  
  try {
    const scheduledTime = new Date(`${formData.date} ${formData.time}`)
    
    const operation = await operationsStore.createOperation({
      currencyFrom: formData.currencyFrom,
      currencyTo: formData.currencyTo,
      amountFrom: formData.amountFrom,
      amountTo: formData.amountTo,
      rate: currentRate.value || 0,
      deliveryType: formData.deliveryType,
      deliveryAddress: formData.deliveryType === 'delivery' ? formData.deliveryAddress : formData.officeId,
      scheduledTime
    })
    
    hapticFeedback('success')
    router.push(`/history/${operation.code}`)
  } catch (error) {
    hapticFeedback('error')
    console.error('Failed to create operation:', error)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (route.query.amount) {
    formData.amountFrom = Number(route.query.amount)
  }
  if (route.query.currency) {
    formData.currencyFrom = route.query.currency as string
  }
  if (route.query.from) {
    formData.currencyFrom = route.query.from as string
  }
  if (route.query.to) {
    formData.currencyTo = route.query.to as string
  }
  
  calculateTo()
  
  showMainButton('Оформить заявку', handleSubmit)
})
</script>