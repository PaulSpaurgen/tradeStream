import { createRouter, createWebHistory } from 'vue-router'
import Chart from '../components/PnlChart/Chart.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Chart
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
