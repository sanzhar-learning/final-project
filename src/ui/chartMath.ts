export function getZoomDomain(min: number, max: number, zoom: number): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [0, 1]
  }

  const safeZoom = Math.max(1, zoom)
  const center = (min + max) / 2
  const halfRange = (max - min) / (2 * safeZoom)
  return [center - halfRange, center + halfRange]
}

export function getNumericExtent(values: Array<number | null | undefined>): [number, number] {
  const cleanValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (!cleanValues.length) return [0, 1]
  return [Math.min(...cleanValues), Math.max(...cleanValues)]
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
