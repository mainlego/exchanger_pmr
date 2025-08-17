<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center">
        <button @click="$router.back()" class="mr-3">
          ← Назад
        </button>
        <h1 class="text-xl font-bold">Создать предложение</h1>
      </div>
    </header>

    <!-- Form -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Type -->
        <div class="card">
          <label class="block text-sm font-medium mb-2">Тип операции</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="form.type = 'buy'"
              :class="[
                'py-3 rounded-lg border-2 transition-all',
                form.type === 'buy' 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-300'
              ]"
            >
              Покупка
            </button>
            <button
              type="button"
              @click="form.type = 'sell'"
              :class="[
                'py-3 rounded-lg border-2 transition-all',
                form.type === 'sell' 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-300'
              ]"
            >
              Продажа
            </button>
          </div>
        </div>

        <!-- Currencies -->
        <div class="card">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Отдаю</label>
              <select v-model="form.currency_from" class="input" required>
                <option value="">Выберите</option>
                <option value="RUP">RUP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MDL">MDL</option>
                <option value="UAH">UAH</option>
                <option value="RUB">RUB</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Получаю</label>
              <select v-model="form.currency_to" class="input" required>
                <option value="">Выберите</option>
                <option value="RUP">RUP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MDL">MDL</option>
                <option value="UAH">UAH</option>
                <option value="RUB">RUB</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Amount and Rate -->
        <div class="card">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Сумма</label>
              <input 
                type="number" 
                v-model="form.amount_from" 
                placeholder="1000"
                class="input"
                required
                step="0.01"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Курс</label>
              <input 
                type="number" 
                v-model="form.rate" 
                placeholder="15.5"
                class="input"
                required
                step="0.0001"
              />
            </div>
          </div>
          
          <!-- Calculated Amount -->
          <div v-if="form.amount_from && form.rate" class="mt-3 p-3 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600">Получите:</div>
            <div class="font-semibold text-lg">
              {{ formatAmount(form.amount_from * form.rate) }} {{ form.currency_to }}
            </div>
          </div>
        </div>

        <!-- Limits -->
        <div class="card">
          <label class="block text-sm font-medium mb-2">Лимиты сделки</label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Минимум</label>
              <input 
                type="number" 
                v-model="form.min_amount" 
                :placeholder="form.amount_from * 0.1"
                class="input"
                step="0.01"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Максимум</label>
              <input 
                type="number" 
                v-model="form.max_amount" 
                :placeholder="form.amount_from"
                class="input"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="card">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Район</label>
            <select v-model="form.district" class="input" required>
              <option value="">Выберите район</option>
              <option value="tiraspol">Тирасполь</option>
              <option value="bendery">Бендеры</option>
              <option value="slobodzeya">Слободзея</option>
              <option value="grigoriopol">Григориополь</option>
              <option value="dubossary">Дубоссары</option>
              <option value="rybnitsa">Рыбница</option>
              <option value="kamenka">Каменка</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Место встречи</label>
            <input 
              type="text" 
              v-model="form.location" 
              placeholder="Например: Центр, возле Шерифа"
              class="input"
            />
          </div>
        </div>

        <!-- Comment -->
        <div class="card">
          <label class="block text-sm font-medium mb-1">Комментарий</label>
          <textarea 
            v-model="form.comment" 
            rows="3"
            placeholder="Дополнительная информация..."
            class="input"
          ></textarea>
        </div>

        <!-- Submit -->
        <button 
          type="submit" 
          :disabled="loading"
          class="btn btn-primary w-full"
        >
          {{ loading ? 'Создание...' : 'Создать предложение' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOffersStore } from '@/stores/offers';

const router = useRouter();
const offersStore = useOffersStore();

const loading = ref(false);
const form = ref({
  type: 'sell',
  currency_from: '',
  currency_to: '',
  amount_from: '',
  rate: '',
  min_amount: '',
  max_amount: '',
  district: '',
  location: '',
  comment: ''
});

function formatAmount(amount) {
  return new Intl.NumberFormat('ru-RU').format(amount);
}

async function handleSubmit() {
  loading.value = true;
  
  try {
    const offerData = {
      ...form.value,
      amount_to: form.value.amount_from * form.value.rate,
      min_amount: form.value.min_amount || form.value.amount_from * 0.1,
      max_amount: form.value.max_amount || form.value.amount_from
    };
    
    const offer = await offersStore.createOffer(offerData);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Предложение создано!');
    }
    
    router.push(`/offers/${offer._id || offer.id}`);
  } catch (error) {
    console.error('Create offer error:', error);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Ошибка при создании предложения');
    }
  } finally {
    loading.value = false;
  }
}
</script>