import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/exchange',
    name: 'exchange',
    component: () => import('@/views/ExchangePage.vue')
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryPage.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router