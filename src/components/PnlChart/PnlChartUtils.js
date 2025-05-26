export const formatLargeNumber = (value) => {
    const absValue = Math.abs(value)
  
    if (absValue >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B'
    } else if (absValue >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    } else if (absValue >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    } else {
      return value.toFixed(2)
    }
  }