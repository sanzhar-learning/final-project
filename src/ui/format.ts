export function formatNumber(value: number | null | undefined, digits = 5) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(2)
  }
  return value.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '')
}

export function formatResult(value: number | number[] | string | null) {
  if (value === null) return '-'
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const visibleValues = value.slice(0, 8).map((item) => formatNumber(item, 4))
    const suffix = value.length > 8 ? `, ... ${value.length} values` : ''
    return `[${visibleValues.join(', ')}${suffix}]`
  }
  return formatNumber(value, 6)
}
