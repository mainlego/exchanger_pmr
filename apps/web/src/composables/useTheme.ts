import { ref, watch } from 'vue'
import { useTelegram } from './useTelegram'

export function useTheme() {
  const { isDarkMode, webApp } = useTelegram()
  const currentTheme = ref<'light' | 'dark'>('light')

  const initTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
      currentTheme.value = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      currentTheme.value = 'light'
    }

    if (webApp.value?.themeParams) {
      const root = document.documentElement
      const params = webApp.value.themeParams
      
      root.style.setProperty('--tg-theme-bg-color', params.bg_color)
      root.style.setProperty('--tg-theme-text-color', params.text_color)
      root.style.setProperty('--tg-theme-hint-color', params.hint_color)
      root.style.setProperty('--tg-theme-link-color', params.link_color)
      root.style.setProperty('--tg-theme-button-color', params.button_color)
      root.style.setProperty('--tg-theme-button-text-color', params.button_text_color)
      root.style.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color)
    }
  }

  watch(isDarkMode, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
      currentTheme.value = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      currentTheme.value = 'light'
    }
  })

  return {
    currentTheme,
    initTheme
  }
}