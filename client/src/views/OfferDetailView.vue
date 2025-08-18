<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Детали предложения
            </h1>
          </div>
          
          <!-- Actions for owner -->
          <div v-if="isOwner" class="flex items-center space-x-2">
            <button 
              @click="toggleOffer"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all',
                offer.is_active 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              ]"
            >
              {{ offer.is_active ? '⏸ Приостановить' : '▶️ Активировать' }}
            </button>
            <button 
              @click="deleteOffer"
              class="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all"
            >
              🗑 Удалить
            </button>
          </div>
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
      
      <!-- Not Found State -->
      <div v-else-if="!offer" class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <div class="text-xl font-semibold text-gray-700 mb-2">Предложение не найдено</div>
        <p class="text-gray-500 mb-6">Возможно, оно было удалено или срок действия истек</p>
        <router-link to="/offers" class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
          </svg>
          Все предложения
        </router-link>
      </div>
      
      <!-- Offer Details -->
      <div v-else class="space-y-6">
        <!-- Main Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Status Bar -->
          <div :class="[
            'px-6 py-3',
            offer.is_active 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          ]">
            <div class="flex items-center justify-between text-white">
              <span class="font-semibold flex items-center">
                <span class="w-2 h-2 bg-white rounded-full mr-2" :class="{ 'animate-pulse': offer.is_active }"></span>
                {{ offer.is_active ? 'Активное предложение' : 'Неактивное предложение' }}
              </span>
              <span class="text-sm opacity-90">
                {{ formatDate(offer.createdAt || offer.created_at) }}
              </span>
            </div>
          </div>
          
          <!-- Exchange Info -->
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div :class="[
                'inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider',
                offer.type === 'buy' 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                  : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
              ]">
                {{ offer.type === 'buy' ? '💵 ПОКУПКА' : '💰 ПРОДАЖА' }}
              </div>
              
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                  </svg>
                  {{ offer.views_count || 0 }} просмотров
                </span>
              </div>
            </div>
            
            <!-- Amount Exchange -->
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div class="flex items-center justify-center space-x-4">
                <div class="text-center">
                  <div class="text-sm text-gray-600 mb-1">Отдаю</div>
                  <div class="text-3xl font-bold text-gray-900">{{ formatAmount(offer.amount_from) }}</div>
                  <div class="text-lg font-medium text-gray-700">{{ offer.currency_from }}</div>
                </div>
                
                <div class="flex flex-col items-center">
                  <svg class="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                  <div class="mt-2 px-3 py-1 bg-white rounded-lg shadow-sm">
                    <span class="text-sm font-medium text-gray-600">Курс:</span>
                    <span class="ml-1 font-bold text-indigo-600">{{ offer.rate }}</span>
                  </div>
                </div>
                
                <div class="text-center">
                  <div class="text-sm text-gray-600 mb-1">Получаю</div>
                  <div class="text-3xl font-bold text-gray-900">{{ formatAmount(offer.amount_to) }}</div>
                  <div class="text-lg font-medium text-gray-700">{{ offer.currency_to }}</div>
                </div>
              </div>
              
              <!-- Limits -->
              <div class="mt-4 pt-4 border-t border-indigo-200">
                <div class="flex items-center justify-center space-x-6 text-sm">
                  <div class="flex items-center">
                    <span class="text-gray-600">Мин. сумма:</span>
                    <span class="ml-2 font-semibold">{{ formatAmount(offer.min_amount) }} {{ offer.currency_from }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-600">Макс. сумма:</span>
                    <span class="ml-2 font-semibold">{{ formatAmount(offer.max_amount) }} {{ offer.currency_from }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Location -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">{{ getDistrictName(offer.district) }}</div>
                  <div v-if="offer.location" class="text-sm text-gray-600">{{ offer.location }}</div>
                </div>
              </div>
            </div>
            
            <!-- Comment -->
            <div v-if="offer.comment" class="p-4 bg-blue-50 rounded-xl">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <div class="text-sm font-medium text-blue-900 mb-1">Комментарий:</div>
                  <div class="text-sm text-blue-700">{{ offer.comment }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- User Card -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Информация о продавце</h2>
          
          <div class="flex items-center space-x-4">
            <!-- Avatar -->
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {{ (offer.first_name || offer.username || 'U')[0].toUpperCase() }}
              </div>
              <div v-if="offer.is_verified" class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <!-- User Info -->
            <div class="flex-1">
              <div class="font-semibold text-lg text-gray-900">
                {{ offer.first_name || offer.username || 'Пользователь' }}
                <span v-if="offer.last_name" class="ml-1">{{ offer.last_name }}</span>
              </div>
              <div class="flex items-center space-x-3 mt-1">
                <!-- Rating -->
                <div class="flex items-center">
                  <template v-for="i in 5" :key="i">
                    <svg :class="i <= Math.round(offer.rating || 0) ? 'text-yellow-400' : 'text-gray-300'" 
                         class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </template>
                  <span class="ml-1 text-sm text-gray-600">({{ offer.rating || 0 }})</span>
                </div>
                <!-- Deals Count -->
                <span class="text-sm text-gray-600">
                  🤝 {{ offer.deals_count || 0 }} сделок
                </span>
              </div>
              <!-- Online Status -->
              <div class="flex items-center mt-2">
                <span v-if="offer.is_online" class="flex items-center text-sm text-green-600">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Онлайн
                </span>
                <span v-else class="text-sm text-gray-500">
                  Был в сети {{ formatLastSeen(offer.last_seen) }}
                </span>
              </div>
              
              <!-- Contact Button -->
              <div v-if="!isOwner" class="mt-4">
                <button 
                  @click="createDeal"
                  class="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  💬 Начать сделку
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Safety Tips -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <div class="text-sm font-medium text-yellow-900 mb-1">Правила безопасности:</div>
              <ul class="text-sm text-yellow-700 space-y-1">
                <li>• Встречайтесь только в публичных местах</li>
                <li>• Проверяйте купюры на подлинность</li>
                <li>• Не передавайте деньги заранее</li>
                <li>• Обращайте внимание на рейтинг пользователя</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOffersStore } from '@/stores/offers';
import { useAuthStore } from '@/stores/auth';
import BottomNav from '@/components/BottomNav.vue';

const route = useRoute();
const router = useRouter();
const offersStore = useOffersStore();
const authStore = useAuthStore();

const offer = ref(null);
const loading = ref(true);

const isOwner = computed(() => {
  return offer.value && authStore.user && 
    (offer.value.user_id === authStore.user._id || offer.value.user_id === authStore.user.id);
});

onMounted(async () => {
  try {
    offer.value = await offersStore.fetchOffer(route.params.id);
  } finally {
    loading.value = false;
  }
});

function formatAmount(amount) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

async function toggleOffer() {
  try {
    await offersStore.updateOffer(offer.value.id, {
      is_active: !offer.value.is_active
    });
    offer.value.is_active = !offer.value.is_active;
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(
        offer.value.is_active ? 'Предложение активировано' : 'Предложение приостановлено'
      );
    }
  } catch (error) {
    console.error('Toggle offer error:', error);
  }
}

async function deleteOffer() {
  if (!confirm('Вы уверены, что хотите удалить это предложение?')) return;
  
  try {
    await offersStore.deleteOffer(offer.value.id);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Предложение удалено');
    }
    
    router.push('/offers');
  } catch (error) {
    console.error('Delete offer error:', error);
  }
}

async function createDeal() {
  // TODO: Implement deal creation
  router.push(`/deals/create?offer=${offer.value.id}`);
}
</script>