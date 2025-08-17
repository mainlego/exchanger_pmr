<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center">
        <button @click="$router.back()" class="mr-3">← Назад</button>
        <h1 class="text-xl font-bold">Детали предложения</h1>
      </div>
    </header>
    
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div v-if="loading" class="text-center py-8">Загрузка...</div>
      <div v-else-if="!offer" class="text-center py-8">Предложение не найдено</div>
      <div v-else class="space-y-4">
        <!-- Offer details will be implemented -->
        <div class="card">
          <pre>{{ JSON.stringify(offer, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOffersStore } from '@/stores/offers';

const route = useRoute();
const offersStore = useOffersStore();

const offer = ref(null);
const loading = ref(true);

onMounted(async () => {
  offer.value = await offersStore.fetchOffer(route.params.id);
  loading.value = false;
});
</script>