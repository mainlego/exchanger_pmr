<template>
  <div class="pb-20 px-4 py-4">
    <header class="mb-4">
      <h1 class="text-2xl font-bold">Профиль</h1>
    </header>

    <div class="space-y-4">
      <div class="card">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-telegram-blue to-telegram-accent flex items-center justify-center text-white text-2xl font-bold">
            {{ userInitials }}
          </div>
          <div class="flex-1">
            <div class="text-lg font-semibold">{{ userName }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">@{{ userUsername }}</div>
            <div v-if="user?.is_premium" class="inline-flex items-center space-x-1 mt-1">
              <StarIcon class="w-4 h-4 text-purple-500" />
              <span class="text-xs text-purple-500 font-medium">Premium</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-3">Статистика</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-2xl font-bold">{{ stats.totalOperations }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Всего операций</div>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ stats.completedOperations }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Выполнено</div>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ formatAmount(stats.totalVolume) }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Общий объем (руб)</div>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ formatAmount(stats.savedCommission) }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Сэкономлено</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-3">Реферальная программа</h2>
        <div class="space-y-3">
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Ваш реферальный код</div>
            <div class="flex items-center space-x-2">
              <div class="flex-1 font-mono text-lg font-semibold bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                {{ referralCode }}
              </div>
              <button
                @click="copyReferralCode"
                class="btn-secondary p-2"
              >
                <CopyIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Приглашено друзей</div>
              <div class="text-lg font-semibold">{{ stats.referrals }}</div>
            </div>
            <button @click="shareReferral" class="btn-primary text-sm">
              Поделиться
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-3">Настройки</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium">Push-уведомления</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">О статусе операций</div>
            </div>
            <ToggleSwitch v-model="settings.notifications" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium">Email-уведомления</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Важные обновления</div>
            </div>
            <ToggleSwitch v-model="settings.emailNotifications" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium">Курсы в реальном времени</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Автообновление курсов</div>
            </div>
            <ToggleSwitch v-model="settings.realTimeRates" />
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-3">Поддержка</h2>
        <div class="space-y-2">
          <a href="https://t.me/pmr_exchange_support" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <div class="flex items-center space-x-3">
              <TelegramIcon class="w-5 h-5 text-telegram-blue" />
              <span>Написать в поддержку</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </a>
          <button @click="showFAQ" class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors w-full">
            <div class="flex items-center space-x-3">
              <QuestionIcon class="w-5 h-5 text-gray-500" />
              <span>Частые вопросы</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
        Версия 1.0.0
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useTelegram } from '@/composables/useTelegram'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
import StarIcon from '@/components/icons/StarIcon.vue'
import CopyIcon from '@/components/icons/CopyIcon.vue'
import TelegramIcon from '@/components/icons/TelegramIcon.vue'
import ChevronRightIcon from '@/components/icons/ChevronRightIcon.vue'
import QuestionIcon from '@/components/icons/QuestionIcon.vue'

const { user, hapticFeedback, showPopup } = useTelegram()

const stats = reactive({
  totalOperations: 42,
  completedOperations: 38,
  totalVolume: 125420,
  savedCommission: 1254,
  referrals: 5
})

const settings = reactive({
  notifications: true,
  emailNotifications: false,
  realTimeRates: true
})

const referralCode = ref('PMR2024')

const userName = computed(() => {
  if (!user.value) return 'Пользователь'
  return `${user.value.first_name} ${user.value.last_name || ''}`.trim()
})

const userUsername = computed(() => {
  return user.value?.username || 'user'
})

const userInitials = computed(() => {
  if (!user.value) return 'U'
  const first = user.value.first_name[0] || ''
  const last = user.value.last_name?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('ru-RU').format(amount)
}

const copyReferralCode = () => {
  hapticFeedback('light')
  navigator.clipboard.writeText(referralCode.value)
  showPopup('Реферальный код скопирован!')
}

const shareReferral = () => {
  hapticFeedback('light')
  const text = `Присоединяйся к лучшему обменнику валют в ПМР! Используй мой реферальный код ${referralCode.value} и получи бонус на первый обмен.`
  const url = `https://t.me/share/url?url=https://t.me/pmr_exchange_bot&text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

const showFAQ = () => {
  hapticFeedback('light')
  showPopup('FAQ будет доступен в следующей версии', 'Информация')
}
</script>