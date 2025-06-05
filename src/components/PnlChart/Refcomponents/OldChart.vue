<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Input from '../../atoms/Inputs/Input.vue'
import PnlSliderChart from './PnlSliderChart.vue'
import PnlDifferentiatorChart from './PnlDifferentiatorChart.vue'
import PnlWinRateChart from './PnlWinRateChart.vue'
import { tabGroupClasses, buttonClasses, boxClasses } from '../commonCssClasses'
import { stoplossService } from '../../../services/stoplossService'
import { chartDescriptions } from '../PnlChartUtils'

const trades = ref([])
const totalResponse = ref(null)

const maePercentage = ref(6.4)
const activeTab = ref('slider')
const isLoading = ref(false)

const currentTotalProfit = ref(0)
const currentEVperTrade = ref(0)
const newTotalProfit = ref(0)
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
  const response = await stoplossService.getStoplossData()
  trades.value = response.data.trades
  totalResponse.value = response.data
  isLoading.value = false

  calculateTotalValue()
})

watch(maePercentage, () => {
  calculateTotalValue()

})


const calculateTotalValue = () => {
  currentTotalProfit.value = calculateTotalProfit(trades.value)
  currentEVperTrade.value = calculateProfitPerTrade(trades.value)
  newTotalProfit.value = calculateTotalProfit(tradesWithStoploss.value)
  newEVperTrade.value = calculateProfitPerTrade(tradesWithStoploss.value)
}



const calculateTotalProfit = (trades) => {
  return trades.reduce((acc, trade) => acc + trade.pnl_usd, 0)
}

const calculateProfitPerTrade = (trades) => {
  return trades.reduce((acc, trade) => acc + trade.pnl_usd, 0) / trades.length
}



const tradesWithStoploss = computed(() => {
  return trades.value.map((trade) => {
    if (trade.mae_percent <= maePercentage.value / 100) {
      return trade;
    } else {
      const pnl_without_fees = trade.pnl_usd - trade.fees;
      const new_pnl =
        Math.abs(pnl_without_fees * (maePercentage.value / 100 / trade.mae_percent)) +
        trade.fees;

      return {
        ...trade,
        pnl_usd: new_pnl,
      };
    }
  });
});

const retrunColorCodedValue = (number) => {
  if (!number && number !== 0) return '<span class="text-gray-400">$0</span>'

  if (number > 0) {
    return `<span class="text-primary-500 text-2xl font-semibold"> $${number.toFixed(2)}</span>`
  } else {
    return `<span class="text-red-500 text-2xl font-semibold">- $${Math.abs(number).toFixed(2)}</span>`
  }
}
</script>

<template>

  <h1 class="xl:text-5xl text-3xl leading-[52px] tracking-[-1.5px] font-semibold mb-[36px]">Stoploss Optimizer</h1>
  <div class="flex gap-4 w-full">
    <div class="flex-grow">
      <div :class="[boxClasses.boxClass, 'w-full']">
        <div class="h-[60vh]">
          <div v-if="activeTab === 'slider'">
            <PnlSliderChart :trades="trades" v-model:maePercentage="maePercentage"  />
          </div>
          <div v-if="activeTab === 'differentiator'">
            <PnlDifferentiatorChart :trades="trades" v-model:maePercentage="maePercentage" :currentTotalProfit="currentTotalProfit" :newTotalProfit="newTotalProfit" />
          </div>
          <div v-if="activeTab === 'distribution'">
            <PnlWinRateChart :response="totalResponse" v-model:maePercentage="maePercentage" />
          </div>
        </div>


        <div :class="[tabGroupClasses.parentTabGroupClass, 'mt-8']">
          <button @click="activeTab = 'slider'" :class="[
            'w-full',
            tabGroupClasses.commonTabClass,
            activeTab === 'slider'
              ? tabGroupClasses.selectedTabClass
              : tabGroupClasses.unselectedTabClass
          ]">
            Stoploss Distribution

          </button>
          <button @click="activeTab = 'differentiator'" :class="[
            'w-full',
            tabGroupClasses.commonTabClass,
            activeTab === 'differentiator'
              ? tabGroupClasses.selectedTabClass
              : tabGroupClasses.unselectedTabClass
          ]">
            PnL Comparison
          </button>
          <button @click="activeTab = 'distribution'" :class="[
            'w-full',
            tabGroupClasses.commonTabClass,
            activeTab === 'distribution'
              ? tabGroupClasses.selectedTabClass
              : tabGroupClasses.unselectedTabClass
          ]">
            Trade Risk Analysis
          </button>
        </div>

      </div>
    </div>
    <div :class="[boxClasses.boxClass, 'max-w-[400px] h-fit flex flex-col gap-4']">
      <h3 class=" text-lg font-semibold ">Insights</h3>
      <Transition mode="out-in" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0"
        enter-active-class="transition-all duration-300 ease-in" leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1" leave-active-class="transition-all duration-300 ease-out">
        <p class="text-gray-400 text-sm mb-[10px] min-h-[60px]" :key="activeTab">
          {{ chartDescriptions[activeTab] }}
        </p>
      </Transition>
      <div :class="[boxClasses.smallBoxClass, 'mb-[10px]']">
        <h3 class="text-white-800 text-md mb-[10px] font-semibold">Current Expected Values</h3>
        <div class="flex justify-between">
          <div>
            <h3 class="text-gray-400 text-sm mb-[10px]">Profit per trade</h3>
            <h3 class=" " v-html="retrunColorCodedValue(currentEVperTrade)" />
          </div>
          <div>
            <h3 class="text-gray-400 text-sm mb-[10px]">Total Profit</h3>
            <h3 class="" v-html="retrunColorCodedValue(currentTotalProfit)" />
          </div>
          <div>

          </div>
        </div>
      </div>
      <div :class="[boxClasses.smallBoxClass, 'mb-[10px]']">
        <h3 class="text-white-800 text-md mb-[10px] font-semibold">Expected Value after
          implementing new
          stoploss:</h3>
        <div class="flex justify-between">
          <div>
            <h3 class="text-gray-400 text-sm mb-[10px]">Profit per trade</h3>
            <h3 class=" " v-html="retrunColorCodedValue(newEVperTrade)" />
          </div>
          <div>
            <h3 class="text-gray-400 text-sm mb-[10px]">Total Profit</h3>
            <h3 class="" v-html="retrunColorCodedValue(newTotalProfit)" />
          </div>
          <div>

          </div>
        </div>
      </div>
      <div :class="[boxClasses.smallBoxClass, 'mb-[10px]']">
        <h3 class="text-gray-400 text-sm mb-[10px]">Stoploss Distance (%) :</h3>
        <!-- <h3 class="text-white-800 text-lg font-semibold mb-[16px]">asdasdsad</h3> -->
        <Input label="" type="number" inputClass="w-[150px] text-3xl font-semibold" :modelValue="maePercentage"
          @update:modelValue="handleMaePercentageChange" />
      </div>
    </div>


  </div>
</template>