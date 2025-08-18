import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useDealsStore = defineStore('deals', () => {
  const deals = ref([]);
  const loading = ref(false);
  
  // Normalize MongoDB _id to id
  function normalizeDeal(deal) {
    return {
      ...deal,
      id: deal._id || deal.id
    };
  }
  
  async function fetchDeals(filters = {}) {
    loading.value = true;
    try {
      const response = await api.get('/deals/my', { params: filters });
      deals.value = response.data.map(normalizeDeal);
      return deals.value;
    } catch (error) {
      console.error('Fetch deals error:', error);
      return [];
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchDeal(id) {
    try {
      const response = await api.get(`/deals/${id}`);
      return normalizeDeal(response.data);
    } catch (error) {
      console.error('Fetch deal error:', error);
      return null;
    }
  }
  
  async function createDeal(dealData) {
    try {
      console.log('Creating deal with data:', dealData);
      const response = await api.post('/deals', dealData);
      console.log('Deal created:', response.data);
      
      const normalizedDeal = normalizeDeal(response.data);
      deals.value.unshift(normalizedDeal);
      
      return normalizedDeal;
    } catch (error) {
      console.error('Create deal error:', error.response?.data || error);
      throw error;
    }
  }
  
  async function updateDealStatus(id, status) {
    try {
      const response = await api.patch(`/deals/${id}/status`, { status });
      const normalizedDeal = normalizeDeal(response.data);
      
      const index = deals.value.findIndex(d => d.id === id);
      if (index !== -1) {
        deals.value[index] = normalizedDeal;
      }
      
      return normalizedDeal;
    } catch (error) {
      console.error('Update deal status error:', error);
      throw error;
    }
  }
  
  async function sendMessage(dealId, message) {
    try {
      const response = await api.post(`/deals/${dealId}/messages`, { message });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }
  
  async function fetchMessages(dealId) {
    try {
      const response = await api.get(`/deals/${dealId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Fetch messages error:', error);
      return [];
    }
  }
  
  async function fetchMyDeals(status = null, role = null) {
    loading.value = true;
    try {
      const params = {};
      if (status) params.status = status;
      if (role) params.role = role;
      
      const response = await api.get('/deals/my', { params });
      deals.value = response.data.map(normalizeDeal);
      return deals.value;
    } catch (error) {
      console.error('Fetch my deals error:', error);
      return [];
    } finally {
      loading.value = false;
    }
  }
  
  return {
    deals,
    loading,
    fetchDeals,
    fetchMyDeals,
    fetchDeal,
    createDeal,
    updateDealStatus,
    sendMessage,
    fetchMessages
  };
});