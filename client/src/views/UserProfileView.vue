<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center space-x-3">
          <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Профиль пользователя
          </h1>
        </div>
      </div>
    </header>
    
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
          <div class="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
      
      <!-- Profile Content -->
      <div v-else-if="user" class="space-y-6">
        <!-- User Info Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <div v-if="user.photo_url" class="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30">
                  <img 
                    :src="user.photo_url" 
                    :alt="user.first_name || user.username"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                </div>
                <div v-else class="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-3xl text-white font-bold">
                  {{ (user.first_name || user.username || 'U')[0].toUpperCase() }}
                </div>
                <div v-if="user.is_verified" class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1 text-white">
                <h2 class="text-2xl font-bold">
                  {{ user.first_name || user.username || 'Пользователь' }}
                  <span v-if="user.last_name" class="ml-1">{{ user.last_name }}</span>
                </h2>
                <p class="opacity-90">@{{ user.username }}</p>
                <div class="flex items-center space-x-4 mt-2">
                  <div class="flex items-center">
                    <template v-for="i in 5" :key="i">
                      <svg :class="i <= Math.round(user.rating || 0) ? 'text-yellow-300' : 'text-white/30'" 
                           class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </template>
                    <span class="ml-2 font-semibold">{{ user.rating?.toFixed(1) || '0.0' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50">
            <div class="p-4 text-center">
              <div class="text-2xl font-bold text-gray-900">{{ user.deals_count || 0 }}</div>
              <div class="text-sm text-gray-600">Сделок</div>
            </div>
            <div class="p-4 text-center">
              <div class="text-2xl font-bold text-gray-900">{{ activeOffersCount }}</div>
              <div class="text-sm text-gray-600">Активных</div>
            </div>
            <div class="p-4 text-center">
              <div class="text-2xl font-bold text-gray-900">{{ reviewsCount }}</div>
              <div class="text-sm text-gray-600">Отзывов</div>
            </div>
          </div>
        </div>
        
        <!-- Bio -->
        <div v-if="user.bio" class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-3">О себе</h3>
          <p class="text-gray-700">{{ user.bio }}</p>
        </div>
        
        <!-- Contact Info -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Контакты</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
                <div>
                  <div class="text-sm text-gray-600">Telegram</div>
                  <div class="font-medium">@{{ user.username }}</div>
                </div>
              </div>
              <a 
                :href="`https://t.me/${user.username}`"
                target="_blank"
                class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                Написать
              </a>
            </div>
            
            <div v-if="user.is_online" class="p-3 bg-green-50 rounded-lg">
              <div class="flex items-center text-green-700">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span class="font-medium">Сейчас онлайн</span>
              </div>
            </div>
            <div v-else class="p-3 bg-gray-50 rounded-lg">
              <div class="text-gray-600">
                Был в сети {{ formatLastSeen(user.last_seen) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Active Offers -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Активные предложения</h3>
          
          <div v-if="offers.length > 0" class="space-y-3">
            <div 
              v-for="offer in offers" 
              :key="offer.id || offer._id"
              @click="viewOffer(offer)"
              class="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-bold',
                  offer.type === 'buy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                ]">
                  {{ offer.type === 'buy' ? 'ПОКУПКА' : 'ПРОДАЖА' }}
                </span>
                <span class="text-sm text-gray-600">
                  Курс: <span class="font-bold">{{ offer.rate }}</span>
                </span>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold">{{ offer.amount_from }} {{ offer.currency_from }}</span>
                  <span class="mx-2">→</span>
                  <span class="font-bold">{{ offer.amount_to }} {{ offer.currency_to }}</span>
                </div>
              </div>
              <div class="text-xs text-gray-500 mt-2">
                📍 {{ getDistrictName(offer.district) }}
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p>Нет активных предложений</p>
          </div>
        </div>
        
        <!-- Reviews Section -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">Отзывы</h3>
            <span class="text-sm text-gray-600">
              Всего: {{ reviewsCount }}
            </span>
          </div>
          
          <div v-if="reviews.length > 0" class="space-y-4">
            <div v-for="review in reviews" :key="review._id" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <div v-if="review.from_user_id?.photo_url" class="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      :src="review.from_user_id.photo_url" 
                      :alt="review.from_user_id.first_name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div v-else class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 mr-3">
                    {{ (review.from_user_id?.first_name || 'U')[0] }}
                  </div>
                  <div>
                    <div class="font-medium">{{ review.from_user_id?.first_name || 'Пользователь' }}</div>
                    <div class="flex items-center">
                      <template v-for="i in 5" :key="i">
                        <svg :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'" 
                             class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </template>
                    </div>
                  </div>
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(review.createdAt) }}
                </div>
              </div>
              <p v-if="review.comment" class="text-sm text-gray-700">{{ review.comment }}</p>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p>Пока нет отзывов</p>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">😕</div>
        <div class="text-xl font-semibold text-gray-700 mb-2">Пользователь не найден</div>
        <router-link to="/offers" class="text-indigo-600 hover:text-indigo-700">
          Вернуться к предложениям
        </router-link>
      </div>
    </div>
    
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUsersStore } from '@/stores/users';
import { useOffersStore } from '@/stores/offers';
import api from '@/services/api';
import BottomNav from '@/components/BottomNav.vue';

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();
const offersStore = useOffersStore();

const user = ref(null);
const offers = ref([]);
const reviews = ref([]);
const loading = ref(true);
const activeOffersCount = ref(0);
const reviewsCount = ref(0);

onMounted(async () => {
  await loadUser();
  await loadUserOffers();
  await loadUserReviews();
});

async function loadUser() {
  try {
    loading.value = true;
    const userId = route.params.id;
    console.log('UserProfileView: Loading user with ID:', userId, 'Type:', typeof userId);
    console.log('Full route params:', route.params);
    console.log('Full route path:', route.path);
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('Invalid user ID:', userId);
      user.value = null;
      return;
    }
    
    user.value = await usersStore.fetchUser(userId);
    console.log('UserProfileView: User loaded:', user.value);
    
    if (!user.value) {
      console.error('UserProfileView: User could not be loaded for ID:', userId);
    }
  } catch (error) {
    console.error('Load user error:', error);
    user.value = null;
  } finally {
    loading.value = false;
  }
}

async function loadUserOffers() {
  try {
    if (!user.value) return;
    
    const response = await api.get(`/offers/user/${user.value._id || user.value.id}`);
    offers.value = response.data.filter(o => o.is_active);
    activeOffersCount.value = offers.value.length;
  } catch (error) {
    console.error('Load user offers error:', error);
    offers.value = [];
  }
}

async function loadUserReviews() {
  try {
    if (!user.value) return;
    
    const userId = user.value._id || user.value.id;
    const response = await api.get(`/reviews/user/${userId}`);
    reviews.value = response.data || [];
    reviewsCount.value = reviews.value.length;
  } catch (error) {
    console.error('Load user reviews error:', error);
    reviews.value = [];
    reviewsCount.value = 0;
  }
}

function viewOffer(offer) {
  router.push(`/offers/${offer._id || offer.id}`);
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

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
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

function handleImageError(event) {
  event.target.style.display = 'none';
}
</script>