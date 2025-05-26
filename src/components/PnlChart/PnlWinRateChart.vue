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

// Function to find the Y-value at the nearest MAE percentage
const findYValueAtMAE = (maeValue) => {
    if (!props.response?.mae_levels) return null;
    
    // Convert maePercentage from percentage to decimal (e.g., 2.5% -> 0.025)
    const maeDecimal = maeValue / 100;
    
    // Find the closest MAE level to the current maePercentage
    let closestIndex = 0;
    let minDistance = Infinity;
    
    props.response.mae_levels.forEach((level, index) => {
        const distance = Math.abs(level - maeDecimal);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });
    
    // Get the corresponding Y-value based on current display mode
    const yData = isValueByExpectedValue.value 
        ? props.response?.ev_by_mae 
        : props.response?.recovery_rate_by_mae;
    
    return yData ? yData[closestIndex] : null;
}

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

    // Get Y-value at the current MAE percentage
    const yValueAtMAE = findYValueAtMAE(props.maePercentage);
    const maeDecimal = props.maePercentage / 100;

    // Get Y-axis range for the dashed line
    const allYValues = chartData?.map(point => point[1]) || [];
    const yMin = Math.min(...allYValues);
    const yMax = Math.max(...allYValues);

    chartOptions.value = {
        ...chartOptions.value,
        xAxis: {
            ...chartOptions.value.xAxis,
            type: 'linear',
            min: xRange.min,
            max: xRange.max
        },
        annotations: yValueAtMAE !== null ? [{
            draggable: false,
            shapes: [{
                fill: 'none',
                stroke: '#B4465A',
                dashStyle: 'Dash',
                strokeWidth: 2,
                type: 'path',
                points: [{
                    x: maeDecimal,
                    y: yMin,
                    xAxis: 0,
                    yAxis: 0
                }, {
                    x: maeDecimal,
                    y: yValueAtMAE,
                    xAxis: 0,
                    yAxis: 0
                }]
            }],
            labels: [{
                point: {
                    x: maeDecimal,
                    y: yValueAtMAE + (yMax - yMin) * 0.05,
                    xAxis: 0,
                    yAxis: 0
                },
                text: `MAE: ${props.maePercentage.toFixed(2)}%`,
                backgroundColor: '#B4465A',
                borderWidth: 1,
                borderRadius: 2,
                style: {
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                },
                y: -5,
                align: 'center',
                verticalAlign: 'bottom',
                distance: 0,
                shape: 'rect'
            }]
        }] : [],
        series: [
            {
                name: isValueByExpectedValue.value ? 'Expected Value' : 'Win Rate',
                data: chartData,
                color: '#4B71B7',
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
