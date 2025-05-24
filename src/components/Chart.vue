<script setup>
import { ref , onMounted } from 'vue'
import axios from 'axios'

const chartOptions = ref({
  chart: {
    type: 'scatter'
  },
  title: {
    text: 'Sample Chart'
  },
  xAxis: {
   
  },
  yAxis: {
    title: {
      text: 'Values'
    }
  },
  series: []
})
onMounted(async () => {
  try {
    const response = await axios.get('https://us-central1-tradestream-cloud.cloudfunctions.net/stoploss-optimizooor', {
      params: {
        uid: 'test_data',
        session_id: 'session12394'
      }
    })

    if (response && response.data) {
      
      const safeJson = response.data.replace(/\bNaN\b/g, 'null');
      const parsed = JSON.parse(safeJson);
      const restructuredData = (parsed?.data?.trades || []).reduce((acc, val) => {
        acc.xAxisValues.push(val?.mae_percent);
        acc.yAxisValues.push(val?.pnl_percent);
        return acc;
      }, { xAxisValues: [], yAxisValues: [] });

      const dataPairs = restructuredData.xAxisValues.map((x, i) => [x, restructuredData.yAxisValues[i]]);
      const min = Math.min(...restructuredData.xAxisValues);
      const max = Math.max(...restructuredData.xAxisValues);

      chartOptions.value.xAxis = {
        type: 'linear',
        min,
        max,
        tickAmount: 10,
        title: { text: 'MAE Percent' }
      };
      chartOptions.value.series = [{
        name: "Some thing",
        data: dataPairs
      }];
      console.log('chart options', chartOptions);
    } else {
      console.error('Invalid response:', response);
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>

<template>
  <div>
    <highcharts :options="chartOptions"></highcharts>
  </div>
</template>
