<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-20">
      <div class="px-3 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <button @click="$router.back()" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Сделка #{{ dealId?.slice(-6) }}
            </h1>
          </div>
          
          <!-- Status Badge -->
          <div v-if="deal" :class="getStatusClass(deal.status)" class="text-xs">
            {{ getStatusText(deal.status) }}
          </div>
        </div>
      </div>
    </header>
    
    <div class="px-3 py-3 max-w-full">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="relative">
          <div class="w-12 h-12 border-3 border-indigo-200 rounded-full"></div>
          <div class="absolute top-0 left-0 w-12 h-12 border-3 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
      
      <!-- Deal Details -->
      <div v-else-if="deal" class="space-y-4">
        <!-- Status Card -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <div :class="getStatusHeaderClass(deal.status)" class="px-4 py-3">
            <div class="text-white">
              <div class="text-xs opacity-90">Статус сделки</div>
              <div class="text-lg font-bold">{{ getStatusText(deal.status) }}</div>
            </div>
          </div>
          
          <!-- Deal Progress -->
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <div v-for="step in dealSteps" :key="step.key" class="flex-1 text-center">
                <div class="relative">
                  <div :class="[
                    'w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-all text-xs',
                    isStepCompleted(step.key) 
                      ? 'bg-green-500 text-white' 
                      : isCurrentStep(step.key)
                      ? 'bg-indigo-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  ]">
                    <span v-if="isStepCompleted(step.key)">✓</span>
                    <span v-else>{{ step.number }}</span>
                  </div>
                  <div class="mt-1 text-[10px]" :class="isStepCompleted(step.key) ? 'text-green-600 font-semibold' : 'text-gray-500'">
                    {{ step.label }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Status Actions -->
            <div v-if="canPerformActions" class="space-y-2">
              <!-- For Maker: Accept/Reject -->
              <div v-if="isMaker && deal.status === 'pending'" class="space-y-2">
                <button 
                  @click="updateStatus('accepted')"
                  class="w-full px-3 py-2.5 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                >
                  ✅ Принять сделку
                </button>
                <button 
                  @click="updateStatus('cancelled')"
                  class="w-full px-3 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  ❌ Отклонить
                </button>
              </div>
              
              <!-- For Both: Mark as Completed -->
              <div v-if="deal.status === 'accepted'" class="space-y-2">
                <div class="p-3 bg-blue-50 rounded-lg">
                  <p class="text-xs text-blue-900 mb-2 font-semibold">
                    📱 Контакты для связи:
                  </p>
                  <div class="space-y-2 text-sm">
                    <!-- Show taker contacts to maker -->
                    <div v-if="isMaker" class="space-y-1">
                      <div class="text-xs text-gray-700">Покупатель:</div>
                      <div v-if="deal.contact_telegram" class="font-medium">
                        <span class="text-xs text-gray-600">Telegram:</span>
                        <a 
                          :href="`https://t.me/${deal.contact_telegram.replace('@', '')}`"
                          target="_blank"
                          class="text-blue-600 hover:underline ml-1"
                        >
                          {{ deal.contact_telegram }}
                        </a>
                      </div>
                      <div v-if="deal.contact_phone" class="font-medium">
                        <span class="text-xs text-gray-600">Телефон:</span>
                        <button 
                          @click="copyPhone(deal.contact_phone)"
                          class="text-blue-600 hover:underline ml-1"
                        >
                          {{ deal.contact_phone }}
                          <span class="text-xs ml-1">📋</span>
                        </button>
                      </div>
                    </div>
                    <!-- Show maker contacts to taker -->
                    <div v-if="isTaker" class="space-y-1">
                      <div class="text-xs text-gray-700">Продавец:</div>
                      <div v-if="deal.maker_id?.username" class="font-medium">
                        <span class="text-xs text-gray-600">Telegram:</span>
                        <a 
                          :href="`https://t.me/${deal.maker_id.username}`"
                          target="_blank"
                          class="text-blue-600 hover:underline ml-1"
                        >
                          @{{ deal.maker_id.username }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Confirmation Status -->
                <div v-if="deal.status === 'accepted'" class="p-3 bg-yellow-50 rounded-lg mb-2">
                  <p class="text-xs text-yellow-900 font-semibold mb-2">
                    Подтверждение завершения:
                  </p>
                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-xs">
                      <span>Продавец:</span>
                      <span :class="deal.maker_confirmed ? 'text-green-600 font-semibold' : 'text-gray-400'">
                        {{ deal.maker_confirmed ? '✅ Подтверждено' : '⏳ Ожидается' }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span>Покупатель:</span>
                      <span :class="deal.taker_confirmed ? 'text-green-600 font-semibold' : 'text-gray-400'">
                        {{ deal.taker_confirmed ? '✅ Подтверждено' : '⏳ Ожидается' }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  v-if="!hasUserConfirmed"
                  @click="updateStatus('completed')"
                  class="w-full px-3 py-2.5 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                >
                  ✅ Подтвердить успешную сделку
                </button>
                <div v-else class="p-3 bg-green-50 rounded-lg text-center">
                  <p class="text-sm text-green-700 font-medium">
                    ✅ Вы подтвердили завершение сделки
                  </p>
                  <p class="text-xs text-green-600 mt-1">
                    Ожидаем подтверждения от второй стороны
                  </p>
                </div>
                <button 
                  @click="updateStatus('disputed')"
                  class="w-full px-3 py-2.5 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors"
                >
                  ⚠️ Сообщить о проблеме
                </button>
              </div>
              
              <!-- Cancel Option -->
              <button 
                v-if="deal.status === 'pending' && isTaker"
                @click="updateStatus('cancelled')"
                class="w-full px-3 py-2.5 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
              >
                Отменить заявку
              </button>
            </div>
          </div>
        </div>
        
        <!-- Deal Info -->
        <div class="bg-white rounded-xl shadow-md p-4">
          <h3 class="font-semibold text-gray-900 mb-3 text-sm">Детали сделки</h3>
          
          <div class="space-y-3">
            <!-- Amount -->
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="text-xs text-gray-600 mb-1">Сумма сделки</div>
              <div class="font-bold text-base">{{ formatAmount(deal.amount) }} {{ deal.offer_id?.currency_from }}</div>
              <div class="text-xs text-gray-500">
                → {{ formatAmount(deal.amount * (deal.offer_id?.rate || 0)) }} {{ deal.offer_id?.currency_to }}
              </div>
            </div>
            
            <!-- Participants -->
            <div class="grid grid-cols-2 gap-2">
              <div class="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors" @click="viewProfile(deal.maker_id)">
                <div class="flex items-center space-x-2 mb-2">
                  <div v-if="deal.maker_id?.photo_url" class="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      :src="deal.maker_id.photo_url" 
                      :alt="deal.maker_id.first_name || deal.maker_id.username"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                  </div>
                  <div v-else class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                    {{ (deal.maker_id?.first_name || deal.maker_id?.username || 'П')[0].toUpperCase() }}
                  </div>
                  <div class="flex-1">
                    <div class="text-xs text-blue-600">Продавец</div>
                    <div class="font-semibold text-sm">{{ deal.maker_id?.first_name || 'Продавец' }}</div>
                  </div>
                </div>
                <div class="text-xs text-gray-600">⭐ {{ (deal.maker_id?.rating || 0).toFixed(1) }}</div>
                <div class="text-xs text-blue-600 mt-1 font-medium">Смотреть профиль →</div>
              </div>
              <div class="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors" @click="viewProfile(deal.taker_id)">
                <div class="flex items-center space-x-2 mb-2">
                  <div v-if="deal.taker_id?.photo_url" class="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      :src="deal.taker_id.photo_url" 
                      :alt="deal.taker_id.first_name || deal.taker_id.username"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                  </div>
                  <div v-else class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                    {{ (deal.taker_id?.first_name || deal.taker_id?.username || 'П')[0].toUpperCase() }}
                  </div>
                  <div class="flex-1">
                    <div class="text-xs text-green-600">Покупатель</div>
                    <div class="font-semibold text-sm">{{ deal.taker_id?.first_name || 'Покупатель' }}</div>
                  </div>
                </div>
                <div class="text-xs text-gray-600">⭐ {{ (deal.taker_id?.rating || 0).toFixed(1) }}</div>
                <div class="text-xs text-green-600 mt-1 font-medium">Смотреть профиль →</div>
              </div>
            </div>
            
            <!-- Location -->
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="text-xs text-gray-600 mb-1">Место встречи</div>
              <div class="font-semibold text-sm">{{ getDistrictName(deal.offer_id?.district) }}</div>
              <div v-if="deal.offer_id?.location" class="text-xs text-gray-600">
                {{ deal.offer_id?.location }}
              </div>
            </div>
            
            <!-- Created Date -->
            <div class="text-xs text-gray-500 text-center">
              Создана: {{ formatDate(deal.createdAt || deal.created_at) }}
            </div>
          </div>
        </div>
        
        <!-- Messages -->
        <div class="bg-white rounded-xl shadow-md p-4">
          <h3 class="font-semibold text-gray-900 mb-3 text-sm">Сообщения</h3>
          
          <div v-if="messages.length > 0" class="space-y-2 mb-3 max-h-48 overflow-y-auto">
            <div v-for="msg in messages" :key="msg.id" 
                 :class="[
                   'flex items-start space-x-2',
                   msg.user_id === authStore.user?.id ? 'justify-end' : 'justify-start'
                 ]">
              <!-- Avatar for other user's messages -->
              <div v-if="msg.user_id !== authStore.user?.id" class="flex-shrink-0">
                <div v-if="getUserPhoto(msg.user_id)" class="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    :src="getUserPhoto(msg.user_id)" 
                    :alt="getUserName(msg.user_id)"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                </div>
                <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {{ (getUserName(msg.user_id) || 'П')[0].toUpperCase() }}
                </div>
              </div>
              
              <div :class="[
                'p-2 rounded-lg text-sm max-w-[70%]',
                msg.user_id === authStore.user?.id 
                  ? 'bg-indigo-100' 
                  : 'bg-gray-100'
              ]">
                <div class="text-xs font-medium mb-1">
                  {{ msg.user_id === authStore.user?.id ? 'Вы' : getUserName(msg.user_id) || 'Пользователь' }}
                </div>
                <div class="text-gray-700">{{ msg.message }}</div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ formatTime(msg.createdAt || msg.created_at) }}
                </div>
              </div>
              
              <!-- Avatar for current user's messages -->
              <div v-if="msg.user_id === authStore.user?.id" class="flex-shrink-0">
                <div v-if="authStore.user?.photo_url" class="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    :src="authStore.user.photo_url" 
                    :alt="authStore.user.first_name || authStore.user.username"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                </div>
                <div v-else class="w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {{ (authStore.user?.first_name || authStore.user?.username || 'В')[0].toUpperCase() }}
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center text-gray-500 py-3 text-sm">
            Нет сообщений
          </div>
          
          <!-- Message Input -->
          <form @submit.prevent="sendMessage" class="flex items-center space-x-2">
            <input 
              v-model="newMessage"
              type="text"
              placeholder="Написать сообщение..."
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button 
              type="submit"
              :disabled="!newMessage.trim()"
              class="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </form>
        </div>
        
        <!-- Leave Review or Show Submitted Review -->
        <div v-if="deal.status === 'completed'" class="bg-white rounded-xl shadow-md p-4">
          <!-- Show submitted review -->
          <div v-if="hasLeftReview && submittedReview">
            <h3 class="font-semibold text-gray-900 mb-3 text-sm">Ваш отзыв</h3>
            <div class="p-3 bg-green-50 rounded-lg">
              <div class="flex items-center mb-2">
                <template v-for="i in 5" :key="i">
                  <svg :class="i <= submittedReview.rating ? 'text-yellow-400' : 'text-gray-300'" 
                       class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </template>
                <span class="ml-2 text-sm font-medium">{{ submittedReview.rating }} из 5</span>
              </div>
              <div v-if="submittedReview.comment" class="text-sm text-gray-700">
                {{ submittedReview.comment }}
              </div>
              <div class="text-xs text-gray-500 mt-2">
                Отзыв отправлен ✓
              </div>
            </div>
          </div>
          
          <!-- Show review form -->
          <div v-else>
            <h3 class="font-semibold text-gray-900 mb-3 text-sm">Оставить отзыв</h3>
            
            <form @submit.prevent="submitReview" class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-2">Оценка</label>
                <div class="flex space-x-1">
                  <button 
                    v-for="i in 5" 
                    :key="i"
                    type="button"
                    @click="reviewRating = i"
                    class="text-2xl transition-all focus:outline-none"
                  >
                    <svg 
                      :class="[
                        'w-7 h-7 transition-all',
                        i <= reviewRating 
                          ? 'text-yellow-400 fill-current transform scale-110' 
                          : 'text-gray-300 stroke-current fill-none'
                      ]"
                      :fill="i <= reviewRating ? 'currentColor' : 'none'"
                      :stroke="i <= reviewRating ? 'none' : 'currentColor'"
                      stroke-width="1.5"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </button>
                </div>
                <div class="text-xs text-gray-600 mt-1">
                  {{ reviewRating > 0 ? `Выбрано: ${reviewRating} ${reviewRating === 1 ? 'звезда' : reviewRating < 5 ? 'звезды' : 'звезд'}` : 'Выберите оценку' }}
                </div>
              </div>
              
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Комментарий</label>
                <textarea 
                  v-model="reviewComment"
                  rows="3"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Поделитесь вашим опытом..."
                ></textarea>
              </div>
              
              <button 
                type="submit"
                :disabled="!reviewRating"
                class="w-full px-3 py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                Отправить отзыв
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else class="text-center py-12">
        <div class="text-5xl mb-3">❌</div>
        <div class="text-lg font-semibold text-gray-700 mb-2">Сделка не найдена</div>
        <router-link to="/deals" class="text-indigo-600 hover:text-indigo-700 text-sm">
          Вернуться к сделкам
        </router-link>
      </div>
    </div>
    
    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDealsStore } from '@/stores/deals';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import BottomNav from '@/components/BottomNav.vue';

const route = useRoute();
const router = useRouter();
const dealsStore = useDealsStore();
const authStore = useAuthStore();

const dealId = computed(() => route.params.id);
const deal = ref(null);
const messages = ref([]);
const loading = ref(true);
const newMessage = ref('');
const reviewRating = ref(0);
const reviewComment = ref('');
const hasLeftReview = ref(false);
const submittedReview = ref(null);

const isMaker = computed(() => {
  return deal.value && authStore.user && 
    (deal.value.maker_id?._id === authStore.user._id || 
     deal.value.maker_id?._id === authStore.user.id ||
     deal.value.maker_id === authStore.user._id ||
     deal.value.maker_id === authStore.user.id);
});

const isTaker = computed(() => {
  return deal.value && authStore.user && 
    (deal.value.taker_id?._id === authStore.user._id || 
     deal.value.taker_id?._id === authStore.user.id ||
     deal.value.taker_id === authStore.user._id ||
     deal.value.taker_id === authStore.user.id);
});

const canPerformActions = computed(() => {
  return deal.value && (isMaker.value || isTaker.value);
});

const hasUserConfirmed = computed(() => {
  if (!deal.value) return false;
  if (isMaker.value) return deal.value.maker_confirmed;
  if (isTaker.value) return deal.value.taker_confirmed;
  return false;
});

const dealSteps = [
  { key: 'pending', number: 1, label: 'Ожидание' },
  { key: 'accepted', number: 2, label: 'Принята' },
  { key: 'completed', number: 3, label: 'Завершена' }
];

onMounted(async () => {
  await loadDeal();
  await loadMessages();
  await checkExistingReview();
});

async function loadDeal() {
  try {
    loading.value = true;
    deal.value = await dealsStore.fetchDeal(dealId.value);
    console.log('Deal loaded:', deal.value);
    console.log('Maker ID:', deal.value?.maker_id);
    console.log('Taker ID:', deal.value?.taker_id);
  } finally {
    loading.value = false;
  }
}

async function loadMessages() {
  try {
    messages.value = await dealsStore.fetchMessages(dealId.value);
  } catch (error) {
    console.error('Load messages error:', error);
  }
}

async function updateStatus(status) {
  try {
    const response = await dealsStore.updateDealStatus(dealId.value, status);
    
    // Update local deal data with response
    if (response) {
      deal.value = { ...deal.value, ...response };
    }
    
    if (window.Telegram?.WebApp) {
      if (status === 'completed' && !deal.value.status !== 'completed') {
        window.Telegram.WebApp.showAlert('Вы подтвердили завершение сделки. Ожидаем подтверждения от второй стороны.');
      } else {
        window.Telegram.WebApp.showAlert(getStatusUpdateMessage(status));
      }
    }
    
    // If completed or cancelled, redirect to deals list after a delay
    if (deal.value.status === 'completed' || deal.value.status === 'cancelled') {
      setTimeout(() => {
        router.push('/deals');
      }, 2000);
    }
  } catch (error) {
    console.error('Update status error:', error);
  }
}

function copyPhone(phone) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(phone).then(() => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Телефон скопирован в буфер обмена');
      } else {
        alert('Телефон скопирован в буфер обмена');
      }
    }).catch(() => {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = phone;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Телефон скопирован в буфер обмена');
      }
    });
  }
}

async function sendMessage() {
  if (!newMessage.value.trim()) return;
  
  try {
    const message = await dealsStore.sendMessage(dealId.value, newMessage.value);
    messages.value.push(message);
    newMessage.value = '';
  } catch (error) {
    console.error('Send message error:', error);
  }
}

async function submitReview() {
  if (!reviewRating.value) return;
  
  try {
    await api.post('/reviews', {
      deal_id: dealId.value,
      rating: reviewRating.value,
      comment: reviewComment.value
    });
    
    hasLeftReview.value = true;
    submittedReview.value = {
      rating: reviewRating.value,
      comment: reviewComment.value
    };
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Отзыв успешно отправлен!');
    }
  } catch (error) {
    console.error('Submit review error:', error);
  }
}

async function checkExistingReview() {
  if (!deal.value || deal.value.status !== 'completed') return;
  
  try {
    // Check if current user has already left a review for this deal
    const response = await api.get(`/reviews/check/${dealId.value}`);
    if (response.data.exists) {
      hasLeftReview.value = true;
      submittedReview.value = response.data.review;
    }
  } catch (error) {
    console.error('Check review error:', error);
  }
}

function viewProfile(user) {
  if (!user) {
    console.log('viewProfile: user is null/undefined');
    return;
  }
  console.log('viewProfile called with user:', user);
  
  // Если user уже строка (ID), используем её напрямую
  let userId;
  if (typeof user === 'string') {
    userId = user;
  } else if (typeof user === 'object') {
    userId = user._id || user.id;
  }
  
  if (!userId) {
    console.error('Cannot determine user ID from:', user);
    return;
  }
  
  console.log('Navigating to user profile with ID:', userId);
  router.push(`/users/${userId}`);
}

function handleImageError(event) {
  // Hide the image if it fails to load
  event.target.style.display = 'none';
}

function getUserPhoto(userId) {
  // If userId is a string, check if it matches maker or taker
  if (typeof userId === 'string') {
    if (deal.value?.maker_id?._id === userId || deal.value?.maker_id?.id === userId) {
      return deal.value.maker_id.photo_url;
    }
    if (deal.value?.taker_id?._id === userId || deal.value?.taker_id?.id === userId) {
      return deal.value.taker_id.photo_url;
    }
    return null;
  }
  
  // If userId is an object with user data
  if (typeof userId === 'object' && userId) {
    return userId.photo_url;
  }
  
  return null;
}

function getUserName(userId) {
  // If userId is a string, check if it matches maker or taker
  if (typeof userId === 'string') {
    if (deal.value?.maker_id?._id === userId || deal.value?.maker_id?.id === userId) {
      return deal.value.maker_id.first_name || deal.value.maker_id.username;
    }
    if (deal.value?.taker_id?._id === userId || deal.value?.taker_id?.id === userId) {
      return deal.value.taker_id.first_name || deal.value.taker_id.username;
    }
    return null;
  }
  
  // If userId is an object with user data
  if (typeof userId === 'object' && userId) {
    return userId.first_name || userId.username;
  }
  
  return null;
}

function getStatusClass(status) {
  const classes = {
    pending: 'px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-semibold',
    accepted: 'px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold',
    completed: 'px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold',
    cancelled: 'px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold',
    disputed: 'px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold'
  };
  return classes[status] || '';
}

function getStatusHeaderClass(status) {
  const classes = {
    pending: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    accepted: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    completed: 'bg-gradient-to-r from-green-500 to-emerald-500',
    cancelled: 'bg-gradient-to-r from-red-500 to-pink-500',
    disputed: 'bg-gradient-to-r from-orange-500 to-red-500'
  };
  return classes[status] || '';
}

function getStatusText(status) {
  const texts = {
    pending: '⏳ Ожидает подтверждения',
    accepted: '✅ Принята',
    completed: '🎉 Завершена',
    cancelled: '❌ Отменена',
    disputed: '⚠️ Спорная'
  };
  return texts[status] || status;
}

function getStatusUpdateMessage(status) {
  const messages = {
    accepted: 'Сделка принята! Контакты переданы обеим сторонам.',
    completed: 'Сделка успешно завершена!',
    cancelled: 'Сделка отменена.',
    disputed: 'Сообщение о проблеме отправлено администратору.'
  };
  return messages[status] || 'Статус обновлен';
}

function isStepCompleted(step) {
  const order = ['pending', 'accepted', 'completed'];
  const currentIndex = order.indexOf(deal.value?.status);
  const stepIndex = order.indexOf(step);
  return stepIndex < currentIndex;
}

function isCurrentStep(step) {
  return deal.value?.status === step;
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

function formatAmount(amount) {
  return new Intl.NumberFormat('ru-RU').format(amount);
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>