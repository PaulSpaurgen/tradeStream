import { createApp } from 'vue'
import HighchartsVue from "highcharts-vue"
import 'highcharts/modules/annotations'
import 'highcharts/highcharts-more'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(HighchartsVue)
app.use(router)
app.mount('#app')
