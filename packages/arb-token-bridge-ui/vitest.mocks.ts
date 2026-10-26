import { vi } from 'vitest'

vi.mock('next/font/local', () => ({
  default: vi.fn(() => ({
    style: {
      fontFamily: 'mocked'
    }
  }))
}))

// Gully: the brand font comes from next/font/google (GullyChain kit: Exo 2).
vi.mock('next/font/google', () => {
  const font = vi.fn(() => ({
    className: '',
    variable: '',
    style: {
      fontFamily: 'Roboto, sans-serif'
    }
  }))
  return {
    Exo_2: font
  }
})
