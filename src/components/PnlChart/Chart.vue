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
  } catch (error) {
    console.error('Error fetching data:', error)
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

  <h1 class="text-3xl font-bold mb-8">PnL Curve Report</h1>
  <div class="flex gap-4">

    <div :class=[commonBoxClass]>
      <!--  -->
      <div class="text-gray-100 text-md font-semibold mb-4">Stoploss Distance</div>

      <Input label="maePercentage%" type="number" inputClass="w-[150px] text-3xl font-semibold"
        :modelValue="maePercentage" @update:modelValue="handleMaePercentageChange" />

    </div>

    <div :class=[commonBoxClass]>
      <!--  -->
      <div class="text-gray-100 text-md font-semibold mb-4">Current Value</div>

      <p class="text-3xl font-semibold" v-html="retrunColorCodedValue(currentValue)"></p>
      <p class="text-gray-500 text-xs mt-4">Change the stoploss distance to see the current value</p>

    </div>

    <div :class=[commonBoxClass]>
      <!--  -->
      <div class="text-gray-100 text-md font-semibold mb-4">Expected Value</div>
      <!-- optimal_stop.improved_ev -->
      <p class="text-3xl font-semibold" v-html="retrunColorCodedValue(totalResponse?.optimal_stop?.improved_ev)"></p>

      <p class="text-gray-500 text-xs mt-4">Expected value if the stoploss distance is optimal</p>

    </div>

  </div>
  <div class="mt-4 mb-4 bg-gray-900 rounded-[6px] border-[1px] border-gray-850 p-[24px] ">
    <div class="flex justify-between w-full">
      <div :class=[tabGroupClasses.parentTabGroupClass]>
        <button @click="activeTab = 'slider'" :class="[
          tabGroupClasses.commonTabClass,
          activeTab === 'slider'
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]">
          PnL Slider

        </button>
        <button @click="activeTab = 'differentiator'" :class="[
          tabGroupClasses.commonTabClass,
          activeTab === 'differentiator'
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]">
          PnL Differentiator
        </button>
        <button @click="activeTab = 'distribution'" :class="[
          tabGroupClasses.commonTabClass,
          activeTab === 'distribution'
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]">
          Distribution
        </button>
      </div>
      <button @click="openCumulativePnlModal" :class=[buttonClasses.secondaryButtonClass]> Open Cumulative PnL</button>
    </div>

    <div class="mt-4">
      <div v-if="activeTab === 'slider'">
        <PnlSliderChart :trades="trades" v-model:maePercentage="maePercentage" :isCumulativeView="false" />
      </div>
      <div v-if="activeTab === 'differentiator'">
        <PnlDifferentiatorChart :trades="trades" v-model:maePercentage="maePercentage" />
      </div>
      <div v-if="activeTab === 'distribution'">
        <PnlWinRateChart :response="totalResponse" v-model:maePercentage="maePercentage" />

      </div>
    </div>
  </div>

  <!-- Cumulative PnL Modal -->
  <Modal v-if="isCumulativePnlModalOpen" v-model="isCumulativePnlModalOpen" title="Cumulative PnL Analysis" size="full">
    <div class="w-[100vw] overflow-hidden">
      <div class="flex gap-4 mb-4">

        <div :class="[commonBoxClass]">
          <!--  -->
          <div class="text-gray-100 text-sm font-semibold mb-4">Stoploss Distance</div>

          <Input label="maePercentage%" type="number" inputClass="w-[150px] text-xl font-semibold"
            :modelValue="maePercentage" @update:modelValue="handleMaePercentageChange" />
          <!-- <p class="text-gray-500 text-xs mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> -->

        </div>

        <div :class="[commonBoxClass]">
          <!--  -->
          <div class="text-gray-100 text-sm font-semibold mb-4">Current Value</div>

          <p class="text-xl font-semibold" v-html="retrunColorCodedValue(currentValue)"></p>

        </div>

        <div :class="[commonBoxClass]">
          <div class="text-gray-100 text-sm font-semibold mb-4">Expected Value</div>
          <p class="text-xl font-semibold" v-html="retrunColorCodedValue(totalResponse?.optimal_stop?.improved_ev)"></p>
        </div>

      </div>
    </div>

    <div class="mb-4">
      <PnlSliderChart :trades="trades" v-model:maePercentage="maePercentage" :isCumulativeView="true" />
    </div>
    <div class="">
      <PnlDifferentiatorChart :trades="trades" v-model:maePercentage="maePercentage" :isCumulativeView="true" />
    </div>

  </Modal>
</template>