import { createRouter, createWebHistory } from 'vue-router'
import Chart from '../components/PnlChart/Chart.vue'
import NewChart from '../components/PnlChart/NewChart.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Chart
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: NewChart
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
