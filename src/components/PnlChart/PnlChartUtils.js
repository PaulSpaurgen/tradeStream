export const formatLargeNumber = (value) => {
    const absValue = Math.abs(value)
  
    let formattedValue;
    if (absValue >= 1000000000) {
      formattedValue = (value / 1000000000).toFixed(1) + 'B'
    } else if (absValue >= 1000000) {
      formattedValue = (value / 1000000).toFixed(1) + 'M'
    } else if (absValue >= 1000) {
      formattedValue = (value / 1000).toFixed(1) + 'K'
    } else {
      formattedValue = value.toFixed(2)
    }

    // Remove trailing zeros after decimal point
    return formattedValue.replace(/\.?0+$/, '')
}
export const chartDescriptions = {
  slider: `With this chart you can
        test out what stoploss
        would be ideal in order
        to minimize losses and
        maximize wins.`,
  differentiator: `With this chart you can
        compare the Expected Value of the stoploss PnL with the current stoploss PnL.`,
  distribution: `With this chart you can
        analyze the risk of different
        stoplosses.`
}