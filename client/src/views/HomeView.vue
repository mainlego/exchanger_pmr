<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold text-gray-900">P2P Exchange PMR</h1>
        <p class="text-sm text-gray-600">Обмен валют напрямую между людьми</p>
      </div>
    </header>

    <!-- Quick Actions -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-2 gap-4">
        <router-link 
          to="/offers?type=buy"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="text-center py-4">
            <div class="text-3xl mb-2">💵</div>
            <h3 class="font-semibold">Купить валюту</h3>
            <p class="text-sm text-gray-600">Найти продавцов</p>
          </div>
        </router-link>

        <router-link 
          to="/offers?type=sell"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="text-center py-4">
            <div class="text-3xl mb-2">💰</div>
            <h3 class="font-semibold">Продать валюту</h3>
            <p class="text-sm text-gray-600">Найти покупателей</p>
          </div>
        </router-link>
      </div>

      <router-link 
        to="/offers/create"
        class="btn btn-primary w-full mt-4"
      >
        ➕ Создать предложение
      </router-link>
    </div>

    <!-- Recent Offers -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <h2 class="text-lg font-semibold mb-4">Последние предложения</h2>
      
      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-500">Загрузка...</div>
      </div>
      
      <div v-else-if="recentOffers.length === 0" class="text-center py-8">
        <div class="text-gray-500">Нет активных предложений</div>
      </div>
      
      <div v-else class="space-y-3">
        <OfferCard 
          v-for="offer in recentOffers" 
          :key="offer.id" 
          :offer="offer"
        />
      </div>
      
      <router-link 
        to="/offers"
        class="btn btn-secondary w-full mt-4"
      >
        Показать все предложения
      </router-link>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useOffersStore } from '@/stores/offers';
import OfferCard from '@/components/OfferCard.vue';
import BottomNav from '@/components/BottomNav.vue';

const offersStore = useOffersStore();

const loading = computed(() => offersStore.loading);
const recentOffers = computed(() => offersStore.activeOffers.slice(0, 5));

onMounted(() => {
  offersStore.fetchOffers();
});
</script>