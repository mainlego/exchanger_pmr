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
              Сделка #{{ dealId?.slice(-6) }}
            </h1>
          </div>
          
          <!-- Status Badge -->
          <div v-if="deal" :class="getStatusClass(deal.status)">
            {{ getStatusText(deal.status) }}
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
      
      <!-- Deal Details -->
      <div v-else-if="deal" class="space-y-6">
        <!-- Status Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div :class="getStatusHeaderClass(deal.status)" class="px-6 py-4">
            <div class="text-white">
              <div class="text-sm opacity-90 mb-1">Статус сделки</div>
              <div class="text-2xl font-bold">{{ getStatusText(deal.status) }}</div>
            </div>
          </div>
          
          <!-- Deal Progress -->
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div v-for="step in dealSteps" :key="step.key" class="flex-1 text-center">
                <div class="relative">
                  <div :class="[
                    'w-10 h-10 mx-auto rounded-full flex items-center justify-center transition-all',
                    isStepCompleted(step.key) 
                      ? 'bg-green-500 text-white' 
                      : isCurrentStep(step.key)
                      ? 'bg-indigo-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  ]">
                    <span v-if="isStepCompleted(step.key)">✓</span>
                    <span v-else>{{ step.number }}</span>
                  </div>
                  <div class="mt-2 text-xs" :class="isStepCompleted(step.key) ? 'text-green-600 font-semibold' : 'text-gray-500'">
                    {{ step.label }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Status Actions -->
            <div v-if="canPerformActions" class="space-y-3">
              <!-- For Maker: Accept/Reject -->
              <div v-if="isMaker && deal.status === 'pending'" class="flex space-x-3">
                <button 
                  @click="updateStatus('accepted')"
                  class="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  ✅ Принять сделку
                </button>
                <button 
                  @click="updateStatus('cancelled')"
                  class="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  ❌ Отклонить
                </button>
              </div>
              
              <!-- For Both: Mark as Completed -->
              <div v-if="deal.status === 'accepted'" class="space-y-3">
                <div class="p-4 bg-blue-50 rounded-lg">
                  <p class="text-sm text-blue-900 mb-2">
                    📱 Контакты {{ isMaker ? 'покупателя' : 'продавца' }}:
                  </p>
                  <div class="space-y-1 font-semibold">
                    <div v-if="deal.contact_telegram">
                      Telegram: {{ deal.contact_telegram }}
                    </div>
                    <div v-if="deal.contact_phone">
                      Телефон: {{ deal.contact_phone }}
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="updateStatus('completed')"
                  class="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  ✅ Подтвердить успешную сделку
                </button>
                <button 
                  @click="updateStatus('disputed')"
                  class="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  ⚠️ Сообщить о проблеме
                </button>
              </div>
              
              <!-- Cancel Option -->
              <button 
                v-if="deal.status === 'pending' && isTaker"
                @click="updateStatus('cancelled')"
                class="w-full px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Отменить заявку
              </button>
            </div>
          </div>
        </div>
        
        <!-- Deal Info -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Детали сделки</h3>
          
          <div class="space-y-4">
            <!-- Amount -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="text-gray-600">Сумма сделки</span>
              <div class="text-right">
                <div class="font-bold text-lg">{{ formatAmount(deal.amount) }} {{ deal.offer_id?.currency_from }}</div>
                <div class="text-sm text-gray-500">
                  → {{ formatAmount(deal.amount * (deal.offer_id?.rate || 0)) }} {{ deal.offer_id?.currency_to }}
                </div>
              </div>
            </div>
            
            <!-- Participants -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-blue-50 rounded-lg">
                <div class="text-sm text-blue-600 mb-2">Продавец</div>
                <div class="font-semibold">{{ deal.maker_id?.first_name || 'Продавец' }}</div>
                <div class="text-sm text-gray-600">⭐ {{ deal.maker_id?.rating || 0 }}</div>
              </div>
              <div class="p-4 bg-green-50 rounded-lg">
                <div class="text-sm text-green-600 mb-2">Покупатель</div>
                <div class="font-semibold">{{ deal.taker_id?.first_name || 'Покупатель' }}</div>
                <div class="text-sm text-gray-600">⭐ {{ deal.taker_id?.rating || 0 }}</div>
              </div>
            </div>
            
            <!-- Location -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Место встречи</div>
              <div class="font-semibold">{{ deal.offer_id?.district }}</div>
              <div v-if="deal.offer_id?.location" class="text-sm text-gray-600">
                {{ deal.offer_id?.location }}
              </div>
            </div>
            
            <!-- Created Date -->
            <div class="text-sm text-gray-500 text-center">
              Создана: {{ formatDate(deal.createdAt || deal.created_at) }}
            </div>
          </div>
        </div>
        
        <!-- Messages -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Сообщения</h3>
          
          <div v-if="messages.length > 0" class="space-y-3 mb-4 max-h-64 overflow-y-auto">
            <div v-for="msg in messages" :key="msg.id" 
                 :class="[
                   'p-3 rounded-lg',
                   msg.user_id === authStore.user?.id 
                     ? 'bg-indigo-100 ml-auto max-w-[80%]' 
                     : 'bg-gray-100 mr-auto max-w-[80%]'
                 ]">
              <div class="text-sm font-medium mb-1">
                {{ msg.user_id === authStore.user?.id ? 'Вы' : msg.user_id?.first_name || 'Пользователь' }}
              </div>
              <div class="text-gray-700">{{ msg.message }}</div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatTime(msg.createdAt || msg.created_at) }}
              </div>
            </div>
          </div>
          
          <div v-else class="text-center text-gray-500 py-4">
            Нет сообщений
          </div>
          
          <!-- Message Input -->
          <form @submit.prevent="sendMessage" class="flex space-x-2">
            <input 
              v-model="newMessage"
              type="text"
              placeholder="Написать сообщение..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button 
              type="submit"
              :disabled="!newMessage.trim()"
              class="px-6 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              Отправить
            </button>
          </form>
        </div>
        
        <!-- Leave Review (if completed) -->
        <div v-if="deal.status === 'completed' && !hasLeftReview" class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Оставить отзыв</h3>
          
          <form @submit.prevent="submitReview" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Оценка</label>
              <div class="flex space-x-2">
                <button 
                  v-for="i in 5" 
                  :key="i"
                  type="button"
                  @click="reviewRating = i"
                  class="text-3xl transition-colors"
                  :class="i <= reviewRating ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ⭐
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
              <textarea 
                v-model="reviewComment"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Поделитесь вашим опытом..."
              ></textarea>
            </div>
            
            <button 
              type="submit"
              :disabled="!reviewRating"
              class="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              Отправить отзыв
            </button>
          </form>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">❌</div>
        <div class="text-xl font-semibold text-gray-700 mb-2">Сделка не найдена</div>
        <router-link to="/deals" class="text-indigo-600 hover:text-indigo-700">
          Вернуться к сделкам
        </router-link>
      </div>
    </div>
    
    <!-- Bottom padding -->
    <div class="h-20"></div>
    
    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDealsStore } from '@/stores/deals';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import BottomNav from '@/components/BottomNav.vue';

const route = useRoute();
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

const isMaker = computed(() => {
  return deal.value && authStore.user && 
    (deal.value.maker_id?._id === authStore.user._id || deal.value.maker_id === authStore.user._id);
});

const isTaker = computed(() => {
  return deal.value && authStore.user && 
    (deal.value.taker_id?._id === authStore.user._id || deal.value.taker_id === authStore.user._id);
});

const canPerformActions = computed(() => {
  return deal.value && (isMaker.value || isTaker.value);
});

const dealSteps = [
  { key: 'pending', number: 1, label: 'Ожидание' },
  { key: 'accepted', number: 2, label: 'Принята' },
  { key: 'completed', number: 3, label: 'Завершена' }
];

onMounted(async () => {
  await loadDeal();
  await loadMessages();
  // Check if review exists
  // TODO: Implement review check
});

async function loadDeal() {
  try {
    loading.value = true;
    deal.value = await dealsStore.fetchDeal(dealId.value);
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
    await dealsStore.updateDealStatus(dealId.value, status);
    deal.value.status = status;
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(getStatusUpdateMessage(status));
    }
  } catch (error) {
    console.error('Update status error:', error);
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
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Отзыв успешно отправлен!');
    }
  } catch (error) {
    console.error('Submit review error:', error);
  }
}

function getStatusClass(status) {
  const classes = {
    pending: 'px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold',
    accepted: 'px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold',
    completed: 'px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold',
    cancelled: 'px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold',
    disputed: 'px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold'
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