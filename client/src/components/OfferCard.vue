<template>
  <router-link 
    :to="`/offers/${offer.id}`"
    class="card block hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Type Badge -->
        <span :class="typeBadgeClass" class="badge mb-2">
          {{ offer.type === 'buy' ? 'Покупка' : 'Продажа' }}
        </span>
        
        <!-- Currencies and Amount -->
        <div class="font-semibold text-lg">
          {{ formatAmount(offer.amount_from) }} {{ offer.currency_from }}
          → {{ formatAmount(offer.amount_to) }} {{ offer.currency_to }}
        </div>
        
        <!-- Rate -->
        <div class="text-sm text-gray-600 mt-1">
          Курс: {{ offer.rate }} {{ offer.currency_to }}/{{ offer.currency_from }}
        </div>
        
        <!-- Location -->
        <div class="text-sm text-gray-600 mt-1">
          📍 {{ getDistrictName(offer.district) }}
          <span v-if="offer.location" class="text-gray-500">• {{ offer.location }}</span>
        </div>
        
        <!-- User Info -->
        <div class="flex items-center mt-2 text-sm">
          <span class="font-medium">{{ offer.first_name || offer.username }}</span>
          <span class="mx-2">⭐ {{ offer.rating || 0 }}</span>
          <span class="text-gray-500">({{ offer.deals_count || 0 }} сделок)</span>
          <span v-if="offer.is_verified" class="ml-2 text-blue-600">✓</span>
        </div>
      </div>
      
      <!-- Time -->
      <div class="text-sm text-gray-500">
        {{ formatTime(offer.created_at) }}
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  offer: {
    type: Object,
    required: true
  }
});

const typeBadgeClass = computed(() => {
  return props.offer.type === 'buy' ? 'badge-success' : 'badge-warning';
});

function formatAmount(amount) {
  return new Intl.NumberFormat('ru-RU').format(amount);
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

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'только что';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч`;
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)} д`;
  
  return date.toLocaleDateString('ru-RU');
}
</script>