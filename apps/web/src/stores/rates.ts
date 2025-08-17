import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'

export interface Rate {
  currency: string
  symbol: string
  buyRate: number
  sellRate: number
  trend: 'up' | 'down' | 'stable'
  change: number
  updatedAt: Date
}

export const useRatesStore = defineStore('rates', () => {
  const rates = ref<Rate[]>([
    {
      currency: 'USD',
      symbol: '$',
      buyRate: 16.10,
      sellRate: 16.50,
      trend: 'up',
      change: 0.5,
      updatedAt: new Date()
    },
    {
      currency: 'EUR',
      symbol: '€',
      buyRate: 18.4184,
      sellRate: 19.5360,
      trend: 'down',
      change: -0.3,
      updatedAt: new Date()
    },
    {
      currency: 'MDL',
      symbol: 'L',
      buyRate: 0.9437,
      sellRate: 1.0476,
      trend: 'stable',
      change: 0,
      updatedAt: new Date()
    },
    {
      currency: 'UAH',
      symbol: '₴',
      buyRate: 0.36,
      sellRate: 0.43,
      trend: 'stable',
      change: 0.1,
      updatedAt: new Date()
    },
    {
      currency: 'RUB',
      symbol: '₽',
      buyRate: 0.1851,
      sellRate: 0.2143,
      trend: 'down',
      change: -0.2,
      updatedAt: new Date()
    }
  ])

  const rateHistory = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getRateByCurrency = computed(() => {
    return (currency: string) => rates.value.find(r => r.currency === currency)
  })

  const fetchRates = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get('/rates/current')
      rates.value = response.data
    } catch (err) {
      error.value = 'Ошибка загрузки курсов'
      console.error('Failed to fetch rates:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchRateHistory = async (currency: string, period: 'day' | 'week' | 'month' = 'day') => {
    try {
      const response = await api.get(`/rates/history`, {
        params: { currency, period }
      })
      rateHistory.value = response.data
    } catch (err) {
      console.error('Failed to fetch rate history:', err)
    }
  }

  const calculateExchange = (amount: number, fromCurrency: string, toCurrency: string, type: 'buy' | 'sell' = 'buy') => {
    if (fromCurrency === 'RUP' && toCurrency !== 'RUP') {
      const rate = getRateByCurrency.value(toCurrency)
      if (!rate) return 0
      return type === 'buy' ? amount / rate.buyRate : amount / rate.sellRate
    } else if (fromCurrency !== 'RUP' && toCurrency === 'RUP') {
      const rate = getRateByCurrency.value(fromCurrency)
      if (!rate) return 0
      return type === 'buy' ? amount * rate.buyRate : amount * rate.sellRate
    } else if (fromCurrency !== 'RUP' && toCurrency !== 'RUP') {
      const fromRate = getRateByCurrency.value(fromCurrency)
      const toRate = getRateByCurrency.value(toCurrency)
      if (!fromRate || !toRate) return 0
      const rupAmount = type === 'buy' ? amount * fromRate.buyRate : amount * fromRate.sellRate
      return type === 'buy' ? rupAmount / toRate.sellRate : rupAmount / toRate.buyRate
    }
    return amount
  }

  const subscribeToUpdates = (callback: (rates: Rate[]) => void) => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws/rates')
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'rates_update') {
        rates.value = data.rates
        callback(data.rates)
      }
    }

    return () => ws.close()
  }

  return {
    rates,
    rateHistory,
    isLoading,
    error,
    getRateByCurrency,
    fetchRates,
    fetchRateHistory,
    calculateExchange,
    subscribeToUpdates
  }
})