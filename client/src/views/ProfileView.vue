<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <h1 class="text-xl font-bold">Мой профиль</h1>
      </div>
    </header>
    
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div v-if="user" class="space-y-4">
        <div class="card">
          <div class="flex items-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
              {{ user.first_name?.[0] || '👤' }}
            </div>
            <div class="ml-4">
              <h2 class="font-semibold text-lg">{{ user.first_name }} {{ user.last_name }}</h2>
              <p class="text-gray-600">@{{ user.username }}</p>
              <div class="flex items-center mt-1">
                <span>⭐ {{ user.rating || 0 }}</span>
                <span class="ml-3">🤝 {{ user.deals_count || 0 }} сделок</span>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="logout" class="btn btn-secondary w-full">
          Выйти
        </button>
      </div>
    </div>
    
    <BottomNav />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BottomNav from '@/components/BottomNav.vue';

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>