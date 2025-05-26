<script setup>
import { ref, watch } from 'vue'
import { tabGroupClasses } from './commonCssClasses'

const props = defineProps({
    response: {
        type: Object,
        required: true,
        default: () => {}
    },
    maePercentage: {
        type: Number,
        default: 0.04
    },
    isCumulativeView: {
        type: Boolean,
        default: false
    }
})

const isValueByExpectedValue = ref(true)

const chartOptions = ref({
    chart: {
        type: 'line',
        backgroundColor: '#262627'
    },
    title: {
        text: null,
    },
    xAxis: {
        type: 'linear',
        tickAmount: 10,
        title: { text: 'MAE Percent' },
        gridLineWidth: 1,
        gridLineColor: '#404040',
        gridLineDashStyle: 'Dash',
        lineWidth: 0,
        tickWidth: 0,
        labels: {
            style: {
                color: '#676768'
            }
        }
    },
    yAxis: {
        gridLineWidth: 1,
        gridLineColor: '#404040',
        gridLineDashStyle: 'Dash',
        lineWidth: 0,
        labels: {
            style: {
                color: '#676768'
            },
        },
    },
    series: []
})

const updateChartConfigData = () => {
    // Create data pairs for both percentage and USD series
    const xRange = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER
    }
    const evYaxisData = props.response?.ev_by_mae
    const winRateYaxisData = props.response?.recovery_rate_by_mae
    
    const chartData = props.response?.mae_levels?.map((val,i) => {
        xRange.min = Math.min(xRange.min, val)
        xRange.max = Math.max(xRange.max, val)
        return isValueByExpectedValue.value ? [val, evYaxisData[i] || 0] : [val, winRateYaxisData[i] || 0]
    })

    chartOptions.value = {
        ...chartOptions.value,
        xAxis: {
            ...chartOptions.value.xAxis,
            type: 'linear',
            min: xRange.min,
            max: xRange.max
        },
        series: [
            {
                name: 'with mae%',
                data: chartData,
            }
        ]
    }
}

// Watch for changes in trades prop
watch(() => props.response, (newResponse) => {
    if (newResponse) {
        updateChartConfigData()
    }
}, { immediate: true })

// Watch for changes in maePercentage
watch(() => props.maePercentage, () => {
    if (typeof props.maePercentage === 'number') {
        updateChartConfigData()
    }
}, { immediate: false })

const handlePnlClick = (value) => {
    isValueByExpectedValue.value = value
    updateChartConfigData()
}
</script>

<template>
    <div>
        <div class="flex justify-between mb-4">
        <p class="text-gray-100 text-2xl font-semibold">MAE vs Win Rate chart</p>
        <div :class=[tabGroupClasses.parentTabGroupClass]>
          <button @click="handlePnlClick(true)" :class="[
            tabGroupClasses.commonTabClass,
            isValueByExpectedValue
              ? tabGroupClasses.selectedTabClass
              : tabGroupClasses.unselectedTabClass
          ]">
           Expected Value
          </button>
          <button @click="handlePnlClick(false)" :class="[
            tabGroupClasses.commonTabClass,
            !isValueByExpectedValue
              ? tabGroupClasses.selectedTabClass
              : tabGroupClasses.unselectedTabClass
          ]">
            Win Rate
          </button>
        </div>
      </div>
        <highcharts :options="chartOptions" id="pnl-winrate-chart" :style="isCumulativeView ? 'height: 25vh; width: 100%;' : ''"></highcharts>
    </div>
</template>
