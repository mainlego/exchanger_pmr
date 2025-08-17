<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold">Предложения обмена</h1>
          <button @click="showFilters = !showFilters" class="btn btn-secondary">
            🔍 Фильтры
          </button>
        </div>
      </div>
    </header>

    <!-- Filters -->
    <transition name="slide">
      <div v-if="showFilters" class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 py-4 space-y-3">
          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-medium mb-1">Тип операции</label>
            <select v-model="filters.type" class="input">
              <option value="">Все</option>
              <option value="buy">Покупка</option>
              <option value="sell">Продажа</option>
            </select>
          </div>

          <!-- Currency Filters -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Отдаю</label>
              <select v-model="filters.currency_from" class="input">
                <option value="">Все</option>
                <option value="RUP">RUP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MDL">MDL</option>
                <option value="UAH">UAH</option>
                <option value="RUB">RUB</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Получаю</label>
              <select v-model="filters.currency_to" class="input">
                <option value="">Все</option>
                <option value="RUP">RUP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MDL">MDL</option>
                <option value="UAH">UAH</option>
                <option value="RUB">RUB</option>
              </select>
            </div>
          </div>

          <!-- District Filter -->
          <div>
            <label class="block text-sm font-medium mb-1">Район</label>
            <select v-model="filters.district" class="input">
              <option value="">Все районы</option>
              <option value="tiraspol">Тирасполь</option>
              <option value="bendery">Бендеры</option>
              <option value="slobodzeya">Слободзея</option>
              <option value="grigoriopol">Григориополь</option>
              <option value="dubossary">Дубоссары</option>
              <option value="rybnitsa">Рыбница</option>
              <option value="kamenka">Каменка</option>
            </select>
          </div>

          <!-- Amount Range -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Сумма от</label>
              <input 
                type="number" 
                v-model="filters.min_amount" 
                placeholder="0"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Сумма до</label>
              <input 
                type="number" 
                v-model="filters.max_amount" 
                placeholder="999999"
                class="input"
              />
            </div>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-sm font-medium mb-1">Сортировка</label>
            <select v-model="sortBy" class="input">
              <option value="created_at:DESC">Сначала новые</option>
              <option value="created_at:ASC">Сначала старые</option>
              <option value="rate:DESC">По курсу (убыв.)</option>
              <option value="rate:ASC">По курсу (возр.)</option>
              <option value="rating:DESC">По рейтингу</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3">
            <button @click="applyFilters" class="btn btn-primary flex-1">
              Применить
            </button>
            <button @click="resetFilters" class="btn btn-secondary flex-1">
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Offers List -->
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-500">Загрузка предложений...</div>
      </div>
      
      <div v-else-if="offers.length === 0" class="text-center py-8">
        <div class="text-gray-500">Нет предложений по вашим критериям</div>
      </div>
      
      <div v-else class="space-y-3">
        <OfferCard 
          v-for="offer in offers" 
          :key="offer.id" 
          :offer="offer"
        />
      </div>
    </div>

    <!-- Create Offer FAB -->
    <router-link 
      to="/offers/create"
      class="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700"
    >
      <span class="text-2xl">+</span>
    </router-link>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOffersStore } from '@/stores/offers';
import OfferCard from '@/components/OfferCard.vue';
import BottomNav from '@/components/BottomNav.vue';

const route = useRoute();
const router = useRouter();
const offersStore = useOffersStore();

const showFilters = ref(false);
const filters = ref({
  type: '',
  currency_from: '',
  currency_to: '',
  district: '',
  min_amount: '',
  max_amount: ''
});

const sortBy = ref('created_at:DESC');

const loading = computed(() => offersStore.loading);
const offers = computed(() => offersStore.activeOffers);

// Parse sort value
watch(sortBy, (value) => {
  const [sort, order] = value.split(':');
  filters.value.sort = sort;
  filters.value.order = order;
});

// Initialize from query params
onMounted(() => {
  if (route.query.type) {
    filters.value.type = route.query.type;
  }
  applyFilters();
});

function applyFilters() {
  const [sort, order] = sortBy.value.split(':');
  offersStore.updateFilters({
    ...filters.value,
    sort,
    order
  });
  showFilters.value = false;
}

function resetFilters() {
  filters.value = {
    type: '',
    currency_from: '',
    currency_to: '',
    district: '',
    min_amount: '',
    max_amount: ''
  };
  sortBy.value = 'created_at:DESC';
  offersStore.resetFilters();
  showFilters.value = false;
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
}
</style>