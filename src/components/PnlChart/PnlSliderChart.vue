<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { tabGroupClasses } from './commonCssClasses'

const props = defineProps({
  trades: {
    type: Array,
    required: true,
    default: () => []
  },
  maePercentage: {
    type: Number,
    required: true,
    default: 0
  }
})

const sliderChartStyle = {
  fill: 'none',
  stroke: 'rgba(200, 0, 0, 0.75)',
  dashStyle: '',
  strokeWidth: 4,
  type: 'path',
}

const labelStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderColor: 'rgba(200, 0, 0, 0.75)',
  borderWidth: 1,
  borderRadius: 3,
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
}

const emit = defineEmits(['update:maePercentage'])
const sliderLimits = ref({
  min: 0,
  max: 10,
})

// Generalized function to get current Y-axis extremes for full chart height
const getFullChartYRange = () => {
  if (chartRef.value && chartRef.value.chart) {
    const chart = chartRef.value.chart;
    const yAxis = chart.yAxis[0];

    // Get the actual Y-axis extremes (visible range)
    const yMin = yAxis.min;
    const yMax = yAxis.max;

    return { min: yMin, max: yMax };
  }

  // Fallback to sliderLimits if chart is not available
  return { min: sliderLimits.value.min, max: sliderLimits.value.max };
}

// Robust function to update annotation line to full chart height
const updateAnnotationToFullHeight = (xValue) => {
  if (chartRef.value && chartRef.value.chart) {
    const chart = chartRef.value.chart;
    const annotation = chart.annotations[0];
    const yRange = getFullChartYRange();

    if (annotation) {
      annotation.update({
        shapes: [{
          ...sliderChartStyle,
          points: [{
            x: parseFloat(xValue),
            y: yRange.min,
            xAxis: 0,
            yAxis: 0
          }, {
            x: parseFloat(xValue),
            y: yRange.max,
            xAxis: 0,
            yAxis: 0
          }]
        }],
        labels: [{
          point: {
            x: parseFloat(xValue),
            y: yRange.min + (yRange.max - yRange.min) * 0.9,
            xAxis: 0,
            yAxis: 0
          },
          text: `MAE: ${parseFloat(xValue).toFixed(2)}%`,
          ...labelStyle
        }]
      });
    }
  }
}

// Helper function to format large numbers
const formatLargeNumber = (value) => {
  const absValue = Math.abs(value)

  if (absValue >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B'
  } else if (absValue >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (absValue >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  } else {
    return value.toFixed(2)
  }
}

const chartOptions = ref({
  chart: {
    type: 'scatter',
    backgroundColor: '#262627'
  },
  title: {
    text: null
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
      formatter: function () {
        if (isYaxisPercentage.value) {
          return (this.value * 100).toFixed(1) + '%';
        } else {
          return '$' + formatLargeNumber(this.value);
        }
      }
    },
    events: {
      setExtremes: function (e) {
        // Update annotation when Y-axis extremes change
        setTimeout(() => {
          updateAnnotationToFullHeight(props.maePercentage);
        }, 50);
      }
    }
  },
  annotations: [],
  series: []
})


const isYaxisPercentage = ref(true)
const isUpdatingFromAnnotation = ref(false)

// Watch for changes in trades prop
watch(() => props.trades, (newTrades) => {
  if (newTrades && newTrades.length > 0) {
    updateChartConfigData();
  }
}, { immediate: true })

// watch for changes in maePercentage props
watch(() => props.maePercentage, (newMaePercentage) => {
  if (typeof newMaePercentage === 'number' && !isUpdatingFromAnnotation.value) {
    handleMaePercentageChange(newMaePercentage);
  }
}, { immediate: false })

//  this function calculates the values for updating the chatOptions
const updateChartConfigData = () => {
  const xRange = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER
  }
  const trades = props.trades
  // Create data pairs for the chart

  const dataPairs = trades.map((value, i) => {
    if (value?.mae_percent && value?.pnl_percent) {
      xRange.min = Math.min(xRange.min, value.mae_percent);
      xRange.max = Math.max(xRange.max, value.mae_percent);
    }
    return isYaxisPercentage.value ? [value.mae_percent, value.pnl_percent] : [value.mae_percent, value.pnl_usd]
  });

  const losingTrades = dataPairs.filter(trade => trade[1] < 0)
  const winningTrades = dataPairs.filter(trade => trade[1] > 0)

  // Get Y range from current data
  const allYValues = dataPairs.map(point => point[1]);
  const yMin = Math.min(...allYValues);
  const yMax = Math.max(...allYValues);

  // Extend Y range for full chart height annotation
  const yRange = yMax - yMin;
  const yPadding = yRange * 0.1; // 10% padding
  const fullYMin = yMin - yPadding;
  const fullYMax = yMax + yPadding;

  sliderLimits.value = {
    min: fullYMin,
    max: fullYMax
  }

  // Don't mutate prop directly, emit to parent if needed
  // emit('update:maePercentage', xRange.max);
  chartOptions.value = {
    ...chartOptions.value,
    xAxis: {
      ...chartOptions.value.xAxis,
      min: xRange.min,
      max: xRange.max,
    },
    annotations: [{
      draggable: 'x',
      events: {
        afterUpdate: function (e) {
          const newX = Number(this.shapes[0].points[0].x.toFixed(4));
          isUpdatingFromAnnotation.value = true;
          emit('update:maePercentage', newX);

          // Update the label text to reflect the new position
          if (this.labels && this.labels[0]) {
            this.labels[0].update({
              text: `MAE: ${newX.toFixed(2)}%`
            });
          }

          // Reset flag after a short delay to allow the prop update to complete
          setTimeout(() => {
            isUpdatingFromAnnotation.value = false;
          }, 0);
        }
      },
      shapes: [{
        ...sliderChartStyle,
        points: [{
          x: props.maePercentage,
          y: sliderLimits.value.min,
          xAxis: 0,
          yAxis: 0
        }, {
          x: props.maePercentage,
          y: sliderLimits.value.max,
          xAxis: 0,
          yAxis: 0
        }]
      }],
      labels: [{
        point: {
          x: props.maePercentage,
          y: sliderLimits.value.min + (sliderLimits.value.max - sliderLimits.value.min) * 0.9,
          xAxis: 0,
          yAxis: 0
        },
        text: `MAE: ${props.maePercentage.toFixed(2)}%`,
        ...labelStyle
      }]
    }],
    series: [{
      name: 'Winning Trades',
      data: winningTrades,
      color: '#22c55e',
      showInLegend: false
    }, {
      name: 'Losing Trades',
      data: losingTrades,
      color: '#ef4444',
      showInLegend: false
    }]
  };
}

const chartRef = ref(null)

const handleMaePercentageChange = (newMaePercentage) => {
  // Use the generalized function for robust annotation updates
  updateAnnotationToFullHeight(newMaePercentage);
}

const handlePnlClick = (isPercentage) => {
  // Only update if the state is actually changing
  if (isYaxisPercentage.value === isPercentage) return

  isYaxisPercentage.value = isPercentage

  updateChartConfigData()

  // Use nextTick to ensure chart is updated before refreshing annotation
  nextTick(() => {
    // Refresh annotation to full height after chart data changes
    updateAnnotationToFullHeight(props.maePercentage);
  });
}
</script>

<template>
  <div>
    <div class="flex justify-between mb-4">
        <p class="text-gray-100 text-2xl font-semibold">MAE vs PnL chart</p>
        <div :class=[tabGroupClasses.parentTabGroupClass]>
          <button @click="handlePnlClick(true)" :class="[
            tabGroupClasses.commonTabClass,
            isYaxisPercentage
              ? tabGroupClasses.selectedTabClass
              : tabGroupClasses.unselectedTabClass
          ]">
            PnL %
          </button>
          <button @click="handlePnlClick(false)" :class="[
            tabGroupClasses.commonTabClass,
            !isYaxisPercentage
              ? tabGroupClasses.selectedTabClass
              : tabGroupClasses.unselectedTabClass
          ]">
            PnL $
          </button>
        </div>
      </div>
      <highcharts ref="chartRef" :options="chartOptions" id="high-sky-high"></highcharts>
  </div>
</template>