import { ref } from 'vue';
import { io } from 'socket.io-client';
import { useOffersStore } from '@/stores/offers';

let socket = null;
const connected = ref(false);

export function useWebSocket() {
  const offersStore = useOffersStore();
  
  function connect() {
    if (socket) return;
    
    // Determine WebSocket URL based on environment
    const wsUrl = window.location.hostname !== 'localhost' 
      ? 'https://p2p-exchange-api.onrender.com'
      : '/';
    
    socket = io(wsUrl, {
      transports: ['websocket'],
      upgrade: false
    });
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
      connected.value = true;
      
      // Subscribe to offers updates
      socket.emit('subscribe:offers');
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      connected.value = false;
    });
    
    // Listen for new offers
    socket.on('new_offer', (offer) => {
      offersStore.handleNewOffer(offer);
    });
    
    // Listen for offer updates
    socket.on('offer_updated', (offer) => {
      offersStore.handleOfferUpdate(offer);
    });
    
    // Listen for new deals
    socket.on('new_deal', (deal) => {
      // Show notification
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('У вас новая сделка!');
      }
    });
    
    // Listen for deal status changes
    socket.on('deal_status_changed', (data) => {
      // Update local state or show notification
      console.log('Deal status changed:', data);
    });
    
    // Listen for new reviews
    socket.on('new_review', (review) => {
      // Show notification
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('У вас новый отзыв!');
      }
    });
  }
  
  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      connected.value = false;
    }
  }
  
  function subscribeToUserEvents(userId) {
    if (socket) {
      socket.emit('subscribe:user', userId);
    }
  }
  
  function subscribeToCurrency(currency) {
    if (socket) {
      socket.emit('subscribe:currency', currency);
    }
  }
  
  return {
    connected,
    connect,
    disconnect,
    subscribeToUserEvents,
    subscribeToCurrency
  };
}