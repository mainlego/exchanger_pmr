import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export const useOffersStore = defineStore('offers', () => {
  const offers = ref([]);
  const loading = ref(false);
  const filters = ref({
    type: '',
    currency_from: '',
    currency_to: '',
    district: '',
    min_amount: '',
    max_amount: '',
    sort: 'created_at',
    order: 'DESC'
  });
  
  const activeOffers = computed(() => 
    offers.value.filter(offer => offer.is_active)
  );
  
  async function fetchOffers() {
    loading.value = true;
    try {
      const params = Object.entries(filters.value)
        .filter(([_, value]) => value)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      const response = await api.get('/offers', { params });
      // Normalize MongoDB _id to id
      offers.value = response.data.map(offer => ({
        ...offer,
        id: offer._id || offer.id
      }));
    } catch (error) {
      console.error('Fetch offers error:', error);
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchOffer(id) {
    try {
      const response = await api.get(`/offers/${id}`);
      // Normalize MongoDB _id to id
      if (response.data) {
        return {
          ...response.data,
          id: response.data._id || response.data.id
        };
      }
      return response.data;
    } catch (error) {
      console.error('Fetch offer error:', error);
      return null;
    }
  }
  
  async function createOffer(offerData) {
    try {
      console.log('Creating offer with data:', offerData);
      const response = await api.post('/offers', offerData);
      console.log('Offer created:', response.data);
      
      // Normalize MongoDB _id to id
      const normalizedOffer = response.data ? {
        ...response.data,
        id: response.data._id || response.data.id
      } : response.data;
      
      // Add to local store
      if (normalizedOffer) {
        offers.value.unshift(normalizedOffer);
      }
      
      return normalizedOffer;
    } catch (error) {
      console.error('Create offer error:', error.response?.data || error);
      throw error;
    }
  }
  
  async function updateOffer(id, updates) {
    try {
      const response = await api.put(`/offers/${id}`, updates);
      const normalizedOffer = response.data ? {
        ...response.data,
        id: response.data._id || response.data.id
      } : response.data;
      
      const index = offers.value.findIndex(o => (o.id === id || o._id === id));
      if (index !== -1) {
        offers.value[index] = normalizedOffer;
      }
      return normalizedOffer;
    } catch (error) {
      console.error('Update offer error:', error);
      throw error;
    }
  }
  
  async function deleteOffer(id) {
    try {
      await api.delete(`/offers/${id}`);
      const index = offers.value.findIndex(o => (o.id === id || o._id === id));
      if (index !== -1) {
        offers.value[index].is_active = false;
      }
    } catch (error) {
      console.error('Delete offer error:', error);
      throw error;
    }
  }
  
  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters };
    fetchOffers();
  }
  
  function resetFilters() {
    filters.value = {
      type: '',
      currency_from: '',
      currency_to: '',
      district: '',
      min_amount: '',
      max_amount: '',
      sort: 'created_at',
      order: 'DESC'
    };
    fetchOffers();
  }
  
  // WebSocket handlers
  function handleNewOffer(offer) {
    const normalizedOffer = {
      ...offer,
      id: offer._id || offer.id
    };
    offers.value.unshift(normalizedOffer);
  }
  
  function handleOfferUpdate(offer) {
    const normalizedOffer = {
      ...offer,
      id: offer._id || offer.id
    };
    const index = offers.value.findIndex(o => (o.id === normalizedOffer.id || o._id === normalizedOffer.id));
    if (index !== -1) {
      offers.value[index] = normalizedOffer;
    }
  }
  
  return {
    offers,
    loading,
    filters,
    activeOffers,
    fetchOffers,
    fetchOffer,
    createOffer,
    updateOffer,
    deleteOffer,
    updateFilters,
    resetFilters,
    handleNewOffer,
    handleOfferUpdate
  };
});