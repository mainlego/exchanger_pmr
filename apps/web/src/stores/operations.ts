import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/utils/api'

export interface Operation {
  id: string
  code: string
  currencyFrom: string
  currencyTo: string
  amountFrom: number
  amountTo: number
  rate: number
  commission: number
  status: 'new' | 'confirmed' | 'completed' | 'cancelled'
  deliveryType: 'office' | 'delivery'
  deliveryAddress?: string
  scheduledTime?: Date
  completedAt?: Date
  createdAt: Date
}

export const useOperationsStore = defineStore('operations', () => {
  const operations = ref<Operation[]>([])
  const recentOperations = ref<Operation[]>([])
  const currentOperation = ref<Operation | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchOperations = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get('/operations')
      operations.value = response.data
    } catch (err) {
      error.value = 'Ошибка загрузки операций'
      console.error('Failed to fetch operations:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchRecentOperations = async () => {
    try {
      const response = await api.get('/operations', {
        params: { limit: 3, sort: 'desc' }
      })
      recentOperations.value = response.data
    } catch (err) {
      console.error('Failed to fetch recent operations:', err)
      recentOperations.value = []
    }
  }

  const fetchOperation = async (code: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/operations/${code}`)
      currentOperation.value = response.data
      return response.data
    } catch (err) {
      error.value = 'Операция не найдена'
      console.error('Failed to fetch operation:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createOperation = async (data: {
    currencyFrom: string
    currencyTo: string
    amountFrom: number
    amountTo: number
    rate: number
    deliveryType: 'office' | 'delivery'
    deliveryAddress?: string
    scheduledTime?: Date
  }) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/operations', data)
      const newOperation = response.data
      operations.value.unshift(newOperation)
      currentOperation.value = newOperation
      return newOperation
    } catch (err) {
      error.value = 'Ошибка создания операции'
      console.error('Failed to create operation:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const cancelOperation = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      await api.post(`/operations/${id}/cancel`)
      const operation = operations.value.find(op => op.id === id)
      if (operation) {
        operation.status = 'cancelled'
      }
      return true
    } catch (err) {
      error.value = 'Ошибка отмены операции'
      console.error('Failed to cancel operation:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const repeatOperation = (operation: Operation) => {
    return {
      currencyFrom: operation.currencyFrom,
      currencyTo: operation.currencyTo,
      amountFrom: operation.amountFrom,
      deliveryType: operation.deliveryType,
      deliveryAddress: operation.deliveryAddress
    }
  }

  return {
    operations,
    recentOperations,
    currentOperation,
    isLoading,
    error,
    fetchOperations,
    fetchRecentOperations,
    fetchOperation,
    createOperation,
    cancelOperation,
    repeatOperation
  }
})