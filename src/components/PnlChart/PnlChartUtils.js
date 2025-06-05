export const formatLargeNumber = (value) => {

    const absValue = Math.abs(Number(value))
    let formattedValue;
    if (absValue >= 1000000000) {
      formattedValue = (value / 1000000000).toFixed(0) + 'B'
    } else if (absValue >= 1000000) {
      formattedValue = (value / 1000000).toFixed(0) + 'M'
    } else if (absValue >= 1000) {
      formattedValue = value % 1000 === 0 ? (value / 1000).toFixed(0) + 'K' : (value / 1000).toFixed(1) + 'K'
    } else {
      formattedValue = value.toFixed(0)
    }

    // First remove trailing zeros after decimal point, then remove decimal point if it's the last character
    return formattedValue
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