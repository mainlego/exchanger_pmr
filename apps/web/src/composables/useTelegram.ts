import { ref, computed } from 'vue'

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
    }
    chat?: {
      id: number
      type: string
      title?: string
      username?: string
    }
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color: string
    text_color: string
    hint_color: string
    link_color: string
    button_color: string
    button_text_color: string
    secondary_bg_color: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  isClosingConfirmationEnabled: boolean
  headerColor: string
  backgroundColor: string
  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText(text: string): void
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  ready(): void
  expand(): void
  close(): void
  enableClosingConfirmation(): void
  disableClosingConfirmation(): void
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  showScanQrPopup(params?: { text?: string }, callback?: (text: string) => void): void
  closeScanQrPopup(): void
  readTextFromClipboard(callback?: (text: string) => void): void
  requestWriteAccess(callback?: (granted: boolean) => void): void
  requestContact(callback?: (shared: boolean) => void): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  openInvoice(url: string, callback?: (status: string) => void): void
  sendData(data: string): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
}

export function useTelegram() {
  const webApp = ref<TelegramWebApp | null>(null)
  const isReady = ref(false)

  const user = computed(() => webApp.value?.initDataUnsafe?.user || null)
  const isDarkMode = computed(() => webApp.value?.colorScheme === 'dark')
  const platform = computed(() => webApp.value?.platform || 'unknown')

  const initWebApp = () => {
    if (window.Telegram?.WebApp) {
      webApp.value = window.Telegram.WebApp
      webApp.value.ready()
      webApp.value.expand()
      isReady.value = true
    }
  }

  const showMainButton = (text: string, callback: () => void) => {
    if (!webApp.value) return
    
    webApp.value.MainButton.setText(text)
    webApp.value.MainButton.show()
    webApp.value.MainButton.onClick(callback)
  }

  const hideMainButton = () => {
    if (!webApp.value) return
    webApp.value.MainButton.hide()
  }

  const showBackButton = (callback: () => void) => {
    if (!webApp.value) return
    
    webApp.value.BackButton.show()
    webApp.value.BackButton.onClick(callback)
  }

  const hideBackButton = () => {
    if (!webApp.value) return
    webApp.value.BackButton.hide()
  }

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (!webApp.value) return
    
    if (['success', 'warning', 'error'].includes(type)) {
      webApp.value.HapticFeedback.notificationOccurred(type as 'success' | 'warning' | 'error')
    } else {
      webApp.value.HapticFeedback.impactOccurred(type as 'light' | 'medium' | 'heavy')
    }
  }

  const showPopup = (message: string, title?: string) => {
    if (!webApp.value) return
    
    webApp.value.showPopup({
      title,
      message,
      buttons: [{ type: 'ok' }]
    })
  }

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!webApp.value) {
        resolve(false)
        return
      }
      
      webApp.value.showConfirm(message, (confirmed) => {
        resolve(confirmed)
      })
    })
  }

  const sendData = (data: any) => {
    if (!webApp.value) return
    webApp.value.sendData(JSON.stringify(data))
  }

  const close = () => {
    if (!webApp.value) return
    webApp.value.close()
  }

  return {
    webApp,
    isReady,
    user,
    isDarkMode,
    platform,
    initWebApp,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    showPopup,
    showConfirm,
    sendData,
    close
  }
}