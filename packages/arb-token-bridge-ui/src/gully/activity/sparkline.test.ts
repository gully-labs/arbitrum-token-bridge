import { describe, expect, it } from 'vitest'
import { sparkBars, sparkLine } from './sparkline'

describe('sparkLine', () => {
  it('is empty for fewer than two values', () => {
    expect(sparkLine([1])).toEqual({ line: '', area: '', last: null })
  })

  it('scales values into the box and closes the area on the baseline', () => {
    const { line, area, last } = sparkLine([0, 10, 5], 200, 40, 2)
    expect(line).toBe('M2 38 L100 2 L198 20')
    expect(area).toBe('M2 38 L100 2 L198 20 L198 40 L2 40 Z')
    expect(last).toEqual({ x: 198, y: 20 })
  })

  it('draws a flat line for constant values', () => {
    expect(sparkLine([3, 3, 3]).line).toBe('M2 38 L100 38 L198 38')
  })
})

describe('sparkBars', () => {
  it('lays bars out with a surface gap, tallest at full height, zero as a hairline', () => {
    const bars = sparkBars([0, 4, 2], 200, 40, 2)
    expect(bars).toHaveLength(3)
    expect(bars[0]).toEqual({ x: 1, y: 39, width: 64.7, height: 1 })
    expect(bars[1]).toEqual({ x: 67.7, y: 2, width: 64.7, height: 38 })
    expect(bars[2]).toEqual({ x: 134.3, y: 21, width: 64.7, height: 19 })
  })

  it('is empty for no values', () => {
    expect(sparkBars([])).toEqual([])
  })
})
