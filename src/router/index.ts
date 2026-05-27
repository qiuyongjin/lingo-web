import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'read',
      component: () => import('@/views/read/index.vue'),
    },
    {
      path: '/select',
      name: 'select',
      component: () => import('@/views/select/index.vue'),
    },
  ],
})

export default router
