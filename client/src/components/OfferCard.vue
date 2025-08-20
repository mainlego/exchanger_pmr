<template>
  <router-link 
    :to="`/offers/${offer.id}`"
    class="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
  >
    <div class="relative">
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 group-hover:to-white/10 transition-colors"></div>
      
      <!-- Content -->
      <div class="relative p-5">
        <div class="flex items-start justify-between mb-3">
          <!-- Type Badge with Animation -->
          <div class="relative">
            <div :class="typeBadgeGradient" class="absolute inset-0 rounded-full blur opacity-50"></div>
            <span :class="typeBadgeClass" class="relative px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
              {{ offer.type === 'buy' ? '📈 Покупка' : '📉 Продажа' }}
            </span>
          </div>
          
          <!-- Time with pulse animation -->
          <div class="flex items-center space-x-1 text-sm text-gray-500">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{{ formatTime(offer.createdAt || offer.created_at) }}</span>
          </div>
        </div>
        
        <!-- Main Exchange Info -->
        <div class="mb-4">
          <div class="flex items-center space-x-2 mb-2">
            <div class="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3 py-2">
              <span class="text-2xl font-bold text-gray-900">{{ formatAmount(offer.amount_from) }}</span>
              <span class="ml-2 text-lg font-medium text-gray-700">{{ offer.currency_from }}</span>
            </div>
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </div>
            <div class="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-3 py-2">
              <span class="text-2xl font-bold text-gray-900">{{ formatAmount(offer.amount_to) }}</span>
              <span class="ml-2 text-lg font-medium text-gray-700">{{ offer.currency_to }}</span>
            </div>
          </div>
          
          <!-- Rate Badge -->
          <div class="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg px-3 py-1">
            <span class="text-sm font-medium text-gray-700">Курс:</span>
            <span class="ml-2 font-bold text-purple-700">{{ offer.rate }}</span>
            <span class="ml-1 text-xs text-gray-600">{{ offer.currency_to }}/{{ offer.currency_from }}</span>
          </div>
        </div>
        
        <!-- Location and Comment -->
        <div class="space-y-2 mb-3">
          <!-- Location -->
          <div class="flex items-start">
            <svg class="w-4 h-4 mr-2 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>
            <div class="text-sm">
              <div class="font-medium text-gray-700">{{ getDistrictName(offer.district) }}</div>
              <div v-if="offer.location" class="text-xs text-gray-500">{{ offer.location }}</div>
            </div>
          </div>
          
          <!-- Comment -->
          <div v-if="offer.comment" class="flex items-start">
            <svg class="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
            </svg>
            <div class="text-sm text-gray-600 line-clamp-2">{{ offer.comment }}</div>
          </div>
        </div>
        
        <!-- User Info with Rating -->
        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
          <div 
            @click.stop="viewUserProfile" 
            class="flex items-center space-x-3 rounded-lg p-1 -m-1 transition-colors cursor-pointer hover:bg-gray-50">
            <!-- User Avatar -->
            <div class="relative">
              <div v-if="offer.photo_url" class="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  :src="offer.photo_url" 
                  :alt="offer.first_name || offer.username"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <div v-else class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ (offer.first_name || offer.username || 'U')[0].toUpperCase() }}
              </div>
              <div v-if="offer.is_verified" class="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <div>
              <div class="font-semibold text-gray-800">{{ offer.first_name || offer.username || 'Пользователь' }}</div>
              <div class="flex items-center space-x-2">
                <!-- Rating Stars -->
                <div class="flex items-center">
                  <template v-for="i in 5" :key="i">
                    <svg :class="i <= Math.round(offer.rating || 0) ? 'text-yellow-400' : 'text-gray-300'" 
                         class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </template>
                </div>
                <span class="text-xs text-gray-500">({{ offer.deals_count || 0 }})</span>
              </div>
              <div class="text-xs text-indigo-600 mt-0.5">
                Посмотреть профиль →
              </div>
            </div>
          </div>
          
          <!-- View Button -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="bg-indigo-500 text-white rounded-lg px-3 py-1 text-sm font-medium">
              Подробнее →
            </div>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  offer: {
    type: Object,
    required: true
  }
});

const typeBadgeClass = computed(() => {
  return props.offer.type === 'buy' 
    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg';
});

const typeBadgeGradient = computed(() => {
  return props.offer.type === 'buy' 
    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
    : 'bg-gradient-to-r from-blue-500 to-indigo-500';
});

function viewUserProfile() {
  console.log('viewUserProfile called with offer:', props.offer);
  
  // Получаем user_id из offer
  // Сервер должен возвращать user_id как строку с ID пользователя
  let userId = props.offer.user_id;
  
  // Если user_id это объект, пытаемся получить ID из него
  if (typeof userId === 'object' && userId !== null) {
    userId = userId._id || userId.id;
  }
  
  console.log('Extracted userId:', userId);
  
  // Проверяем, что userId существует и валиден
  if (userId && userId !== 'undefined' && userId !== 'null' && userId !== null) {
    console.log('Navigating to user profile:', userId);
    router.push(`/users/${userId}`);
  } else {
    console.error('Invalid user_id in offer:', {
      raw_user_id: props.offer.user_id,
      extracted_userId: userId,
      offer_id: props.offer.id || props.offer._id,
      full_offer: props.offer
    });
    // Показываем предупреждение пользователю
    alert('Не удается открыть профиль пользователя. Данные профиля отсутствуют.');
  }
}

function handleImageError(event) {
  event.target.style.display = 'none';
}

function formatAmount(amount) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

function getDistrictName(district) {
  const districts = {
    tiraspol: '📍 Тирасполь',
    bendery: '📍 Бендеры',
    slobodzeya: '📍 Слободзея',
    grigoriopol: '📍 Григориополь',
    dubossary: '📍 Дубоссары',
    rybnitsa: '📍 Рыбница',
    kamenka: '📍 Каменка'
  };
  return districts[district] || district;
}

function formatTime(timestamp) {
  if (!timestamp) return 'только что';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'только что';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)} д назад`;
  
  return date.toLocaleDateString('ru-RU');
}
</script>