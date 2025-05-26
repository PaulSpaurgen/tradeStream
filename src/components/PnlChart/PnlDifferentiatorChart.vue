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
    },
    isCumulativeView: {
        type: Boolean,
        default: false
    }
})

const chartOptions = ref({
    chart: {
        type: 'line',
        backgroundColor: '#262627'
    },
    title: {
        text: null,
    },
    legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: {
            color: '#676768',
            fontSize: '12px'
        },
        itemHoverStyle: {
            color: '#ffffff'
        }
    },
    tooltip: {
        shared: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#676768',
        style: {
            color: '#ffffff'
        }
    },
    xAxis: {
        type: 'linear',
        tickAmount: 10,
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
                name: 'Original P&L',
                data: usdDataWithoutMae,
                color: '#B4465A',
                lineWidth: 2,
                dashStyle: 'Solid'
            },
            {
                name: 'MAE Projected P&L',
                data: usdDataWithMae,
                color: '#54A184',
                lineWidth: 3,
                dashStyle: 'Dash'
            },
            {
                name: 'Difference Area',
                type: 'areaspline',
                data: usdDataWithoutMae.map((point, index) => [
                    point[0], // timestamp
                    usdDataWithMae[index] ? usdDataWithMae[index][1] - point[1] : 0 // difference
                ]),
                color: 'rgba(255, 193, 7, 0.3)', // Semi-transparent yellow
                fillOpacity: 0.3,
                lineWidth: 0,
                marker: {
                    enabled: false
                },
                enableMouseTracking: true,
                tooltip: {
                    pointFormatter: function() {
                        return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y > 0 ? '+' : ''}${this.y.toFixed(2)}</b><br/>`
                    }
                }
            }
        ]
    }
}
// Watch for changes in trades prop
watch(() => props.trades, (newTrades) => {
    if (newTrades && newTrades.length > 0) {
        updateChartConfigData()
    }
}, { immediate: true })

// Watch for changes in maePercentage
watch(() => props.maePercentage, () => {
  if (typeof props.maePercentage === 'number') {
    updateChartConfigData()
  }
}, { immediate: false })
</script>

<template>
    <div>
        <p class="text-gray-100 text-2xl font-semibold mb-4">Differentiator Chart</p>
        <highcharts :options="chartOptions" id="pnl-differentiator-chart" :style="isCumulativeView ? 'height: 25vh; width: 100%;' : ''"></highcharts>
    </div>
</template>