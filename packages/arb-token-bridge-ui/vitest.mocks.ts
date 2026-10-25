import { vi } from 'vitest'

vi.mock('next/font/local', () => ({
  default: vi.fn(() => ({
    style: {
      fontFamily: 'mocked'
    }
  }))
}))

// Gully: the brand fonts come from next/font/google (GullyChain kit: Hanken Grotesk, Poppins,
// Barlow Condensed, IBM Plex Sans, Montserrat).
vi.mock('next/font/google', () => {
  const font = vi.fn(() => ({
    className: '',
    variable: '',
    style: {
      fontFamily: 'Roboto, sans-serif'
    }
  }))
  return {
    Hanken_Grotesk: font,
    Poppins: font,
    Barlow_Condensed: font,
    IBM_Plex_Sans: font,
    Montserrat: font
  }
})
