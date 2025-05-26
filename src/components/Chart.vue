<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Input from '../atoms/Inputs/Input.vue'
import PnlSliderChart from './PnlSliderChart.vue'
import PnlDifferentiatorChart from './PnlDifferentiatorChart.vue'
import { tabGroupClasses } from './commonCssClasses'

const trades = ref([])
const maePercentage = ref(0)
const activeTab = ref('slider')

const commonBoxClass = "px-[24px] py-[15px] bg-gray-900 rounded-[6px] border-[1px] border-gray-850 max-w-[300px]"


const handleMaePercentageChange = (newValue) => {
  console.log('MAE Percentage changed:', newValue)
  
  // Convert to number if it's a string
  const numericValue = typeof newValue === 'string' ? parseFloat(newValue) : newValue
  
  // Add validation if needed
  if (isNaN(numericValue) || numericValue < 0) {
    console.warn('Invalid MAE percentage value:', newValue)
    return
  }
  
  // Update the value
  maePercentage.value = numericValue
  
  // Add any additional logic here
  // For example: trigger calculations, API calls, etc.
}

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
  <div class="flex gap-4">

    <div :class=[commonBoxClass]>
      <!--  -->
      <div class="text-gray-100 text-md font-semibold mb-4">Stoploss Distance</div>

      <Input 
        label="maePercentage%" 
        type="number" 
        inputClass="w-[150px] text-3xl font-semibold" 
        :modelValue="maePercentage"
        @update:modelValue="handleMaePercentageChange"
      />
      <!-- <p class="text-gray-500 text-xs mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> -->

    </div>

    <div :class=[commonBoxClass]>
      <!--  -->
      <div class="text-gray-100 text-md font-semibold mb-4">Current Value</div>
        
      <p class="text-3xl font-semibold">+ $800</p>
      <p class="text-gray-500 text-xs mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

    </div>

    <div :class=[commonBoxClass]>
      <!--  -->
      <div class="text-gray-100 text-md font-semibold mb-4">Expected Value</div>
      <p class="text-3xl font-semibold">+ $800</p>
      <p class="text-gray-500 text-xs mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

    </div>

  </div>
  <div class="mt-4 mb-4 bg-gray-900 rounded-[6px] border-[1px] border-gray-850 p-[24px] ">
    <div :class=[tabGroupClasses.parentTabGroupClass]>
      <button 
        @click="activeTab = 'slider'"
        :class="[
          tabGroupClasses.commonTabClass,
          activeTab === 'slider' 
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]"
      >
        PnL Slider
        
      </button>
      <button
        @click="activeTab = 'differentiator'"
        :class="[
          tabGroupClasses.commonTabClass,
          activeTab === 'differentiator'
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]"
      >
        PnL Differentiator
      </button>
      <button
        @click="activeTab = 'distribution'"
        :class="[
          tabGroupClasses.commonTabClass,
          activeTab === 'distribution'
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]"
      >
        Distribution
      </button>
    </div>

    <div class="mt-4">
      <div v-show="activeTab === 'slider'">
        <PnlSliderChart :trades="trades" v-model:maePercentage="maePercentage" />
         <!-- <p>Pnl Slider</p> -->
      </div>
      <div v-show="activeTab === 'differentiator'">
        <!-- <PnlDifferentiatorChart :trades="trades" /> -->
        <p>Pnl Differentiator</p>
      </div>
      <div v-show="activeTab === 'distribution'">
        <!-- <DistributionChart :trades="trades" /> -->
        <p>Distribution</p>
    </div>
    </div>
  </div>
  <!-- -->
  <!-- <div>

  </div>
  <div>
    <PnlDifferentiatorChart :trades="trades"/>
    
  </div> -->
</template>