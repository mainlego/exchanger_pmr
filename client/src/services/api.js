import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // In production, use the actual API URL
  if (window.location.hostname !== 'localhost') {
    const url = 'https://p2p-exchange-api.onrender.com/api';
    console.log('Using production API URL:', url);
    return url;
  }
  // In development, use proxy
  console.log('Using development API URL: /api');
  return '/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;