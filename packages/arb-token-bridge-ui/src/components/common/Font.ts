import {
  Barlow_Condensed,
  Hanken_Grotesk,
  IBM_Plex_Sans,
  Montserrat,
  Poppins
} from 'next/font/google'

// GullyChain brand fonts (brand kit v2, CLAUDE_PROMPT.md section 3). Hanken Grotesk is the UI/body face.
// The export keeps upstream's name, `unica`, and its CSS variable, `--font-unica77`, so every existing
// reference (tailwind `font-unica77`, useTheme, Layout, layout.tsx) resolves to Hanken Grotesk untouched.
export const unica = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-unica77',
  fallback: ['Roboto', 'sans-serif']
})

// Poppins 800, letter-spacing -0.02em: wordmark, headlines, big numbers.
export const gullyDisplay = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-gully-display'
})

// Barlow Condensed 800, uppercase, +0.04em: badges and section labels.
export const gullyLabel = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-gully-label'
})

// IBM Plex Sans 500/600, tabular numerals: addresses, hashes, prices, block numbers.
export const gullyNumbers = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-gully-numbers'
})

// Montserrat 500, letter-spacing 0.2em: the tagline under the wordmark.
export const gullyTagline = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-gully-tagline'
})
