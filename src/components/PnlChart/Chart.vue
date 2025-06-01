<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Input from '../../atoms/Inputs/Input.vue'
import PnlSliderChart from './PnlSliderChart.vue'
import PnlDifferentiatorChart from './PnlDifferentiatorChart.vue'
import PnlWinRateChart from './PnlWinRateChart.vue'
import Modal from '../Modal/Modal.vue'
import { tabGroupClasses, buttonClasses } from './commonCssClasses'
import { useModal } from '../../composables/useModal'

const trades = ref([])
const totalResponse = ref(null)
const maePercentage = ref(0)
const activeTab = ref('slider')
const isLoading = ref(false)

// Modal state
const { isOpen: isCumulativePnlModalOpen, open: openCumulativePnlModal, close: closeCumulativePnlModal } = useModal()

const commonBoxClass = "px-[24px] py-[15px] bg-gray-900 rounded-[6px] border-[1px] border-gray-850 max-w-[300px]"


const handleMaePercentageChange = (newValue) => {
  console.log('MAE Percentage changed:', newValue)
  const numericValue = typeof newValue === 'string' ? parseFloat(newValue) : newValue
  if (isNaN(numericValue) || numericValue < 0) {
    console.warn('Invalid MAE percentage value:', newValue)
    return
  }
  maePercentage.value = numericValue
}

onMounted(async () => {
  isLoading.value = true
  try {
    const response = await axios.get('https://us-central1-tradestream-cloud.cloudfunctions.net/stoploss-optimizooor', {
      params: {
        uid: 'test_data',
        session_id: 'session12394',
      }
    })

    if (response && response.data) {
      const safeJson = response.data.replace(/\bNaN\b/g, 'null');
      const parsed = JSON.parse(safeJson);
      console.log("parsed", parsed)
      trades.value = (parsed?.data?.trades || []).map((val) => {
        return {
          ...val,
          mae_percent: val?.mae_percent * 100
        }
      })
      totalResponse.value = parsed?.data || null
      const index = totalResponse.value.ev_by_mae.findIndex(m =>
        Math.abs(m - parsed?.data?.optimal_stop?.improved_ev) < 0.0001
      );
      maePercentage.value = totalResponse.value.mae_levels[index] * 100

    } else {
      console.error('Invalid response:', response);
    }
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    isLoading.value = false
  }
})

const retrunColorCodedValue = (number) => {
  if (!number && number !== 0) return '<span class="text-gray-400">$0</span>'

  if (number > 0) {
    return `<span class="text-green-500">+ $${number.toFixed(2)}</span>`
  } else {
    return `<span class="text-red-500">- $${Math.abs(number).toFixed(2)}</span>`
  }
}

const currentValue = computed(() => {
  const maePercentageValue = maePercentage.value / 100
  console.log("maePercentageValue", maePercentageValue)

  if (!totalResponse.value?.mae_levels || !totalResponse.value?.ev_by_mae) {
    return 0;
  }

  // Find closest match using small tolerance for floating point comparison
  const tolerance = 0.0001
  const index = totalResponse.value.mae_levels.findIndex(m =>
    Math.abs(m - maePercentageValue) < tolerance
  );

  console.log("index", index)
  if (index === -1) {
    return 0; // or handle case when exact match not found
  }

  return totalResponse.value.ev_by_mae[index] || 0;
})
</script>

<template>
  <div class="">
    <h1 class="xl:text-5xl text-3xl leading-[52px] tracking-[-1.5px] font-semibold mb-[36px]">Stoploss Optimizer</h1>

    <PnlSliderChart :trades="trades" v-model:maePercentage="maePercentage" :isCumulativeView="false" />
    
  </div>
</template>