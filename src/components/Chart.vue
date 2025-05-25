<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import PnlSliderChart from './PnlSliderChart.vue'
import PnlDifferentiatorChart from './PnlDifferentiatorChart.vue'

const trades = ref([])

onMounted(async () => {
  try {
    const response = await axios.get('https://us-central1-tradestream-cloud.cloudfunctions.net/stoploss-optimizooor', {
      params: {
        uid: 'test_data',
        session_id: 'session12394'
      }
    })

    if (response && response.data) {
      const safeJson = response.data.replace(/\bNaN\b/g, 'null');
      const parsed = JSON.parse(safeJson);
      console.log({ parsed })
      trades.value = parsed?.data?.trades || []
    } else {
      console.error('Invalid response:', response);
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>

<template>
  <div>
    <PnlSliderChart :trades="trades" />
  </div>
  <div>
    <PnlDifferentiatorChart :trades="trades"/>
    
  </div>
</template>