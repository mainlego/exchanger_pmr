<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-20">
      <div class="px-3 py-3">
        <div class="flex items-center space-x-2">
          <button @click="$router.back()" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Профиль пользователя
          </h1>
        </div>
      </div>
    </header>
    
    <div class="px-3 py-3">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="relative">
          <div class="w-12 h-12 border-3 border-indigo-200 rounded-full"></div>
          <div class="absolute top-0 left-0 w-12 h-12 border-3 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
      
      <!-- Profile Content -->
      <div v-else-if="user" class="space-y-4">
        <!-- User Card -->
        <div class="bg-white rounded-xl shadow-md p-4">
          <div class="flex items-start space-x-4">
            <!-- Avatar -->
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {{ (user.first_name || user.username || 'U')[0].toUpperCase() }}
              </div>
              <div v-if="user.is_verified" class="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <!-- User Info -->
            <div class="flex-1">
              <div class="font-bold text-lg text-gray-900">
                {{ user.first_name || user.username || 'Пользователь' }}
                <span v-if="user.last_name" class="ml-1">{{ user.last_name }}</span>
              </div>
              
              <!-- Rating -->
              <div class="flex items-center space-x-2 mt-1">
                <div class="flex items-center">
                  <template v-for="i in 5" :key="i">
                    <svg :class="i <= Math.round(user.rating || 0) ? 'text-yellow-400' : 'text-gray-200'" 
                         class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </template>
                  <span class="ml-1 text-sm font-semibold">{{ (user.rating || 0).toFixed(1) }}</span>
                </div>
              </div>
              
              <!-- Stats -->
              <div class="flex items-center space-x-3 mt-2 text-xs text-gray-600">
                <span>🤝 {{ user.deals_count || 0 }} сделок</span>
                <span v-if="user.is_online" class="flex items-center text-green-600">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Онлайн
                </span>
                <span v-else>
                  Был {{ formatLastSeen(user.last_seen) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Bio -->
          <div v-if="user.bio" class="mt-4 p-3 bg-gray-50 rounded-lg">
            <div class="text-xs text-gray-600 mb-1">О себе:</div>
            <div class="text-sm text-gray-700">{{ user.bio }}</div>
          </div>
        </div>
        
        <!-- Active Offers -->
        <div class="bg-white rounded-xl shadow-md p-4">
          <h3 class="font-semibold text-gray-900 mb-3 text-sm">Активные предложения</h3>
          
          <div v-if="offers.length > 0" class="space-y-2">
            <div 
              v-for="offer in offers" 
              :key="offer.id || offer._id"
              @click="viewOffer(offer)"
              class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center justify-between mb-1">
                <span :class="[
                  'px-2 py-0.5 rounded-full text-xs font-semibold',
                  offer.type === 'buy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                ]">
                  {{ offer.type === 'buy' ? 'Покупка' : 'Продажа' }}
                </span>
                <span class="text-xs text-gray-500">{{ formatDate(offer.createdAt || offer.created_at) }}</span>
              </div>
              <div class="text-sm font-medium">
                {{ formatAmount(offer.amount_from) }} {{ offer.currency_from }} → 
                {{ formatAmount(offer.amount_to) }} {{ offer.currency_to }}
              </div>
              <div class="text-xs text-gray-600">
                Курс: {{ offer.rate }} • {{ getDistrictName(offer.district) }}
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-3 text-sm">
            Нет активных предложений
          </div>
        </div>
        
        <!-- Reviews -->
        <div class="bg-white rounded-xl shadow-md p-4">
          <h3 class="font-semibold text-gray-900 mb-3 text-sm">
            Отзывы ({{ reviews.length }})
          </h3>
          
          <div v-if="reviews.length > 0" class="space-y-3">
            <div v-for="review in reviews" :key="review.id || review._id" class="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
              <!-- Review Header -->
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {{ (review.from_user_id?.first_name || 'U')[0].toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ review.from_user_id?.first_name || 'Пользователь' }}
                    </div>
                    <div class="flex items-center">
                      <template v-for="i in 5" :key="i">
                        <svg :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-200'" 
                             class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </template>
                    </div>
                  </div>
                </div>
                <span class="text-xs text-gray-500">
                  {{ formatDate(review.createdAt || review.created_at) }}
                </span>
              </div>
              
              <!-- Review Comment -->
              <div v-if="review.comment" class="text-sm text-gray-700 ml-10">
                {{ review.comment }}
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-3 text-sm">
            Пока нет отзывов
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else class="text-center py-12">
        <div class="text-5xl mb-3">😕</div>
        <div class="text-lg font-semibold text-gray-700 mb-2">Пользователь не найден</div>
        <button @click="$router.back()" class="text-indigo-600 hover:text-indigo-700 text-sm">
          Вернуться назад
        </button>
      </div>
    </div>
    
    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import BottomNav from '@/components/BottomNav.vue';

const route = useRoute();
const router = useRouter();

const user = ref(null);
const offers = ref([]);
const reviews = ref([]);
const loading = ref(true);

onMounted(async () => {
  await loadUserProfile();
});

async function loadUserProfile() {
  try {
    loading.value = true;
    const userId = route.params.id;
    
    // Load user info
    const userResponse = await api.get(`/users/${userId}`);
    user.value = userResponse.data;
    
    // Load user's active offers
    try {
      const offersResponse = await api.get(`/users/${userId}/offers`);
      offers.value = offersResponse.data.filter(o => o.is_active);
    } catch (error) {
      console.error('Error loading offers:', error);
    }
    
    // Load user's reviews
    try {
      const reviewsResponse = await api.get(`/users/${userId}/reviews`);
      reviews.value = reviewsResponse.data;
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
    user.value = null;
  } finally {
    loading.value = false;
  }
}

function viewOffer(offer) {
  router.push(`/offers/${offer.id || offer._id}`);
}

function formatAmount(amount) {
  return new Intl.NumberFormat('ru-RU').format(amount);
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  
  if (diff < 60000) return 'только что';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
  
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });
}

function formatLastSeen(date) {
  if (!date) return 'недавно';
  
  const now = new Date();
  const seen = new Date(date);
  const diff = now - seen;
  
  if (diff < 60000) return 'только что';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)} д назад`;
  
  return seen.toLocaleDateString('ru-RU');
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