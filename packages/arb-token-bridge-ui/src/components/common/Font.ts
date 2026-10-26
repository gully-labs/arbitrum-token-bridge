import { Exo_2 } from 'next/font/google'

// GullyChain brand font (brand-kit/tokens.json): Exo 2, 600 for UI and 800 for headlines. The export keeps
// upstream's name, `unica`, and its CSS variable, `--font-unica77`, so every existing reference (tailwind
// `font-unica77`, useTheme, Layout, layout.tsx) resolves to Exo 2 untouched.
export const unica = Exo_2({
  subsets: ['latin'],
  weight: ['500', '600', '800'],
  variable: '--font-unica77',
  fallback: ['system-ui', 'sans-serif']
})

// One face for everything (the `.font-gully-*` classes in tailwind.css set the weights).
export const gullyDisplay = unica
export const gullyLabel = unica
export const gullyNumbers = unica
