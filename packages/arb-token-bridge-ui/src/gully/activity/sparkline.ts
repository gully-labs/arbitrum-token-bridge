/** Tiny SVG sparkline geometry for the stat tiles (the landing's "Direction A: Terminal" language). */

export type SparkPoint = { x: number; y: number }

const r1 = (n: number) => Math.round(n * 10) / 10

/** Line and area paths for a 200x40 viewBox; empty strings for fewer than two values. */
export function sparkLine(
  values: number[],
  width = 200,
  height = 40,
  pad = 2
): { line: string; area: string; last: SparkPoint | null } {
  if (values.length < 2) return { line: '', area: '', last: null }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = (width - 2 * pad) / (values.length - 1)
  const points = values.map<SparkPoint>((v, i) => ({
    x: r1(pad + i * step),
    y: r1(height - pad - ((v - min) / range) * (height - 2 * pad))
  }))
  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`)
    .join(' ')
  const first = points[0] as SparkPoint
  const last = points[points.length - 1] as SparkPoint
  const area = `${line} L${last.x} ${height} L${first.x} ${height} Z`
  return { line, area, last }
}

export type SparkBar = { x: number; y: number; width: number; height: number }

/** One bar per value in a 200x40 viewBox, 2px surface gap, zero values drawn as a hairline. */
export function sparkBars(
  values: number[],
  width = 200,
  height = 40,
  gap = 2
): SparkBar[] {
  if (values.length === 0) return []
  const max = Math.max(...values) || 1
  const slot = width / values.length
  const barWidth = Math.max(1, r1(slot - gap))
  return values.map((v, i) => {
    const h = v > 0 ? Math.max(2, r1((v / max) * (height - 2))) : 1
    return {
      x: r1(i * slot + gap / 2),
      y: r1(height - h),
      width: barWidth,
      height: h
    }
  })
}
