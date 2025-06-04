<script setup>
import { ref, watch } from 'vue'
import { tabGroupClasses } from './commonCssClasses'
import { formatLargeNumber, chartDescriptions } from './PnlChartUtils'
import Info from '../../atoms/Info.vue'


const props = defineProps({
    response: {
        type: Object,
        required: true,
        default: () => { }
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
    height: 400,
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
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#65C49D',
        fontFamily: 'Averta',
        useHTML: true,
        formatter: function () {
            const maeValue = (this.x * 100).toFixed(2);
            const pnlValue = isValueByExpectedValue.value
                ? '$' + formatLargeNumber(this.y) 
                : (this.y * 100).toFixed(2) + '%';

            return `
                <div style="text-align: left; font-family: Averta;">
                    <div style="font-size: 12px; color: #676768; margin-bottom: 4px;"> <span style=" font-weight: bold;">MAE:</span> ${maeValue}%</div>
                    <div style="font-size: 12px; color: #676768; margin-bottom: 4px;"> <span style=" font-weight: bold;">${isValueByExpectedValue.value ? 'Expected Value' : 'Win Rate'}:</span> ${pnlValue}</div>
                </div>
            `;
        }

    },
    xAxis: {
        type: 'linear',
        tickAmount: 10,
        title: null,
        gridLineWidth: 0,
        gridLineColor: '#404040',
        gridLineDashStyle: 'Dash',
        lineWidth: 0,
        tickWidth: 0,
        labels: {
            style: {
                color: '#676768',
                display: 'none'
            }
        }
    },
    yAxis: {
        gridLineWidth: 0,
        gridLineColor: '#404040',
        gridLineDashStyle: 'Dash',
        lineWidth: 0,
        title: null,
        labels: {
            style: {
                color: '#676768'
            },
            formatter: function () {
                return isValueByExpectedValue.value 
                    ? '$' + formatLargeNumber(this.value) 
                    : (this.value * 100).toFixed(1) + '%';
            }
        },
    },
    series: []
})

// Function to find the Y-value at the nearest MAE percentage
const findYValueAtMAE = (maeValue) => {
    if (!props.response?.mae_levels) {
        console.log('No mae_levels found in response:', props.response)
        return null;
    }

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

    const yValue = yData ? yData[closestIndex] : null;

    console.log({ yValue })
    
    return yValue;
}

const updateChartConfigData = () => {
    
    // Create data pairs for both percentage and USD series
    const xRange = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER
    }
    const yRange = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER
    }
    const evYaxisData = props.response?.ev_by_mae
    const winRateYaxisData = props.response?.recovery_rate_by_mae

    const yAxisData = isValueByExpectedValue.value ? evYaxisData : winRateYaxisData


    const chartData = props.response?.mae_levels?.map((val, i) => {
        yRange.min = Math.min(yRange.min, yAxisData[i] || 0)
        yRange.max = Math.max(yRange.max, yAxisData[i] || 0)
        xRange.min = Math.min(xRange.min, val)
        xRange.max = Math.max(xRange.max, val)
        return [val, yAxisData[i] || 0]
    })

    const yValue = findYValueAtMAE(props.maePercentage);

    chartOptions.value = {
        ...chartOptions.value,
        yAxis: {
            ...chartOptions.value.yAxis,
            min: yRange.min,
            max: yRange.max
        },
        xAxis: {
            ...chartOptions.value.xAxis,
            type: 'linear',
            min: xRange.min,
            max:  xRange.max
        },
        annotations: [{
            visible: true,
            draggable: '',
            labels: [{
                point: {
                    x: props.maePercentage / 100, // Convert percentage to decimal
                    y: yValue,
                    xAxis: 0,
                    yAxis: 0
                },
                text: `
                MAE: ${props.maePercentage}%
                | ${isValueByExpectedValue.value ? 'Expected Value: $' + yValue?.toFixed(2) : 'Win Rate: ' + (yValue * 100)?.toFixed(1) + '%'}`,
                backgroundColor: '#FCFEFD',
                borderColor: '#65C49D',
                borderWidth: 1,
                borderRadius: 0,
                padding: 6,
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: 'Averta'
                },
                verticalAlign: 'bottom',
                y: -10,
                allowOverlap: true,
                crop: false,
                shape: 'rect'
            }],
            shapes: [{
                type: 'path',
                strokeWidth: 1,
                stroke: '#65C49D',
                dashStyle: 'Dash',
                points: [{
                    x: props.maePercentage / 100, // Convert percentage to decimal
                    y: 0,
                    xAxis: 0,
                    yAxis: 0
                }, {
                    x: props.maePercentage / 100, // Convert percentage to decimal
                    y: yValue,
                    xAxis: 0,
                    yAxis: 0
                }],
            }],
            zIndex: 10,
            labelOptions: {
                style: {
                    fontSize: '11px'
                }
            }
        }],
        series: [
            {
                name: isValueByExpectedValue.value ? 'Expected Value' : 'Win Rate',
                data: chartData,
                color: '#54A184',
                lineWidth: 2,
                type: 'area',
                fillOpacity: 0.3,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, 'rgba(84, 161, 132, 0.6)'],
                        [1, 'rgba(84, 161, 132, 0)']
                    ]
                }
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
            <p class="text-gray-100 text-2xl font-semibold">Trade Risk Analysis <span ><Info title="Trade Risk Analysis" :description="chartDescriptions.distribution" /></span></p>
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
        <highcharts :options="chartOptions" id="pnl-winrate-chart"></highcharts>
    </div>
</template>
