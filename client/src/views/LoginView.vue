<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full px-6">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">P2P Exchange PMR</h1>
        <p class="mt-2 text-gray-600">Обмен валют напрямую между людьми</p>
      </div>

      <div class="card">
        <div v-if="isTelegramWebApp" class="text-center">
          <p class="text-gray-600 mb-4">Авторизация через Telegram...</p>
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
        
        <div v-else class="text-center">
          <p class="text-gray-600 mb-4">
            Для использования приложения откройте его через Telegram бота
          </p>
          <a 
            href="https://t.me/pmr_exchange_bot"
            class="btn btn-primary inline-block"
          >
            Открыть в Telegram
          </a>
        </div>
      </div>

      <div class="mt-8 text-center text-sm text-gray-500">
        <p>Безопасный обмен валют</p>
        <p>Рейтинги и отзывы пользователей</p>
        <p>Прямые контакты через Telegram</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isTelegramWebApp = ref(false);

onMounted(async () => {
  // Check if running in Telegram WebApp
  if (window.Telegram?.WebApp?.initData) {
    isTelegramWebApp.value = true;
    
    // Try to authenticate
    const success = await authStore.loginWithTelegram(window.Telegram.WebApp.initData);
    
    if (success) {
      router.push('/');
    } else {
      isTelegramWebApp.value = false;
    }
  }
});
</script>