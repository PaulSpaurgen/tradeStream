<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick} from 'vue'
import { tabGroupClasses, sliderStyle, labelStyle } from './commonCssClasses'
import { formatLargeNumber } from './PnlChartUtils'
import Info from '../../atoms/Info.vue'
import { chartDescriptions } from './PnlChartUtils'

const props = defineProps({
  trades: {
    type: Array,
    required: true,
    default: () => []
  },
  isCumulativeView: {
    type: Boolean,
    default: false
  },
  maePercentage: {
    type: Number,
    required: true,
    default: 6.4,
    validator: (value) => !isNaN(value)
  },
  maeRange: {
    type: Object,
    required: true,
    default: () => ({
      min: Number.MAX_SAFE_INTEGER,
      max: Number.MIN_SAFE_INTEGER
    })
  }
})

const emit = defineEmits(['update:maePercentage'])



const chartRef = ref(null)

const isYaxisPercentage = ref(false)
const isUpdatingFromAnnotation = ref(false)
const draggingTimeout = ref(null)

const yAxisRange = ref({
  min: Number.MAX_SAFE_INTEGER,
  max: Number.MIN_SAFE_INTEGER
})
const chartOptions = ref({
  credits: {
    enabled: false,
  },
  chart: {
    type: 'scatter',
    backgroundColor: '#262627',
  },
  legend: {
    enabled: false
  },
  title: {
    text: null
  },
  tooltip: {
    borderRadius: 0,
    borderWidth: 1,
    fontFamily: 'Averta',
    formatter: function () {
      const pnlValue = isYaxisPercentage.value
        ? (this.y * 100).toFixed(2) + '%'
        : '$' + formatLargeNumber(this.y);

      const maeValue = this.x.toFixed(2) + '%'

      const seriesColor = this.series.color;
      const seriesName = this.series.name;
      const isLosing = this.series.name === 'Losing Trades'
      this.borderColor = seriesColor;

      return `
        <div style="text-align: left; font-family: Averta;">
          <div style="font-size: 12px; font-weight: bold; color:${seriesColor}; margin-bottom: 4px;">${seriesName}</div>
          <div><strong>PnL:</strong> ${isLosing ? '-' : ''} ${pnlValue}</div>
          <div><strong>MAE:</strong> ${maeValue}</div>
        </div>
      `;
    },
    useHTML: true
  },
  xAxis: {
    type: 'linear',
    tickAmount: 10,
    title: null,
    gridLineWidth: 0,
    lineWidth: 0,
    tickWidth: 0,
    labels: {
      style: {
        color: '#676768',
        fontSize: '12px',
      },
      formatter: function() {
        return this.value + '%'
      }
    },
  },
  yAxis: {
    gridLineWidth: 0,
    lineWidth: 0,
    title: {
      text: null
    },
    labels: {
      style: {
        color: '#676768',
        fontSize: '12px'
      },
      formatter: function () {
        if (isYaxisPercentage.value) {
          return (this.value * 100).toFixed(0) + '%';
        } else {
          return '$' + formatLargeNumber(this.value);
        }
      }
    }
  },
})

const returnPointRadius = (pointValue, maxValue) => {
  const maxRadius = 10
  const minRadius = 2
  const percentage = pointValue / maxValue
  return Math.round(minRadius + (maxRadius - minRadius) * percentage)
}

const updateSliderAnnotation = (newMaePercentage) => {
  newMaePercentage = Number(newMaePercentage);
  if (chartRef.value && chartRef.value.chart) {
    const chart = chartRef.value.chart;
    const annotation = chart.annotations[0];
    const yRange = {
      min: chart.yAxis[0].min || yAxisRange.value.min,
      max: chart.yAxis[0].max || yAxisRange.value.max
    };
    
    // Ensure newMaePercentage stays within xAxis bounds
    const xAxis = chart.xAxis[0];
    const xMin = xAxis.min || props.maeRange.min;
    const xMax = xAxis.max || props.maeRange.max;
    newMaePercentage = Math.max(xMin, Math.min(xMax, newMaePercentage));

    if(annotation){
      chart.removeAnnotation(annotation);
    }

    chart.addAnnotation({
      draggable: "x",
      events: {
        drag: function(e) {
          // Get current xAxis bounds
          const xAxis = this.chart.xAxis[0];
          const xMin = xAxis.min || props.maeRange.min;
          const xMax = xAxis.max || props.maeRange.max;
          
          // Ensure the annotation stays within bounds
          const newX = Math.max(xMin, Math.min(xMax, this.shapes[0].points[0].x));
          
          isUpdatingFromAnnotation.value = true;
          chartRef.value.chart.update({
            tooltip: {
              enabled: false,
              ...chartOptions.value.tooltip
            }
          })
          emit('update:maePercentage', newX.toFixed(2));
          if (draggingTimeout.value) {
            clearTimeout(draggingTimeout.value);
          }
          draggingTimeout.value = setTimeout(() => {
            isUpdatingFromAnnotation.value = false;
            draggingTimeout.value = null;
            chartRef.value.chart.update({
              tooltip: {
                enabled: true,
                ...chartOptions.value.tooltip
              }
            })
          }, 100);
        }
      },
      shapes: [{
        ...sliderStyle,
        zIndex: 1000,
        cursor: 'grab',
        draggable: true,
        points: [{
          x: newMaePercentage,
          y: yRange.min,
          xAxis: 0,
          yAxis: 0
        }, {
          x: newMaePercentage,
          y: yRange.max,
          xAxis: 0,
          yAxis: 0
        }]
      }],
      labels: [{
        point: {
          x: newMaePercentage,
          y: yRange.max * 0.5,
          xAxis: 0,
          yAxis: 0
        },
        text: `||`,
        ...labelStyle,
      }]
    }, true);
  }
};

const updateChartConfigData = () => {
  const yRange = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER
  }

  const trades = props.trades
  let maxValue = 0
  const winningTrades = []
  const losingTrades = []

  trades.forEach((value, i) => {
    const yValue = isYaxisPercentage.value ? value.pnl_percent : value.pnl_usd;
    const absYValue = Math.abs(yValue);
    maxValue = Math.max(maxValue, absYValue)
    yRange.min = Math.min(yRange.min, yValue)
    yRange.max = Math.max(yRange.max, yValue)
    if (value?.pnl_percent > 0) {
      winningTrades.push([value.mae_percent * 100, absYValue])
    } else {
      losingTrades.push([value.mae_percent * 100, absYValue])
    }
  });
 
  if(yAxisRange.value.min === Number.MAX_SAFE_INTEGER || yAxisRange.value.max === Number.MIN_SAFE_INTEGER){
    yAxisRange.value = yRange;
  }



  chartOptions.value = {
    ...chartOptions.value,
    xAxis: {
      ...chartOptions.value.xAxis,
      min: props.maeRange.min,
      max: props.maeRange.max
    },
    series: [{
      name: 'Winning Trades',
      color: '#5AAB8A',
      symbol: 'circle',
      data: winningTrades.map((value, i) => {
        return {
          x: value[0],
          y: value[1],
          marker: {
            radius: returnPointRadius(value[1], maxValue),
            fillColor: 'transparent',
            lineColor: '#5AAB8A',
            lineWidth: 2,
            symbol: 'circle',
          }
        }
      }),
    }, {
      name: 'Losing Trades',
      color: '#B4465A',
      shape: 'circle',
      symbol: 'circle',
      data: losingTrades.map((value, i) => {
        return {
          x: value[0],
          y: value[1],
          marker: {
            radius: returnPointRadius(value[1], maxValue),
            fillColor: 'transparent',
            lineColor: '#B4465A',
            lineWidth: 2,
            symbol: 'circle',
          }
        }
      }),
    }]
  };
  nextTick(() => {
      updateSliderAnnotation(props.maePercentage);
    });
}

const handlePnlClick = (isPercentage) => {
  if (isYaxisPercentage.value === isPercentage) return
  isYaxisPercentage.value = isPercentage
  updateChartConfigData()
}

// Watch for changes in trades prop
watch(() => props.trades, (newTrades) => {
  if (newTrades && newTrades.length > 0) {
    updateChartConfigData();
  }
}, { immediate: true })

watch(() => props.maePercentage, (newMaePercentage) => {
  if (isUpdatingFromAnnotation.value) return;
  updateSliderAnnotation(newMaePercentage);
}, { immediate: false })


</script>

<template>
  <div>
    <div class="flex justify-between mb-4">
      <p class="text-2xl font-semibold">Stoploss Distribution <span>
          <Info title="Stoploss Distribution" :description="chartDescriptions.slider" />
        </span></p>
      <div :class=[tabGroupClasses.parentTabGroupClass]>
        <button @click="handlePnlClick(false)" :class="[
          'flex gap-2 items-center',
          tabGroupClasses.commonTabClass,
          !isYaxisPercentage
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]">
          PnL $
          <Info title="PnL $" description="PnL $ (Y-axis) is the profit or loss from a trade in USD." />
        </button>
        <button @click="handlePnlClick(true)" :class="[
          'flex gap-2 items-center',
          tabGroupClasses.commonTabClass,
          isYaxisPercentage
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]">
          PnL %
          <Info title="PnL %"
            description="PnL % (Y-axis) is the profit or loss from a trade as a percentage of the initial stoploss." />
        </button>
      </div>
    </div>
    <highcharts ref="chartRef" :options="chartOptions" id="high-sky-high"></highcharts>
    <div class="flex w-full justify-center items-center mt-2 gap-2">
      <div class="text-white-800 text-sm">MAE (%)</div>
      <Info title="MAE"
        description="MAE is the average of the absolute difference between the actual stoploss and the optimal stoploss." />
    </div>
  </div>
</template>
