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
            Создание сделки
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
      
      <!-- Deal Form -->
      <div v-else-if="offer" class="space-y-6">
        <!-- Offer Summary -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Предложение</h2>
          
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
            <div class="flex items-center justify-between mb-2">
              <span :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold',
                offer.type === 'buy' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              ]">
                {{ offer.type === 'buy' ? 'ПОКУПКА' : 'ПРОДАЖА' }}
              </span>
              <span class="text-sm text-gray-600">
                Курс: <span class="font-bold">{{ offer.rate }}</span>
              </span>
            </div>
            
            <div class="flex items-center justify-center space-x-3">
              <div class="text-center">
                <div class="text-2xl font-bold">{{ formatAmount(offer.amount_from) }}</div>
                <div class="text-sm text-gray-600">{{ offer.currency_from }}</div>
              </div>
              <svg class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
              <div class="text-center">
                <div class="text-2xl font-bold">{{ formatAmount(offer.amount_to) }}</div>
                <div class="text-sm text-gray-600">{{ offer.currency_to }}</div>
              </div>
            </div>
          </div>
          
          <!-- Seller Info -->
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ (offer.first_name || offer.username || 'U')[0].toUpperCase() }}
              </div>
              <div>
                <div class="font-semibold">{{ offer.first_name || offer.username || 'Продавец' }}</div>
                <div class="flex items-center text-sm text-gray-600">
                  <span class="flex items-center">
                    ⭐ {{ offer.rating || 0 }}
                  </span>
                  <span class="ml-2">
                    🤝 {{ offer.deals_count || 0 }} сделок
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Deal Details Form -->
        <form @submit.prevent="createDeal" class="space-y-6">
          <!-- Amount Input -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Сумма сделки</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Сколько {{ offer.currency_from }} вы хотите обменять?
                </label>
                <div class="relative">
                  <input 
                    v-model.number="dealAmount"
                    type="number"
                    :min="offer.min_amount"
                    :max="offer.max_amount"
                    :step="0.01"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    :placeholder="`от ${offer.min_amount} до ${offer.max_amount}`"
                  />
                  <span class="absolute right-4 top-3.5 text-gray-500">{{ offer.currency_from }}</span>
                </div>
                <div class="mt-2 text-sm text-gray-600">
                  Лимиты: {{ formatAmount(offer.min_amount) }} - {{ formatAmount(offer.max_amount) }} {{ offer.currency_from }}
                </div>
              </div>
              
              <!-- Calculated Result -->
              <div v-if="dealAmount" class="p-4 bg-green-50 rounded-lg">
                <div class="text-sm text-green-700 mb-1">Вы получите:</div>
                <div class="text-2xl font-bold text-green-900">
                  {{ formatAmount(dealAmount * offer.rate) }} {{ offer.currency_to }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Contact Info -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Контактная информация</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Ваш Telegram для связи
                </label>
                <input 
                  v-model="contactInfo.telegram"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  :placeholder="`@${authStore.user?.username || 'yourusername'}`"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Продавец получит ваш контакт только после подтверждения сделки
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Телефон (опционально)
                </label>
                <input 
                  v-model="contactInfo.phone"
                  type="tel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+373 XXX XX XXX"
                />
              </div>
            </div>
          </div>
          
          <!-- Message -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Сообщение продавцу</h3>
            
            <textarea 
              v-model="message"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Добавьте сообщение для продавца (опционально)..."
            ></textarea>
          </div>
          
          <!-- Terms -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div class="flex items-start">
              <input 
                v-model="agreeToTerms"
                type="checkbox"
                required
                class="mt-1 mr-3"
              />
              <div class="text-sm">
                <p class="text-yellow-900 font-medium mb-2">
                  Я понимаю и соглашаюсь с условиями:
                </p>
                <ul class="text-yellow-700 space-y-1">
                  <li>• Встреча происходит в публичном месте</li>
                  <li>• Я проверю подлинность купюр при встрече</li>
                  <li>• Контакты будут переданы только после подтверждения продавцом</li>
                  <li>• После сделки я оставлю отзыв о продавце</li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="!agreeToTerms || submitting"
            class="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style="cursor: pointer; -webkit-appearance: none; -webkit-tap-highlight-color: transparent;"
          >
            {{ submitting ? 'Отправка заявки...' : '🤝 Отправить заявку на сделку' }}
          </button>
        </form>
      </div>
      
      <!-- Error State -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">❌</div>
        <div class="text-xl font-semibold text-gray-700 mb-2">Предложение не найдено</div>
        <router-link to="/offers" class="text-indigo-600 hover:text-indigo-700">
          Вернуться к предложениям
        </router-link>
      </div>
    </div>
    
    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOffersStore } from '@/stores/offers';
import { useDealsStore } from '@/stores/deals';
import { useAuthStore } from '@/stores/auth';
import BottomNav from '@/components/BottomNav.vue';

const route = useRoute();
const router = useRouter();
const offersStore = useOffersStore();
const dealsStore = useDealsStore();
const authStore = useAuthStore();

const offer = ref(null);
const loading = ref(true);
const submitting = ref(false);

const dealAmount = ref('');
const contactInfo = ref({
  telegram: '',
  phone: ''
});
const message = ref('');
const agreeToTerms = ref(false);

onMounted(async () => {
  try {
    const offerId = route.query.offer;
    if (offerId) {
      offer.value = await offersStore.fetchOffer(offerId);
      
      // Предзаполнение контактов
      if (authStore.user) {
        contactInfo.value.telegram = `@${authStore.user.username}` || '';
        contactInfo.value.phone = authStore.user.phone || '';
      }
    }
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

async function createDeal() {
  if (!agreeToTerms.value) return;
  
  submitting.value = true;
  
  try {
    const dealData = {
      offer_id: offer.value.id,
      amount: dealAmount.value,
      message: message.value,
      contact_telegram: contactInfo.value.telegram,
      contact_phone: contactInfo.value.phone
    };
    
    const deal = await dealsStore.createDeal(dealData);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Заявка на сделку отправлена! Ожидайте подтверждения от продавца.');
    }
    
    // Переход на страницу сделки
    router.push(`/deals/${deal.id}`);
  } catch (error) {
    console.error('Create deal error:', error);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Ошибка при создании сделки. Попробуйте еще раз.');
    }
  } finally {
    submitting.value = false;
  }
}
</script>