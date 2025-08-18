<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50">
    <div class="grid grid-cols-4">
      <router-link 
        to="/"
        class="nav-item"
        :class="{ active: $route.path === '/' }"
      >
        <span class="icon">🏠</span>
        <span class="label">Главная</span>
      </router-link>
      
      <router-link 
        to="/offers"
        class="nav-item"
        :class="{ active: $route.path.startsWith('/offers') }"
      >
        <span class="icon">💱</span>
        <span class="label">Обмен</span>
      </router-link>
      
      <router-link 
        to="/deals"
        class="nav-item relative"
        :class="{ active: $route.path.startsWith('/deals') }"
      >
        <span class="icon">🤝</span>
        <span class="label">Сделки</span>
        <span v-if="pendingDealsCount > 0" class="absolute top-1 right-1/4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
          {{ pendingDealsCount > 9 ? '9+' : pendingDealsCount }}
        </span>
      </router-link>
      
      <router-link 
        to="/profile"
        class="nav-item"
        :class="{ active: $route.path.startsWith('/profile') }"
      >
        <span class="icon">👤</span>
        <span class="label">Профиль</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDealsStore } from '@/stores/deals';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const dealsStore = useDealsStore();
const authStore = useAuthStore();

const pendingDealsCount = computed(() => {
  if (!authStore.user) return 0;
  const userId = authStore.user._id || authStore.user.id;
  
  return dealsStore.deals.filter(deal => {
    const makerId = deal.maker_id?._id || deal.maker_id?.id || deal.maker_id;
    const isMaker = userId === makerId;
    
    // Count pending deals where user is maker (needs to accept/reject)
    return deal.status === 'pending' && isMaker;
  }).length;
});

// Fetch deals on mount and when user changes
onMounted(() => {
  if (authStore.user) {
    dealsStore.fetchMyDeals();
  }
});

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    dealsStore.fetchMyDeals();
  }
});
</script>

<style scoped>
.nav-item {
  @apply flex flex-col items-center justify-center py-2 px-1;
  @apply text-gray-500 transition-all duration-200;
  @apply relative;
}

.nav-item:active {
  @apply scale-95;
}

.nav-item.active {
  @apply text-indigo-600;
}

.nav-item.active .icon {
  @apply transform scale-110;
}

.nav-item .icon {
  @apply text-xl transition-transform duration-200;
}

.nav-item .label {
  @apply text-xs mt-0.5 font-medium;
}

@media (max-width: 320px) {
  .nav-item .label {
    @apply text-[10px];
  }
  .nav-item .icon {
    @apply text-lg;
  }
}
</style>