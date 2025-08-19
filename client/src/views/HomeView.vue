<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Animated Header -->
    <header class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur animate-pulse"></div>
            <div class="relative bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full p-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              P2P Exchange PMR
            </h1>
            <p class="text-sm text-gray-600">Безопасный обмен валют</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section with Animation -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20"></div>
      <div class="max-w-7xl mx-auto px-4 py-8 relative">
        <!-- Currency Ticker -->
        <div class="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-4 mb-6 transform hover:scale-[1.02] transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-700">Актуальные курсы</h3>
            <span class="text-xs text-gray-500 animate-pulse">● Обновлено только что</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="rate in currentRates" :key="rate.pair" 
                 class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 hover:shadow-md transition-all">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-600">{{ rate.pair }}</span>
                <span class="text-lg font-bold text-gray-900">{{ rate.value }}</span>
              </div>
              <div class="flex items-center mt-1">
                <span :class="rate.trend === 'up' ? 'text-green-500' : rate.trend === 'down' ? 'text-red-500' : 'text-gray-500'" 
                      class="text-xs flex items-center">
                  <svg v-if="rate.trend === 'up'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else-if="rate.trend === 'down'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span v-else>→</span>
                  {{ rate.change }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions with Beautiful Cards -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <router-link 
            to="/offers?type=buy"
            class="group relative overflow-hidden bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-xl transform hover:scale-[1.05] transition-all duration-300"
          >
            <div class="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            <div class="relative p-6 text-white">
              <div class="text-4xl mb-3 transform group-hover:scale-110 transition-transform">💵</div>
              <h3 class="font-bold text-lg">Купить</h3>
              <p class="text-sm opacity-90">Найти продавцов</p>
              <div class="absolute bottom-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </router-link>

          <router-link 
            to="/offers?type=sell"
            class="group relative overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl transform hover:scale-[1.05] transition-all duration-300"
          >
            <div class="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            <div class="relative p-6 text-white">
              <div class="text-4xl mb-3 transform group-hover:scale-110 transition-transform">💰</div>
              <h3 class="font-bold text-lg">Продать</h3>
              <p class="text-sm opacity-90">Найти покупателей</p>
              <div class="absolute bottom-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Create Offer Button -->
        <router-link 
          to="/offers/create"
          class="relative block w-full overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
          <div class="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl px-6 py-4 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <div class="flex items-center justify-center space-x-2">
              <span class="text-2xl">✨</span>
              <span class="font-bold text-lg">Создать предложение</span>
              <span class="text-2xl">✨</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Offers with Modern Design -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800 flex items-center">
          <span class="mr-2">🔥</span>
          Горячие предложения
        </h2>
        <router-link to="/offers" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
          Все предложения
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </router-link>
      </div>
      
      <div v-if="loading" class="flex justify-center py-12">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
          <div class="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
      
      <div v-else-if="recentOffers.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📭</div>
        <div class="text-gray-500">Пока нет активных предложений</div>
        <router-link to="/offers/create" class="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
          Создать первое предложение →
        </router-link>
      </div>
      
      <div v-else class="space-y-4">
        <transition-group name="slide-fade">
          <OfferCard 
            v-for="offer in recentOffers" 
            :key="offer.id" 
            :offer="offer"
            class="transform hover:scale-[1.02] transition-all duration-300"
          />
        </transition-group>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useOffersStore } from '@/stores/offers';
import OfferCard from '@/components/OfferCard.vue';
import BottomNav from '@/components/BottomNav.vue';

const offersStore = useOffersStore();

const loading = computed(() => offersStore.loading);
const recentOffers = computed(() => offersStore.activeOffers.slice(0, 5));

// Mock current rates for demo
const currentRates = ref([
  { pair: 'USD/RUP', value: '16.50', change: '+0.2%', trend: 'up' },
  { pair: 'EUR/RUP', value: '17.80', change: '-0.1%', trend: 'down' },
  { pair: 'RUB/RUP', value: '0.18', change: '0%', trend: 'stable' },
  { pair: 'MDL/RUP', value: '0.92', change: '+0.5%', trend: 'up' }
]);

onMounted(() => {
  offersStore.fetchOffers();
});
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>