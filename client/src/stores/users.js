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
      console.log('fetchUser called with userId:', userId, 'type:', typeof userId);
      
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
          console.log('User found in cache:', userId);
          return this.users[userId];
        }

        // Fetch from API
        console.log('Fetching user from API:', `/users/${userId}`);
        const response = await api.get(`/users/${userId}`);
        const user = response.data;
        
        console.log('User fetched successfully:', user);
        
        // Cache the user
        this.users[userId] = user;
        
        return user;
      } catch (error) {
        console.error('Error fetching user:', error);
        console.error('Error response:', error.response);
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