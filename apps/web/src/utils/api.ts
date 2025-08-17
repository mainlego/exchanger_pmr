import axios, { AxiosInstance, AxiosError } from 'axios'
import { useTelegram } from '@/composables/useTelegram'

const API_URL = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const { webApp } = useTelegram()
        
        if (webApp.value?.initData) {
          config.headers['X-Telegram-Init-Data'] = webApp.value.initData
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.error('Unauthorized access')
        } else if (error.response?.status === 500) {
          console.error('Server error')
        }
        
        return Promise.reject(error)
      }
    )
  }

  get(url: string, config?: any) {
    return this.client.get(url, config)
  }

  post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config)
  }

  put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config)
  }

  delete(url: string, config?: any) {
    return this.client.delete(url, config)
  }
}

export const api = new ApiClient()

export default api