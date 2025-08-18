<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-20">
      <div class="px-3 py-3">
        <h1 class="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Мои сделки
        </h1>
      </div>
    </header>
    
    <div class="px-3 py-3">
      <!-- Tabs -->
      <div class="flex space-x-1 mb-4 bg-white rounded-lg p-1 shadow-sm">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex-1 px-2 py-2 rounded-md text-xs font-medium transition-all',
            activeTab === tab.key
              ? 'bg-indigo-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
          <span v-if="tab.count > 0" class="ml-1 px-1.5 py-0.5 text-xs rounded-full"
                :class="activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="relative">
          <div class="w-12 h-12 border-3 border-indigo-200 rounded-full"></div>
          <div class="absolute top-0 left-0 w-12 h-12 border-3 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>

      <!-- Deals List -->
      <div v-else-if="filteredDeals.length > 0" class="space-y-3">
        <div 
          v-for="deal in filteredDeals" 
          :key="deal._id || deal.id"
          @click="openDeal(deal._id || deal.id)"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
        >
          <!-- Deal Status Bar -->
          <div :class="getStatusBarClass(deal.status)" class="h-1"></div>
          
          <div class="p-3">
            <!-- Deal Header -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span :class="getStatusClass(deal.status)" class="text-xs">
                  {{ getStatusText(deal.status) }}
                </span>
                <span class="text-xs text-gray-500">
                  #{{ (deal._id || deal.id).slice(-6) }}
                </span>
              </div>
              <span class="text-xs text-gray-500">
                {{ formatDate(deal.createdAt || deal.created_at) }}
              </span>
            </div>

            <!-- Deal Amount -->
            <div class="mb-2">
              <div class="text-lg font-bold text-gray-900">
                {{ formatAmount(deal.amount) }} {{ deal.offer_id?.currency_from }}
              </div>
              <div class="text-xs text-gray-500">
                → {{ formatAmount(deal.amount * (deal.offer_id?.rate || 0)) }} {{ deal.offer_id?.currency_to }}
              </div>
              <div class="text-xs text-gray-600 mt-1">
                Курс: {{ deal.offer_id?.rate }}
              </div>
            </div>

            <!-- Participants -->
            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ getInitial(deal.maker_id) }}
                </div>
                <div>
                  <div class="text-xs font-medium text-gray-900">
                    {{ isMaker(deal) ? 'Вы' : deal.maker_id?.first_name || 'Продавец' }}
                  </div>
                  <div class="text-xs text-gray-500">Продавец</div>
                </div>
              </div>
              
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
              </svg>
              
              <div class="flex items-center space-x-2">
                <div class="text-right">
                  <div class="text-xs font-medium text-gray-900">
                    {{ isTaker(deal) ? 'Вы' : deal.taker_id?.first_name || 'Покупатель' }}
                  </div>
                  <div class="text-xs text-gray-500">Покупатель</div>
                </div>
                <div class="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ getInitial(deal.taker_id) }}
                </div>
              </div>
            </div>

            <!-- Location -->
            <div v-if="deal.offer_id?.district" class="mt-2 flex items-center text-xs text-gray-600">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              {{ getDistrictName(deal.offer_id.district) }}
            </div>

            <!-- Action Required Badge -->
            <div v-if="needsAction(deal)" class="mt-2">
              <span class="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                ⚡ Требуется действие
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-5xl mb-3">{{ getEmptyIcon() }}</div>
        <div class="text-lg font-semibold text-gray-700 mb-2">
          {{ getEmptyTitle() }}
        </div>
        <p class="text-sm text-gray-500 mb-4">
          {{ getEmptyDescription() }}
        </p>
        <router-link 
          to="/offers" 
          class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
          </svg>
          Смотреть предложения
        </router-link>
      </div>
    </div>
    
    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDealsStore } from '@/stores/deals';
import { useAuthStore } from '@/stores/auth';
import BottomNav from '@/components/BottomNav.vue';

const router = useRouter();
const dealsStore = useDealsStore();
const authStore = useAuthStore();

const loading = ref(true);
const activeTab = ref('all');

const tabs = computed(() => {
  const counts = {
    all: dealsStore.deals.length,
    pending: dealsStore.deals.filter(d => d.status === 'pending').length,
    active: dealsStore.deals.filter(d => d.status === 'accepted').length,
    completed: dealsStore.deals.filter(d => d.status === 'completed').length
  };

  return [
    { key: 'all', label: 'Все', count: counts.all },
    { key: 'pending', label: 'Ожидание', count: counts.pending },
    { key: 'active', label: 'Активные', count: counts.active },
    { key: 'completed', label: 'Завершены', count: counts.completed }
  ];
});

const filteredDeals = computed(() => {
  let deals = [...dealsStore.deals];
  
  // Filter by status
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'active') {
      deals = deals.filter(d => d.status === 'accepted');
    } else {
      deals = deals.filter(d => d.status === activeTab.value);
    }
  }

  // Sort by date (newest first)
  deals.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at);
    const dateB = new Date(b.createdAt || b.created_at);
    return dateB - dateA;
  });

  return deals;
});

onMounted(async () => {
  try {
    await dealsStore.fetchMyDeals();
  } finally {
    loading.value = false;
  }
});

// Refresh deals when tab changes
watch(activeTab, async () => {
  loading.value = true;
  try {
    const statusFilter = activeTab.value === 'all' ? undefined : 
                        activeTab.value === 'active' ? 'accepted' : activeTab.value;
    await dealsStore.fetchMyDeals(statusFilter);
  } finally {
    loading.value = false;
  }
});

function openDeal(dealId) {
  router.push(`/deals/${dealId}`);
}

function isMaker(deal) {
  if (!authStore.user) return false;
  const userId = authStore.user._id || authStore.user.id;
  const makerId = deal.maker_id?._id || deal.maker_id?.id || deal.maker_id;
  return userId === makerId;
}

function isTaker(deal) {
  if (!authStore.user) return false;
  const userId = authStore.user._id || authStore.user.id;
  const takerId = deal.taker_id?._id || deal.taker_id?.id || deal.taker_id;
  return userId === takerId;
}

function needsAction(deal) {
  // Maker needs to accept/reject pending deal
  if (deal.status === 'pending' && isMaker(deal)) return true;
  // Both parties need to confirm completed deal
  if (deal.status === 'accepted') return true;
  return false;
}

function getInitial(user) {
  if (!user) return '?';
  return (user.first_name || user.username || '?')[0].toUpperCase();
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

function getStatusBarClass(status) {
  const classes = {
    pending: 'bg-gradient-to-r from-yellow-400 to-orange-400',
    accepted: 'bg-gradient-to-r from-blue-400 to-indigo-400',
    completed: 'bg-gradient-to-r from-green-400 to-emerald-400',
    cancelled: 'bg-gradient-to-r from-red-400 to-pink-400',
    disputed: 'bg-gradient-to-r from-orange-400 to-red-400'
  };
  return classes[status] || '';
}

function getStatusText(status) {
  const texts = {
    pending: '⏳ Ожидание',
    accepted: '🤝 Принята',
    completed: '✅ Завершена',
    cancelled: '❌ Отменена',
    disputed: '⚠️ Спорная'
  };
  return texts[status] || status;
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

function getEmptyIcon() {
  if (activeTab.value === 'pending') return '⏳';
  if (activeTab.value === 'active') return '🤝';
  if (activeTab.value === 'completed') return '✅';
  return '📋';
}

function getEmptyTitle() {
  if (activeTab.value === 'pending') return 'Нет ожидающих сделок';
  if (activeTab.value === 'active') return 'Нет активных сделок';
  if (activeTab.value === 'completed') return 'Нет завершенных сделок';
  return 'У вас пока нет сделок';
}

function getEmptyDescription() {
  if (activeTab.value === 'pending') return 'Здесь появятся сделки, ожидающие подтверждения';
  if (activeTab.value === 'active') return 'Здесь появятся принятые сделки';
  if (activeTab.value === 'completed') return 'Здесь появятся завершенные сделки';
  return 'Начните с просмотра доступных предложений';
}
</script>