<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Input from '../atoms/Inputs/Input.vue'
import PnlSliderChart from './PnlSliderChart.vue'
import PnlDifferentiatorChart from './PnlDifferentiatorChart.vue'

const trades = ref([])

const commonBoxClass = "px-[24px] py-[15px] bg-gray-900 rounded-[6px] border-[1px] border-gray-850"

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

  <h1 class="text-3xl font-bold mb-8">PnL Curve Report</h1>
  <div :class=[commonBoxClass]>
    <div class="">
      <div class="w-[150px]">
        <Input label="Session ID" type="text" value="" :onChange="() => { }" />

          
      </div>
    </div>

  </div>
  <!-- <PnlSliderChart :trades="trades" /> -->
  <!-- <div>
   
  </div>
  <div>
    <PnlDifferentiatorChart :trades="trades"/>
    
  </div> -->
</template>