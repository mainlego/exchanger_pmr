<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-20">
      <div class="px-3 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Предложения
          </h1>
          <button 
            @click="showFilters = !showFilters" 
            class="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium flex items-center space-x-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            <span>Фильтры</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Filters -->
    <transition name="slide">
      <div v-if="showFilters" class="bg-white border-b shadow-lg">
        <div class="px-3 py-3 space-y-3">
          <!-- Quick Filters -->
          <div class="flex flex-wrap gap-2">
            <button 
              @click="setQuickFilter('buy')"
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                filters.type === 'buy' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              ]"
            >
              💵 Покупка
            </button>
            <button 
              @click="setQuickFilter('sell')"
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                filters.type === 'sell' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              ]"
            >
              💰 Продажа
            </button>
            <button 
              @click="resetFilters"
              class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
            >
              ✖ Сбросить
            </button>
          </div>

          <!-- Currency Filters -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Отдаю</label>
              <select v-model="filters.currency_from" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
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
              <label class="block text-xs font-medium text-gray-700 mb-1">Получаю</label>
              <select v-model="filters.currency_to" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
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
            <label class="block text-xs font-medium text-gray-700 mb-1">Район</label>
            <select v-model="filters.district" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
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
        </div>
      </div>
    </transition>

    <!-- Offers List -->
    <div class="px-3 py-3">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="relative">
          <div class="w-12 h-12 border-3 border-indigo-200 rounded-full"></div>
          <div class="absolute top-0 left-0 w-12 h-12 border-3 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>

      <!-- Offers -->
      <div v-else-if="filteredOffers.length > 0" class="space-y-3">
        <div 
          v-for="offer in filteredOffers" 
          :key="offer.id || offer._id"
          @click="openOffer(offer)"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
        >
          <!-- Status Bar -->
          <div :class="[
            'h-1',
            offer.type === 'buy' 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
              : 'bg-gradient-to-r from-blue-400 to-indigo-500'
          ]"></div>
          
          <div class="p-3">
            <!-- Header -->
            <div class="flex items-center justify-between mb-2">
              <span :class="[
                'px-2 py-0.5 rounded-full text-xs font-bold uppercase',
                offer.type === 'buy' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              ]">
                {{ offer.type === 'buy' ? '💵 Покупка' : '💰 Продажа' }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatTime(offer.createdAt || offer.created_at) }}
              </span>
            </div>

            <!-- Amount -->
            <div class="mb-2">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-lg font-bold text-gray-900">
                    {{ formatAmount(offer.amount_from) }} {{ offer.currency_from }}
                  </span>
                  <span class="text-gray-500 mx-1">→</span>
                  <span class="text-lg font-bold text-gray-900">
                    {{ formatAmount(offer.amount_to) }} {{ offer.currency_to }}
                  </span>
                </div>
              </div>
              <div class="text-xs text-gray-600 mt-1">
                Курс: <span class="font-semibold">{{ offer.rate }}</span> • 
                Лимиты: {{ formatAmount(offer.min_amount) }}-{{ formatAmount(offer.max_amount) }}
              </div>
            </div>

            <!-- User & Location -->
            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <div @click.stop="viewUserProfile(offer)" class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors">
                <div v-if="offer.photo_url" class="w-6 h-6 rounded-full overflow-hidden">
                  <img 
                    :src="offer.photo_url" 
                    :alt="offer.first_name || offer.username"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                </div>
                <div v-else class="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ (offer.first_name || offer.username || 'U')[0].toUpperCase() }}
                </div>
                <div class="text-xs">
                  <div class="font-medium text-gray-900">{{ offer.first_name || offer.username || 'Пользователь' }}</div>
                  <div class="text-gray-500">⭐ {{ (offer.rating || 0).toFixed(1) }}</div>
                </div>
              </div>
              <div class="flex items-center text-xs text-gray-600">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
                {{ getDistrictName(offer.district) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-5xl mb-3">🔍</div>
        <div class="text-lg font-semibold text-gray-700 mb-2">Предложений не найдено</div>
        <p class="text-sm text-gray-500 mb-4">Попробуйте изменить фильтры или создайте своё предложение</p>
        <router-link 
          to="/offers/create" 
          class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
        >
          ➕ Создать предложение
        </router-link>
      </div>
    </div>

    <!-- Create Button -->
    <button 
      @click="$router.push('/offers/create')"
      class="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOffersStore } from '@/stores/offers';
import BottomNav from '@/components/BottomNav.vue';

const router = useRouter();
const offersStore = useOffersStore();

const showFilters = ref(false);
const loading = ref(true);

const filters = ref({
  type: '',
  currency_from: '',
  currency_to: '',
  district: '',
  min_amount: null,
  max_amount: null
});

const sortBy = ref('created_at:DESC');

const filteredOffers = computed(() => {
  let offers = [...offersStore.offers];
  
  // Apply filters
  if (filters.value.type) {
    offers = offers.filter(o => o.type === filters.value.type);
  }
  if (filters.value.currency_from) {
    offers = offers.filter(o => o.currency_from === filters.value.currency_from);
  }
  if (filters.value.currency_to) {
    offers = offers.filter(o => o.currency_to === filters.value.currency_to);
  }
  if (filters.value.district) {
    offers = offers.filter(o => o.district === filters.value.district);
  }
  if (filters.value.min_amount) {
    offers = offers.filter(o => o.amount_from >= filters.value.min_amount);
  }
  if (filters.value.max_amount) {
    offers = offers.filter(o => o.amount_from <= filters.value.max_amount);
  }
  
  // Apply sorting
  const [field, order] = sortBy.value.split(':');
  offers.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    if (field === 'created_at') {
      aVal = new Date(aVal || a.createdAt);
      bVal = new Date(bVal || b.createdAt);
    }
    
    if (order === 'DESC') {
      return bVal > aVal ? 1 : -1;
    } else {
      return aVal > bVal ? 1 : -1;
    }
  });
  
  return offers;
});

onMounted(async () => {
  try {
    await offersStore.fetchOffers();
  } finally {
    loading.value = false;
  }
});

function setQuickFilter(type) {
  filters.value.type = filters.value.type === type ? '' : type;
}

function resetFilters() {
  filters.value = {
    type: '',
    currency_from: '',
    currency_to: '',
    district: '',
    min_amount: null,
    max_amount: null
  };
}

function openOffer(offer) {
  router.push(`/offers/${offer.id || offer._id}`);
}

function formatAmount(amount) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  
  if (diff < 60000) return 'только что';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч`;
  
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });
}

function viewUserProfile(offer) {
  // user_id должен быть строкой с ID из сервера
  const userId = typeof offer.user_id === 'string' 
    ? offer.user_id 
    : offer.user_id?._id || offer.user_id?.id;
    
  if (userId) {
    console.log('OffersView navigating to profile:', userId);
    router.push(`/users/${userId}`);
  } else {
    console.error('No user_id found in offer:', offer);
  }
}

function handleImageError(event) {
  event.target.style.display = 'none';
}

function getDistrictName(district) {
  const districts = {
    tiraspol: 'Тирасполь',
    bendery: 'Бендеры',
    slobodzeya: 'Слободзея',
    grigoriopol: 'Григориополь',
    dubossary: 'Дубоссары',
    rybnitsa: 'Рыбница',
    kamenka: 'Каменка'
  };
  return districts[district] || district;
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
  opacity: 0;
}
</style>