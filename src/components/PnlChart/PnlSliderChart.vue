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
  maePercentage: {
    type: Number,
    required: true,
    default: 0
  },
  isCumulativeView: {
    type: Boolean,
    default: false
  }
})

const sliderChartStyle = {
  fill: 'none',
  stroke: '#65C49D',
  dashStyle: '',
  strokeWidth: 4,
  type: 'path',
  strokeLinecap: 'round',
  strokeLinejoin: 'round'

}

const labelStyle = {
  backgroundColor: '#4C9077',
  borderColor: '#65C49D',
  fontFamily: 'Averta',
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
}
const chartOptions = ref({
  height: 400,
  chart: {
    type: 'scatter',
    backgroundColor: '#262627',
    events: {
      load: function () {
        const chart = this;
        let isDragging = false;

        chart.container.addEventListener('mousedown', function (e) {
          const annotation = chart.annotations[0];
          if (annotation) {
            isDragging = true;
          }
        });

        chart.container.addEventListener('mousemove', function (e) {
          if (isDragging) {
            const rect = chart.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const xValue = chart.xAxis[0].toValue(x - chart.plotLeft);
            
            // Update both the annotation line and label position
            const annotation = chart.annotations[0];
            if (annotation) {
              // Update the line position
              annotation.shapes[0].points[0].x = xValue;
              annotation.shapes[0].points[1].x = xValue;
              
              // Update the label position and text
              if (annotation.labels && annotation.labels[0]) {
                annotation.labels[0].point.x = xValue;
                annotation.labels[0].update({
                  text: `MAE: ${xValue.toFixed(2)}%`
                }, false);
              }
              
              // Redraw the annotation
              annotation.redraw();
            }
          }
        });

        chart.container.addEventListener('mouseup', function (e) {
          if (isDragging) {
            isDragging = false;
            // Get final position and emit update
            const annotation = chart.annotations[0];
            if (annotation) {
              const finalX = annotation.shapes[0].points[0].x;
              emit('update:maePercentage', Number(finalX.toFixed(4)));
            }
          }
        });
      },
      redraw: function () {
        // Fix annotation positioning after chart redraw
        const chart = this;
        setTimeout(() => {
          if (chart.annotations && chart.annotations[0]) {
            updateAnnotationToFullHeight(props.maePercentage);
          }
        }, 10);
      }
    }
  },
  title: {
    text: null
  },
  tooltip: {
    borderRadius: 0,
    borderWidth:1,
    fontFamily: 'Averta',
    formatter: function () {
      const maeValue = this.x.toFixed(2);
      const pnlValue = isYaxisPercentage.value
        ? (this.y * 100).toFixed(2) + '%'
        : '$' + formatLargeNumber(this.y);

      const seriesColor = this.series.color;
      const seriesName = this.series.name;
      this.borderColor = seriesColor;

      return `
        <div style="text-align: left; font-family: Averta;">
          <div style="font-size: 12px; font-weight: bold; color:${seriesColor}; margin-bottom: 4px;">${seriesName}</div>
          <div><strong>MAE:</strong> ${maeValue}%</div>
          <div><strong>PnL:</strong> ${pnlValue}</div>
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
    gridLineColor: '#404040',
    gridLineDashStyle: 'Dash',
    lineWidth: 0,
    tickWidth: 0,
    labels: {
      style: {
        color: '#676768',
      }
    }
  },
  yAxis: {
    gridLineWidth: 0,
    gridLineColor: '#404040',
    gridLineDashStyle: 'Dash',
    lineWidth: 0,
    title: {
      text: null // Remove Y-axis title
    },
    labels: {
      
      style: {
        color: '#676768',
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
        }, 0);
      }
    }
  },
  annotations: [],
  series: []
})

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
    const yMin = yAxis.min;
    const yMax = yAxis.max;

    return { min: yMin, max: yMax };
  }

  return { min: sliderLimits.value.min, max: sliderLimits.value.max };
}


const updateAnnotationToFullHeight = (xValue) => {
  if (chartRef.value && chartRef.value.chart) {
    const chart = chartRef.value.chart;
    const annotation = chart.annotations[0];
    const yRange = getFullChartYRange();

    if (annotation) {
      chart.removeAnnotation(annotation);
      chart.addAnnotation({
        draggable: 'x',
        events: {
          afterUpdate: function (e) {
            const newX = Number(this.shapes[0].points[0].x.toFixed(4));
            if (!isUpdatingFromAnnotation.value) {
              isUpdatingFromAnnotation.value = true;
              emit('update:maePercentage', newX);

              setTimeout(() => {
                isUpdatingFromAnnotation.value = false;
              }, 0);
            }
          }
        },
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
const isYaxisPercentage = ref(false)
const isUpdatingFromAnnotation = ref(false)


const updateChartConfigData = () => {
  const xRange = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER
  }
  const trades = props.trades
  const dataPairs = trades.map((value, i) => {
    if (value?.mae_percent && value?.pnl_percent) {
      xRange.min = Math.min(xRange.min, value.mae_percent * 100);
      xRange.max = Math.max(xRange.max, value.mae_percent * 100);
    }
    return isYaxisPercentage.value ? [value.mae_percent * 100, value.pnl_percent] : [value.mae_percent * 100, value.pnl_usd]
  });

  const losingTrades = dataPairs.filter(trade => trade[1] < 0)
  const winningTrades = dataPairs.filter(trade => trade[1] > 0)

  // Get Y range from current data
  const allYValues = dataPairs.map(point => point[1]);
  const yMin = Math.min(...allYValues);
  const yMax = Math.max(...allYValues);

  const yRange = yMax - yMin;
  const yPadding = yRange * 0.1; 
  const fullYMin = yMin - yPadding;
  const fullYMax = yMax + yPadding;

  sliderLimits.value = {
    min: fullYMin,
    max: fullYMax
  }

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

          // Only emit the final value change (after drag is complete)
          if (!isUpdatingFromAnnotation.value) {
            isUpdatingFromAnnotation.value = true;
            emit('update:maePercentage', newX);

            // Update label with final value
            if (this.labels && this.labels[0]) {
              this.labels[0].update({
                text: `MAE: ${newX.toFixed(2)}%`
              });
            }

            setTimeout(() => {
              isUpdatingFromAnnotation.value = false;
            }, 0);
          }
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

// Watch for visibility changes (tab switches, modal open/close)
watch(() => props.isCumulativeView, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    // Chart visibility changed, need to resize and reposition
    nextTick(() => {
      if (chartRef.value && chartRef.value.chart) {
        const chart = chartRef.value.chart;
        // Force chart to recalculate dimensions
        chart.reflow();
        // Reposition annotation after reflow
        setTimeout(() => {
          updateAnnotationToFullHeight(props.maePercentage);
        }, 100);
      }
    });
  }
}, { immediate: false })

const chartRef = ref(null)
let resizeObserver = null

// Setup ResizeObserver to detect visibility changes
onMounted(() => {
  if (chartRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          // Chart is visible, reflow and reposition
          nextTick(() => {
            if (chartRef.value && chartRef.value.chart) {
              const chart = chartRef.value.chart;
              chart.reflow();
              setTimeout(() => {
                updateAnnotationToFullHeight(props.maePercentage);
              }, 100);
            }
          });
        }
      }
    });

    // Observe the chart container
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