import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token'));
  
  const isAuthenticated = computed(() => !!token.value);
  
  async function loginWithTelegram(initData) {
    try {
      const response = await api.post('/auth/telegram', { initData });
      const { token: newToken, user: userData } = response.data;
      
      token.value = newToken;
      user.value = userData;
      
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }
  
  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
  
  async function fetchProfile() {
    if (!isAuthenticated.value) return;
    
    try {
      const response = await api.get('/users/me');
      user.value = response.data;
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  }
  
  // Initialize token if exists
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    fetchProfile();
  }
  
  return {
    user,
    token,
    isAuthenticated,
    loginWithTelegram,
    logout,
    fetchProfile
  };
});