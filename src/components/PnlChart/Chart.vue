<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Input from '../../atoms/Inputs/Input.vue'
import PnlSliderChart from './PnlSliderChart.vue'
import PnlDifferentiatorChart from './PnlDifferentiatorChart.vue'
import PnlWinRateChart from './PnlWinRateChart.vue'
import { boxClasses } from './commonCssClasses'
import { stoplossService } from '../../services/stoplossService'
import { formatLargeNumber } from './PnlChartUtils'
import { chartDescriptions } from './PnlChartUtils'

const trades = ref([])
const totalResponse = ref(null)

const maePercentage = ref(6.4)
const activeTab = ref('slider')
const isLoading = ref(false)

const currentTotalProfit = computed(() => calculateTotalProfit(trades.value))
const currentEVperTrade = computed(() => calculateProfitPerTrade(trades.value))
const newTotalProfit = computed(() => calculateTotalProfit(tradesWithStoploss.value))
const newEVperTrade = computed(() => calculateProfitPerTrade(tradesWithStoploss.value))

const maeRange = ref({
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER
})

const maeRangeValues = computed(() => {
    const range = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER
    }

    trades.value?.forEach(trade => {
        const maePercent = trade.mae_percent * 100
        range.min = Math.min(range.min, maePercent)
        range.max = Math.max(range.max, maePercent)
    })

    return range
})

watch(maeRangeValues, (newRange) => {
    maeRange.value = newRange
}, { immediate: true })


onMounted(async () => {
    isLoading.value = true
    const response = await stoplossService.getStoplossData()
    trades.value = response.data.trades
    totalResponse.value = response.data
    isLoading.value = false
})


const calculateTotalProfit = (trades) => {
    return trades.reduce((acc, trade) => acc + trade.pnl_usd, 0)
}

const calculateProfitPerTrade = (trades) => {
    return trades.length ? trades.reduce((acc, trade) => acc + trade.pnl_usd, 0) / trades.length : 0
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
        return `<span class="text-primary-500 text-2xl font-semibold"> $${formatLargeNumber(number)}</span>`
    } else {
        return `<span class="text-red-500 text-2xl font-semibold">- $${formatLargeNumber(Math.abs(number))}</span>`
    }
}
</script>

<template>
    <h1 class="xl:text-5xl text-3xl leading-[52px] tracking-[-1.5px] font-semibold mb-[36px]">Stoploss Optimizer</h1>
    <div class="flex gap-4">
        <div class="flex-grow">
            <div :class="[boxClasses.boxClass, 'w-full mb-[20px] h-fit']">
                <div>
                    <PnlSliderChart :trades="trades" v-model:maePercentage="maePercentage" :maeRange="maeRange" />

                </div>
            </div>
            <div :class="[boxClasses.boxClass, 'w-full mb-[20px] ']">
                <div>
                    <PnlDifferentiatorChart :trades="trades" :maePercentage="maePercentage"
                        :currentTotalProfit="currentTotalProfit" :newTotalProfit="newTotalProfit" />

                </div>
            </div>
            <div :class="[boxClasses.boxClass, 'w-full mb-[20px]']">
                <div>
                    <PnlWinRateChart :response="totalResponse" v-model:maePercentage="maePercentage" />

                </div>
            </div>
        </div>
        <div :class="[
            boxClasses.boxClass,
            'max-w-[400px] h-fit flex flex-col gap-4 sticky-insights'
        ]">
            <h3 class=" text-lg font-semibold ">Insights</h3>
            <Transition mode="out-in" enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0" enter-active-class="transition-all duration-300 ease-in"
                leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"
                leave-active-class="transition-all duration-300 ease-out">
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
            <div :class="[boxClasses.smallBoxClass, 'mb-[10px] pt-[20px]']">
                <Input label="Stoploss Distance" type="number" inputClass="w-[150px] text-2xl font-semibold" v-model="maePercentage"
                    :min="maeRange.min" :max="maeRange.max" :specialChar=" '%'" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.sticky-insights {
    position: sticky;
    top: 20px;
    align-self: flex-start;
    height: fit-content;
}
</style>