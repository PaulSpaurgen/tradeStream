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