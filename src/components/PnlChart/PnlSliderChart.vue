<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { tabGroupClasses, boxClasses } from './commonCssClasses'
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
    default: 0
  }
})

const chartRef = ref(null)
let resizeObserver = null

const isYaxisPercentage = ref(false)

const chartOptions = ref({
  height: 400,
  chart: {
    type: 'scatter',
    backgroundColor: '#262627'
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
        fontSize: '12px'
      }
    },
    maxPadding: 0.1
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
          return (this.value * 100).toFixed(1) + '%';
        } else {
          return '$' + formatLargeNumber(this.value);
        }
      }
    }
  },
  series: []
})

const updateChartConfigData = () => {
  const xRange = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER
  }
  const trades = props.trades
  const winningTrades = []
  const losingTrades = []

  trades.forEach((value, i) => {
    if (value?.mae_percent && value?.pnl_percent) {
      xRange.min = Math.min(xRange.min, value.mae_percent * 100);
      xRange.max = Math.max(xRange.max, value.mae_percent * 100);
    }

    const yValue = isYaxisPercentage.value ? value.pnl_percent : value.pnl_usd;
    const absYValue = Math.abs(yValue);

    if (value?.pnl_percent > 0) {
      winningTrades.push([value.mae_percent * 100, absYValue])
    } else {
      losingTrades.push([value.mae_percent * 100, absYValue])
    }
  });

  const xPadding = (xRange.max - xRange.min) * 0.1;
  xRange.max = xRange.max + xPadding;

  chartOptions.value = {
    ...chartOptions.value,
    xAxis: {
      ...chartOptions.value.xAxis,
      min: xRange.min,
      max: xRange.max
    },
    series: [{
      name: 'Winning Trades',
      data: winningTrades,
      color: '#4C9077',
      showInLegend: false,
      marker: {
        radius: 3, 
        symbol: 'circle',
        lineWidth: 1,
        lineColor: '#4C9077',
        fillColor: '#65C49D'
      }
    }, {
      name: 'Losing Trades',
      data: losingTrades,
      color: '#B4465A',
      showInLegend: false,
      marker: {
        radius: 3,
        symbol: 'circle',
        lineWidth: 1,
        lineColor: '#B4465A',
        fillColor: '#DE576F'
      }
    }]
  };
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

onMounted(() => {
  if (chartRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          nextTick(() => {
            if (chartRef.value && chartRef.value.chart) {
              const chart = chartRef.value.chart;
              chart.reflow();
            }
          });
        }
      }
    });

    const chartContainer = chartRef.value.$el || chartRef.value;
    if (chartContainer) {
      resizeObserver.observe(chartContainer);
    }
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
})
</script>

<template>
  <div  >
    <div class="flex justify-between mb-4">
      <p class="text-2xl font-semibold">Stoploss Distribution <span ><Info title="Stoploss Distribution" :description="chartDescriptions.slider" /></span></p>
      <div :class=[tabGroupClasses.parentTabGroupClass]>
        <button @click="handlePnlClick(false)" :class="[
          'flex gap-2 items-center',
          tabGroupClasses.commonTabClass,
          !isYaxisPercentage
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]">
          PnL $ <Info title="PnL $" description="PnL $ (Y-axis) is the profit or loss from a trade in USD." />
        </button>
        <button @click="handlePnlClick(true)" :class="[
          'flex gap-2 items-center',
          tabGroupClasses.commonTabClass,
          isYaxisPercentage
            ? tabGroupClasses.selectedTabClass
            : tabGroupClasses.unselectedTabClass
        ]">
          PnL % <Info title="PnL %" description="PnL % (Y-axis) is the profit or loss from a trade as a percentage of the initial stoploss." />
        </button>
      </div>
    </div>

      <highcharts ref="chartRef" :options="chartOptions" id="high-sky-high"
       ></highcharts>

      <div class="flex w-full justify-center items-center mt-4 gap-2">
        <div class="text-white-800 text-sm">MAE (%)</div>
        <Info title="MAE" description="MAE is the average of the absolute difference between the actual stoploss and the optimal stoploss." />
      </div>
  </div>
</template>