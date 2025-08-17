<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center">
        <button @click="$router.back()" class="mr-3">← Назад</button>
        <h1 class="text-xl font-bold">Избранное</h1>
      </div>
    </header>
    
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="text-center py-8 text-gray-500">
        Избранные пользователи будут здесь
      </div>
    </div>
  </div>
</template>

<script setup>
</script>