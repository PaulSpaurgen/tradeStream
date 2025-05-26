<script setup>
import { ref, onMounted, watch } from 'vue'
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

const emit = defineEmits(['update:maePercentage'])

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
        return isYaxisPercentage.value
          ? (this.value * 100).toFixed(1) + '%'
          : '$' + this.value.toFixed(2);
      }
    }
  },
  annotations: [],
  series: []
})


const isYaxisPercentage = ref(true)

// Watch for changes in trades prop
watch(() => props.trades, (newTrades) => {
  if (newTrades && newTrades.length > 0) {
    updateChartConfigData();
  }
}, { immediate: true })

// watch for changes in maePercentage props
watch(() => props.maePercentage, (newMaePercentage) => {
  if (newMaePercentage) {
    handleMaePercentageChange(newMaePercentage);
  }
}, { immediate: true })

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
          emit('update:maePercentage', newX);
          console.log('Line moved to x:', newX);
        }
      },
      shapes: [{
        fill: 'none',
        stroke: 'rgba(200, 0, 0, 0.75)',
        dashStyle: 'ShortDot',
        strokeWidth: 10,
        type: 'path',
        points: [{
          x: props.maePercentage,
          y: yMin,
          xAxis: 0,
          yAxis: 0
        }, {
          x: props.maePercentage,
          y: yMax,
          xAxis: 0,
          yAxis: 0
        }]
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

const handleMaePercentageChange = (newMaePercentage) => {
  // Update the annotation points with the new value
  if (chartOptions.value.annotations && chartOptions.value.annotations[0]) {
    const newValue = parseFloat(newMaePercentage);
    
    // Get current Y range from the series data
    const allYValues = [];
    chartOptions.value.series.forEach(series => {
      series.data.forEach(point => allYValues.push(point[1]));
    });
    const yMin = Math.min(...allYValues);
    const yMax = Math.max(...allYValues);
    
    chartOptions.value.annotations[0].shapes[0].points = [
      {
        x: newValue,
        y: yMin,
        xAxis: 0,
        yAxis: 0
      },
      {
        x: newValue,
        y: yMax,
        xAxis: 0,
        yAxis: 0
      }
    ];
  }
}

const handlePnlClick = (isPercentage) => {
  // Only update if the state is actually changing
  if (isYaxisPercentage.value === isPercentage) return

  isYaxisPercentage.value = isPercentage


  updateChartConfigData()
}
</script>

<template>
  <div>
    <div class="">
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
      <highcharts :options="chartOptions" id="high-sky-high"></highcharts>

    </div>
  </div>
</template>