import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize Telegram WebApp
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  
  // Set theme
  document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark');
  
  // Make tg available globally
  app.config.globalProperties.$tg = tg;
}

app.mount('#app');