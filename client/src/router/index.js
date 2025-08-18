import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/offers',
    name: 'Offers',
    component: () => import('@/views/OffersView.vue')
  },
  {
    path: '/offers/create',
    name: 'CreateOffer',
    component: () => import('@/views/CreateOfferView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/offers/:id',
    name: 'OfferDetail',
    component: () => import('@/views/OfferDetailView.vue')
  },
  {
    path: '/deals',
    name: 'Deals',
    component: () => import('@/views/DealsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/deals/create',
    name: 'CreateDeal',
    component: () => import('@/views/CreateDealView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/deals/:id',
    name: 'DealDetail',
    component: () => import('@/views/DealDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfileView.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;