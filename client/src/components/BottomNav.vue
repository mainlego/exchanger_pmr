<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t">
    <div class="grid grid-cols-4 max-w-7xl mx-auto">
      <router-link 
        to="/"
        class="nav-item"
        :class="{ active: $route.name === 'Home' }"
      >
        <span class="icon">🏠</span>
        <span class="label">Главная</span>
      </router-link>
      
      <router-link 
        to="/offers"
        class="nav-item"
        :class="{ active: $route.name === 'Offers' }"
      >
        <span class="icon">💱</span>
        <span class="label">Обмен</span>
      </router-link>
      
      <router-link 
        to="/deals"
        class="nav-item"
        :class="{ active: $route.name === 'Deals' }"
      >
        <span class="icon">🤝</span>
        <span class="label">Сделки</span>
        <span v-if="pendingDealsCount > 0" class="badge-count">
          {{ pendingDealsCount }}
        </span>
      </router-link>
      
      <router-link 
        to="/profile"
        class="nav-item"
        :class="{ active: $route.name === 'Profile' }"
      >
        <span class="icon">👤</span>
        <span class="label">Профиль</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const pendingDealsCount = ref(0);
</script>

<style scoped>
.nav-item {
  @apply flex flex-col items-center justify-center py-2 relative;
  @apply text-gray-600 hover:text-primary-600 transition-colors;
}

.nav-item.active {
  @apply text-primary-600;
}

.nav-item .icon {
  @apply text-xl;
}

.nav-item .label {
  @apply text-xs mt-1;
}

.badge-count {
  @apply absolute -top-1 -right-1 bg-red-500 text-white;
  @apply text-xs rounded-full w-5 h-5 flex items-center justify-center;
}
</style>