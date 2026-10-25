/**
 * Gully Bridge brand constants. Everything the Gully fork says about itself lives here, so upstream
 * merges only ever touch the few call sites that import from this file.
 * Colours and fonts live in the theming layer (tailwind.config.js, styles/tailwind.css, Font.ts).
 */
export const GULLY = {
  name: 'Gully Bridge',
  shortName: 'Gully Bridge',
  tagline: 'Move assets between a Gully chain and its parent chain.',
  description:
    'Gully Bridge moves assets between Gully chains and their parent chains. Built by Gully Labs on the Arbitrum token bridge.',
  // Placeholder until the production domain is decided; used for Open Graph URLs only.
  siteUrl: 'https://bridge.gullylabs.xyz',
  themeColor: '#0D141C',
  links: {
    website: 'https://gullylabs.xyz',
    docs: 'https://docs.gullylabs.xyz',
    x: 'https://x.com/Gully_Labs',
    xHandle: '@Gully_Labs',
    github: 'https://github.com/gully-labs'
  },
  // Kept where upstream credits Arbitrum.
  poweredBy: { label: 'Powered by Arbitrum', href: 'https://arbitrum.io' }
} as const

/** Kit master, byte for byte (see packages/app/scripts/brand-from-kit.mjs). */
export const GULLY_LOCKUP_SRC = '/brand/gullylabs-logo-horizontal-on-dark.png'
export const GULLY_MARK_SRC = '/brand/gullylabs-mascot-bust.png'
export const GULLY_WORDMARK_SRC = '/brand/gullylabs-wordmark-on-dark.svg'
