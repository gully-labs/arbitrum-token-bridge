import { Barlow, Barlow_Condensed, JetBrains_Mono } from 'next/font/google'

// Gully brand fonts (Gully Labs brand kit): Barlow for body. The export keeps upstream's name, `unica`,
// and its CSS variable, `--font-unica77`, so every existing reference (tailwind `font-unica77`, useTheme,
// Layout, layout.tsx) now resolves to Barlow without being touched.
export const unica = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-unica77',
  fallback: ['Roboto', 'sans-serif']
})

// Display: Barlow Condensed 700, uppercase. Labels: JetBrains Mono 500.
export const gullyDisplay = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-gully-display'
})

export const gullyMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-gully-mono'
})
