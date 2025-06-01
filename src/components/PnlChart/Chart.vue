<script setup>
import { ref, onMounted, computed , watch} from 'vue'
import axios from 'axios'
import Input from '../../atoms/Inputs/Input.vue'
import PnlSliderChart from './PnlSliderChart.vue'
import PnlDifferentiatorChart from './PnlDifferentiatorChart.vue'
import PnlWinRateChart from './PnlWinRateChart.vue'
import { tabGroupClasses, buttonClasses, boxClasses } from './commonCssClasses'

const trades = ref([])
const totalResponse = ref(null)
const maePercentage = ref(0)
const activeTab = ref('slider')
const isLoading = ref(false)
const currentEVperTrade = ref(0)
const newEVperTrade = ref(0)



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
      currentEVperTrade.value = totalResponse.value.ev_by_mae[index] / totalResponse.value.trades.length

    } else {
      console.error('Invalid response:', response);
    }
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    isLoading.value = false
  }
})

watch(maePercentage, (newVal) => {
  console.log("newVal", newVal)
  const maePercentageValue = newVal / 100
  console.log("maePercentageValue", maePercentageValue)

  if (!totalResponse.value?.mae_levels || !totalResponse.value?.ev_by_mae) {
    return 0;
  }

  const index = totalResponse.value.mae_levels.findIndex(m =>
    Math.abs(m - maePercentageValue) < 0.0001
  );

  newEVperTrade.value = totalResponse.value.ev_by_mae[index] / totalResponse.value.trades.length
  console.log("newEVperTrade", newEVperTrade.value)



})

const retrunColorCodedValue = (number) => {
  if (!number && number !== 0) return '<span class="text-gray-400">$0</span>'

  if (number > 0) {
    return `<span class="text-green-500 text-3xl">+ $${number.toFixed(2)}</span>`
  } else {
    return `<span class="text-red-500 text-3xl">- $${Math.abs(number).toFixed(2)}</span>`
  }
}
</script>

<template>

  <h1 class="xl:text-5xl text-3xl leading-[52px] tracking-[-1.5px] font-semibold mb-[36px]">Stoploss Optimizer</h1>
  <div class="flex gap-4 w-full">
    <div class="flex-grow">
      <div :class="[boxClasses.boxClass]">
        <PnlSliderChart :trades="trades" v-model:maePercentage="maePercentage" :isCumulativeView="false" />
        
      </div>
    </div>
    <div :class="[boxClasses.boxClass, 'w-[300px] h-auto flex flex-col justify-between']">
      <h3 class=" text-lg font-semibold ">Value Insights</h3>
      <p class="text-gray-400 text-sm mb-[10px]">
        With this chart you can
        test out what stoploss
        would be ideal in order
        to minimize losses and
        maximize wins.
      </p>
      <div :class="[boxClasses.smallBoxClass, 'mb-[10px]']">
        <h3 class="text-gray-400 text-sm mb-[10px]">Current Expected Value per trade</h3>
        <h3 class="text-white-800 text-lg font-semibold mb-[16px]" v-html="retrunColorCodedValue(currentEVperTrade)"/>
      </div>
      <div :class="[boxClasses.smallBoxClass, 'mb-[10px]']">
        <h3 class="text-gray-400 text-sm mb-[10px]">Expected Value after
          implementing new
          stoploss:</h3>
        <h3 class="text-white-800 text-lg font-semibold mb-[16px]" v-html="retrunColorCodedValue(newEVperTrade)"/>
      </div>
      <div :class="[boxClasses.smallBoxClass, 'mb-[10px]']">
        <h3 class="text-gray-400 text-sm mb-[10px]">Stoploss Distance (%) :</h3>
        <!-- <h3 class="text-white-800 text-lg font-semibold mb-[16px]">asdasdsad</h3> -->
        <Input label="" type="number" inputClass="w-[150px] text-3xl font-semibold"
        :modelValue="maePercentage" @update:modelValue="handleMaePercentageChange" />
      </div>
    </div>


  </div>
</template>