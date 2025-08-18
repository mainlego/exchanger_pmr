<template>
  <div id="app" class="min-h-screen bg-gray-50 pb-20">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useWebSocket } from '@/composables/useWebSocket';

const authStore = useAuthStore();
const { connect } = useWebSocket();

onMounted(async () => {
  // Автоматическая авторизация через Telegram
  if (window.Telegram?.WebApp?.initData) {
    await authStore.loginWithTelegram(window.Telegram.WebApp.initData);
  }
  
  // Подключаемся к WebSocket
  if (authStore.isAuthenticated) {
    connect();
  }
});
</script>