import { vi } from 'vitest'

vi.mock('next/font/local', () => ({
  default: vi.fn(() => ({
    style: {
      fontFamily: 'Roboto, sans-serif'
    }
  }))
}))

// Gully: the brand fonts come from next/font/google (Barlow, Barlow Condensed, JetBrains Mono).
vi.mock('next/font/google', () => {
  const font = vi.fn(() => ({
    className: '',
    variable: '',
    style: {
      fontFamily: 'Roboto, sans-serif'
    }
  }))
  return {
    Barlow: font,
    Barlow_Condensed: font,
    JetBrains_Mono: font
  }
})
