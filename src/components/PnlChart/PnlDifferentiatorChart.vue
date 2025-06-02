<script setup>
import { ref, watch, computed } from 'vue'
import { formatLargeNumber } from './PnlChartUtils'

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

const cumilativeReturnCalculator = (trades, withMae) => {
    let cumulativeProfit = 0;
    return trades.map((trade) => {
        let pnlValue = trade.pnl_usd;
        
        if (withMae && trade.mae_percent > props.maePercentage) {
            const pnl_without_fees = trade.pnl_usd - trade.fees;
            pnlValue = (Math.abs(pnl_without_fees) * (props.maePercentage / trade.mae_percent)) + trade.fees;
        }
        
        cumulativeProfit += pnlValue;
        return [trade.timestamp, cumulativeProfit];
    });
};

const actualReturns = computed(() => {
    return cumilativeReturnCalculator(props.trades, false);
});

const optimizedReturns = computed(() => {
    return cumilativeReturnCalculator(props.trades, true);
});

const chartOptions = computed(() => ({
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
        fontFamily: 'Averta',
        useHTML: true,
        formatter: function () {
            const date = new Date(this.x);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Find the points by series name since indices might change
            const optimizedPoint = this.points.find(p => p.series.name === 'Current P&L');
            const projectedPoint = this.points.find(p => p.series.name === 'Expected P&L');

            const optimizedPnL = optimizedPoint?.y?.toFixed(2) || '0.00';
            const projectedPnL = projectedPoint?.y?.toFixed(2) || '0.00';

            return `
                <div style="text-align: left; font-family: Averta;">
                    <div style="font-size: 12px; color: #676768; margin-bottom: 4px;">${formattedDate}</div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div>
                            <span style="color: #5F93F5; font-weight: bold;">Optimized PnL:</span>
                            <span style="">$${optimizedPnL}</span>
                        </div>
                        <div>
                            <span style="color: #65C49D; font-weight: bold;">Current Projected PnL:</span>
                            <span style="">$${projectedPnL}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    xAxis: {
        type: 'datetime',
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
        title: {
            text: null
        },
        labels: {
            style: {
                color: '#676768',
            },
            formatter: function () {
                return '$' + formatLargeNumber(this.value);
            }
        }
    },
    plotOptions: {
        series: {
            marker: {
                enabled: false
            }
        }
    },
    series: [
        {
            name: 'Range Area',
            type: 'arearange',
            data: actualReturns.value.map((point, index) => {
                const optimizedPoint = optimizedReturns.value[index];
                const diff = optimizedPoint[1] - point[1];
                return {
                    x: point[0],
                    low: Math.min(point[1], optimizedPoint[1]),
                    high: Math.max(point[1], optimizedPoint[1]),
                    isNegative: diff < 0
                };
            }),
            fillOpacity: 1,
            enableMouseTracking: true,
            showInLegend: false,
            color: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, 'rgba(101, 196, 157, 0.4)'],    // Start with higher opacity
                    [0.4, 'rgba(101, 196, 157, 0.2)'],  // Middle point
                    [0.8, 'rgba(101, 196, 157, 0.1)'],  // Fade more gradually
                    [1, 'rgba(101, 196, 157, 0)']       // Fully transparent at bottom
                ]
            },
            negativeColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, 'rgba(222, 87, 111, 0.4)'],     // Start with higher opacity
                    [0.4, 'rgba(222, 87, 111, 0.2)'],   // Middle point
                    [0.8, 'rgba(222, 87, 111, 0.1)'],   // Fade more gradually
                    [1, 'rgba(222, 87, 111, 0)']        // Fully transparent at bottom
                ]
            },
            lineWidth: 0,
            zIndex: -1
        },
        {
            name: 'Current P&L',
            data: actualReturns.value,
            color: '#5F93F5',
            lineWidth: 2,
            marker: {
                symbol: 'circle',
                enabled: false
            }
        },
        {
            name: 'Expected P&L',
            data: optimizedReturns.value,
            color: '#65C49D',
            lineWidth: 2,
            marker: {
                symbol: 'circle',
                enabled: false
            }
        }
    ],
    credits: {
        enabled: false
    }
}));

// Watch for changes in trades prop
watch(() => props.trades, (newTrades) => {
    if (newTrades && newTrades.length > 0) {
        // Chart will automatically update through computed properties
    }
}, { immediate: true });

// Watch for changes in maePercentage
watch(() => props.maePercentage, () => {
    if (typeof props.maePercentage === 'number') {
        // Chart will automatically update through computed properties
    }
}, { immediate: false });
</script>

<template>
    <div>
        <p class="text-gray-100 text-2xl font-semibold mb-4">PnL Comparison</p>
        <highcharts :options="chartOptions" id="pnl-differentiator-chart"></highcharts>
    </div>
</template>