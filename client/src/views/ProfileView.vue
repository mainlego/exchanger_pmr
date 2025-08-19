<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Мой профиль
          </h1>
          <button @click="logout" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
    
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
          <div class="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
      
      <div v-else-if="user" class="space-y-6">
        <!-- User Info Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <div v-if="user.photo_url" class="w-20 h-20 rounded-full overflow-hidden">
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
        
        <!-- Contact Info -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Контактная информация</h3>
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
                Открыть
              </a>
            </div>
            
            <div v-if="user.phone" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
                <div>
                  <div class="text-sm text-gray-600">Телефон</div>
                  <div class="font-medium">{{ user.phone }}</div>
                </div>
              </div>
              <button 
                @click="copyPhone(user.phone)"
                class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
              >
                Копировать
              </button>
            </div>
            
            <div v-if="user.email" class="flex items-center p-3 bg-gray-50 rounded-lg">
              <svg class="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <div>
                <div class="text-sm text-gray-600">Email</div>
                <div class="font-medium">{{ user.email }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Reviews Section -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">Отзывы</h3>
            <button 
              @click="loadReviews"
              class="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Обновить
            </button>
          </div>
          
          <div v-if="reviews.length > 0" class="space-y-4">
            <div v-for="review in reviews" :key="review._id" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div @click="viewUserProfile(review.from_user_id)" class="flex items-center cursor-pointer hover:bg-white rounded-lg p-1 -m-1 transition-colors">
                  <div v-if="review.from_user_id?.photo_url" class="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      :src="review.from_user_id.photo_url" 
                      :alt="review.from_user_id.first_name"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                  </div>
                  <div v-else class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                    {{ (review.from_user_id?.first_name || 'U')[0] }}
                  </div>
                  <div class="ml-2">
                    <div class="font-medium text-sm">{{ review.from_user_id?.first_name || 'Пользователь' }}</div>
                    <div class="flex items-center">
                      <template v-for="i in 5" :key="i">
                        <svg :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'" 
                             class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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
        
        <!-- Report Section -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Подать жалобу</h3>
          <button 
            @click="showReportModal = true"
            class="w-full p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div class="flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span class="font-medium text-red-600">Сообщить о проблеме</span>
            </div>
          </button>
        </div>
        
        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Действия</h3>
          <div class="space-y-3">
            <button 
              @click="logout" 
              class="w-full p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all"
            >
              <div class="flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span class="font-medium text-red-600">Выйти из приложения</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Report Modal -->
    <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Подать жалобу</h3>
        
        <form @submit.prevent="submitReport" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Тип жалобы</label>
            <select v-model="reportData.type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">Выберите тип</option>
              <option value="user">Жалоба на пользователя</option>
              <option value="deal">Жалоба на сделку</option>
              <option value="review">Жалоба на отзыв</option>
              <option value="other">Другое</option>
            </select>
          </div>
          
          <div v-if="reportData.type === 'user'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Username пользователя</label>
            <input 
              v-model="reportData.targetUsername" 
              type="text" 
              placeholder="@username"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div v-if="reportData.type === 'deal'">
            <label class="block text-sm font-medium text-gray-700 mb-2">ID сделки</label>
            <input 
              v-model="reportData.dealId" 
              type="text" 
              placeholder="Введите ID сделки"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Описание проблемы</label>
            <textarea 
              v-model="reportData.description" 
              required
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Опишите проблему подробно..."
            ></textarea>
          </div>
          
          <div class="flex space-x-3">
            <button 
              type="submit"
              :disabled="submittingReport"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {{ submittingReport ? 'Отправка...' : 'Отправить жалобу' }}
            </button>
            <button 
              type="button"
              @click="closeReportModal"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import BottomNav from '@/components/BottomNav.vue';

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const loading = ref(false);
const reviews = ref([]);
const activeOffersCount = ref(0);
const reviewsCount = ref(0);
const showReportModal = ref(false);
const submittingReport = ref(false);
const reportData = ref({
  type: '',
  targetUsername: '',
  dealId: '',
  description: ''
});

onMounted(async () => {
  // Ждем немного, чтобы убедиться, что authStore загрузил пользователя
  setTimeout(async () => {
    await loadUserData();
    await loadReviews();
  }, 500);
});

async function loadUserData() {
  try {
    loading.value = true;
    
    // Убеждаемся, что у нас есть пользователь
    if (!user.value || (!user.value._id && !user.value.id)) {
      console.log('User not loaded yet');
      return;
    }
    
    const userId = user.value._id || user.value.id;
    console.log('Loading data for user:', userId);
    
    // Load user stats
    const [offersResponse] = await Promise.all([
      api.get('/offers/my').catch(() => ({ data: [] }))
    ]);
    
    activeOffersCount.value = offersResponse.data.filter(o => o.is_active).length;
  } catch (error) {
    console.error('Load user data error:', error);
  } finally {
    loading.value = false;
  }
}

async function loadReviews() {
  try {
    // Убеждаемся, что у нас есть пользователь
    if (!user.value || (!user.value._id && !user.value.id)) {
      console.log('User not loaded for reviews');
      return;
    }
    
    const userId = user.value._id || user.value.id;
    console.log('Loading reviews for user:', userId);
    
    const response = await api.get(`/reviews/user/${userId}`);
    console.log('Reviews loaded:', response.data);
    
    reviews.value = response.data || [];
    reviewsCount.value = reviews.value.length;
  } catch (error) {
    console.error('Load reviews error:', error);
    // Если endpoint не найден, попробуем альтернативный путь
    if (error.response?.status === 404) {
      reviews.value = [];
      reviewsCount.value = 0;
    }
  }
}

function copyPhone(phone) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(phone).then(() => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Телефон скопирован в буфер обмена');
      }
    });
  }
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function handleImageError(event) {
  // Скрываем изображение если оно не загрузилось
  event.target.style.display = 'none';
}

function viewUserProfile(user) {
  if (user && (user._id || user.id)) {
    router.push(`/users/${user._id || user.id}`);
  }
}

async function submitReport() {
  if (!reportData.value.description.trim()) return;
  
  submittingReport.value = true;
  
  try {
    const response = await api.post('/reports', {
      type: reportData.value.type,
      target_username: reportData.value.targetUsername,
      deal_id: reportData.value.dealId,
      description: reportData.value.description,
      reporter_id: user.value._id || user.value.id,
      reporter_username: user.value.username
    });
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Жалоба отправлена. Мы рассмотрим её в ближайшее время.');
    }
    
    closeReportModal();
  } catch (error) {
    console.error('Submit report error:', error);
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Ошибка при отправке жалобы. Попробуйте позже.');
    }
  } finally {
    submittingReport.value = false;
  }
}

function closeReportModal() {
  showReportModal.value = false;
  reportData.value = {
    type: '',
    targetUsername: '',
    dealId: '',
    description: ''
  };
}

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>