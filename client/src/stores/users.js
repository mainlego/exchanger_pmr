import { defineStore } from 'pinia';
import api from '@/services/api';

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: {},
    loading: false,
    error: null
  }),

  actions: {
    async fetchUser(userId) {
      if (!userId) {
        console.error('fetchUser: userId is required');
        return null;
      }
      
      // Additional validation
      if (userId === 'undefined' || userId === 'null' || userId === null) {
        console.error('fetchUser: Invalid userId:', userId);
        return null;
      }

      this.loading = true;
      this.error = null;

      try {
        // Check cache first
        if (this.users[userId]) {
          return this.users[userId];
        }

        // Fetch from API
        const url = `/users/${userId}`;
        console.log('Fetching user from:', url, 'with baseURL:', api.defaults.baseURL);
        const response = await api.get(url);
        const user = response.data;
        
        // Cache the user
        this.users[userId] = user;
        
        return user;
      } catch (error) {
        console.error('Error fetching user:', error.message);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error URL:', error.response.config?.url);
          console.error('Full URL:', error.response.config?.baseURL + error.response.config?.url);
        }
        this.error = error.message;
        
        // Return null instead of throwing to prevent component errors
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserByUsername(username) {
      if (!username) {
        console.error('fetchUserByUsername: username is required');
        return null;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/users/username/${username}`);
        const user = response.data;
        
        // Cache the user by ID if available
        if (user._id || user.id) {
          this.users[user._id || user.id] = user;
        }
        
        return user;
      } catch (error) {
        console.error('Error fetching user by username:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },

    clearCache() {
      this.users = {};
    },

    updateUserInCache(userId, updates) {
      if (this.users[userId]) {
        this.users[userId] = {
          ...this.users[userId],
          ...updates
        };
      }
    }
  },

  getters: {
    getUserById: (state) => (userId) => {
      return state.users[userId] || null;
    },

    isLoading: (state) => state.loading,
    
    hasError: (state) => state.error !== null
  }
});