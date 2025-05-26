<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    trades: {
        type: Array,
        required: true,
        default: () => []
    },
    maePercentage: {
        type: Number,
        default: 0.04
    }
})

const chartOptions = ref({
    chart: {
        type: 'line'
    },
    title: {
        text: 'P&L Differentiator Chart'
    },
    xAxis: {
        type: 'linear',
        tickAmount: 10,
    },
    yAxis: {
        title: { text: 'P&L' }
    },
    series: []
})



// Watch for changes in trades prop
watch(() => props.trades, (newTrades) => {
    if (newTrades && newTrades.length > 0) {
        updateChartConfigData()
    }
}, { immediate: true })

// Watch for changes in maePercentage
// watch(() => props.maePercentage, () => {
//   if (props.trades && props.trades.length > 0) {
//     updateChartConfigData()
//   }
// }, { immediate: true })

const updateChartConfigData = () => {
    // Create data pairs for both percentage and USD series
    const xRange = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER
    }
    const usdDataWithMae = props.trades.map((val) => {
        let usdValue = val?.pnl_usd
        if (val?.mae_percent > props.maePercentage) {
            const pnl_without_fees = val?.pnl_usd - val?.fees
            const updated_pnl = (Math.abs(pnl_without_fees) * (props.maePercentage / val?.mae_percent)) + val?.fees
            usdValue = updated_pnl
        }
        return [val?.timestamp, usdValue]
    })
    const usdDataWithoutMae = props.trades.map((val) => {
        if (val?.timestamp) {
            xRange.min = Math.min(xRange.min, val.timestamp);
            xRange.max = Math.max(xRange.max, val.timestamp);
        }
        return [val?.timestamp, val?.pnl_usd]
    })

    console.log({usdDataWithMae, xRange, firstTrade: props.trades[0]})

    chartOptions.value = {
        ...chartOptions.value,
        xAxis: {
            ...chartOptions.value.xAxis,
            type: 'datetime',
            min: xRange.min,
            max: xRange.max 
        },
        series: [
            {
                name: 'P&L $',
                data: usdDataWithoutMae,
            },
            {
                name: 'with mae%',
                data: usdDataWithMae,
            }
        ]
    }
}
</script>

<template>
    <div>
        <highcharts :options="chartOptions" id="pnl-differentiator-chart"></highcharts>
    </div>
</template>