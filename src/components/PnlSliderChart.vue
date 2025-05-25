<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  trades: {
    type: Array,
    required: true,
    default: () => []
  }
})

const chartOptions = ref({
  chart: {
    type: 'scatter'
  },
  title: {
    text: 'Sample Chart'
  },
  xAxis: {
    type: 'linear',
    tickAmount: 10,
    title: { text: 'MAE Percent' },
  },
  annotations: [],
  series: []
})

// Add ref for current value
const currentValue = ref(0)
const isYaxisPercentage = ref(true)
const chartGraphData = ref({
  xAxisValues: [],
  yAxisValues: [],
  pnl_percent: [],
  pnl_usd:[],
  minXval: Infinity,
  maxXval: -Infinity
})

// Watch for changes in trades prop
watch(() => props.trades, (newTrades) => {
  if (newTrades && newTrades.length > 0) {
    chartGraphData.value = newTrades.reduce((acc, val) => {
      // Push values to arrays
      acc.xAxisValues.push(val?.mae_percent);
      acc.yAxisValues.push(val?.pnl_percent);
      acc.pnl_percent.push(val?.pnl_percent);
      acc.pnl_usd.push(val?.pnl_usd);

      // Update min/max values
      acc.minXval = Math.min(acc.minXval, val?.mae_percent);
      acc.maxXval = Math.max(acc.maxXval, val?.mae_percent);
      return acc;
    }, {
      xAxisValues: [],
      yAxisValues: [],
      pnl_percent: [],
      pnl_usd:[],
      minXval: Infinity,
      maxXval: -Infinity
    });
    updateChartConfigData();
  }
}, { immediate: true })

//  this function calculates the values for updating the chatOptions
const updateChartConfigData = () =>{
      // Create data pairs for the chart
      const dataPairs = chartGraphData.value.xAxisValues.map((x, i) => [x, chartGraphData.value.yAxisValues[i]]);

      // Set initial value of slider
      currentValue.value = chartGraphData.value.maxXval;
      chartOptions.value = {
        ...chartOptions.value,
        xAxis: {
          ...chartOptions.value.xAxis,
          min: chartGraphData.value.minXval,
          max: chartGraphData.value.maxXval,
        },
        annotations: [{
          draggable: 'x',
          events: {
            afterUpdate: function (e) {
              const newX = this.shapes[0].points[0].x;
              currentValue.value = newX;
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
              x: currentValue.value,
              y: Math.min(...chartGraphData.value.yAxisValues),
              xAxis: 0,
              yAxis: 0
            }, {
              x: currentValue.value,
              y: Math.max(...chartGraphData.value.yAxisValues),
              xAxis: 0,
              yAxis: 0
            }]
          }]
        }],
        series: [{
          name: "Some thing",
          data: dataPairs
        }]
      };
}

const handleInputChange = (e) => {
  // Update the annotation points with the new value
  if (chartOptions.value.annotations && chartOptions.value.annotations[0]) {
    const newValue = parseFloat(e.target.value);
    chartOptions.value.annotations[0].shapes[0].points = [
      {
        x: newValue,
        y: Math.min(...chartGraphData.value.yAxisValues),
        xAxis: 0,
        yAxis: 0
      },
      {
        x: newValue,
        y: Math.max(...chartGraphData.value.yAxisValues),
        xAxis: 0,
        yAxis: 0
      }
    ];
  }
}

const handlePnlClick = (isPercentage) =>{
    if(isYaxisPercentage.value === isPercentage) return
    isYaxisPercentage.value = !isYaxisPercentage.value
    if(isYaxisPercentage.value){
      chartGraphData.value.yAxisValues = chartGraphData.value.pnl_percent
    }else{
      chartGraphData.value.yAxisValues = chartGraphData.value.pnl_usd
    }
    updateChartConfigData()
}
</script>

<template>
  <div>
    <input type="number" v-model="currentValue" @input="handleInputChange" class="mt-2 p-2 border rounded" />
    <div class="relative">
      <highcharts :options="chartOptions" id="high-sky-high"></highcharts>
      <div class="flex gap-4 absolute top-0 right-0 z-10">
        <button @click="handlePnlClick(true)">pnl%</button>
        <button @click="handlePnlClick(false)">pnl$</button>
      </div>
    </div>
  </div>
</template> 