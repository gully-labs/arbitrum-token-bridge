/**
 * GullyChain Bridge brand constants. Everything the Gully fork says about itself lives here, so upstream
 * merges only ever touch the few call sites that import from this file.
 * Colours and fonts live in the theming layer (tailwind.config.js, styles/tailwind.css, Font.ts); the
 * values come from the GullyChain brand kit (GULLY LABS GRAPHICS/Gully Chain/brand-kit, CLAUDE_PROMPT.md + tokens.json).
 * The brand name is always written "GullyChain" (one word, capital G, capital C).
 */
export const GULLY = {
  name: 'GullyChain Bridge',
  shortName: 'GullyChain Bridge',
  description:
    'Bridge assets between Arbitrum Sepolia and GullyChain Testnet. Built by Gully Labs on the Arbitrum token bridge.',
  // Production origin for absolute OG/Twitter URLs (kit section 2), per the owner.
  siteUrl: 'https://bridge.gullychain.xyz',
  themeColor: '#05080D',
  links: {
    website: 'https://gullychain.xyz',
    explorer: 'https://testnet-explorer.gullychain.xyz',
    labs: 'https://gullylabs.xyz',
    x: 'https://x.com/Gully_Labs',
    xHandle: '@Gully_Labs',
    github: 'https://github.com/gully-labs'
  },
  // Kept where upstream credits Arbitrum.
  poweredBy: { label: 'Powered by Arbitrum', href: 'https://arbitrum.io' },
  /** Read-only endpoints for the activity panel (public, no keys). The contract addresses mirror the
   *  chain record in util/orbitChainsData.json (chain id 485590); the panel never writes anything. */
  activity: {
    chainRpcUrl: 'https://testnet-rpc.gullychain.xyz',
    indexerUrl: 'https://indexer.gullychain.xyz',
    parentRpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    parentExplorerUrl: 'https://sepolia.arbiscan.io',
    bridge: '0x2073106fd3fc844Bbde31f5Bf0BB91cf1e2d6C8A',
    inbox: '0x7B8499f1C058c9bdE2Bc9BdFEBE40364232C52B5',
    fromBlock: 322568124
  }
} as const

/** Kit files, byte for byte (see packages/app/scripts/brand-from-kit.mjs). */
export const GC_ICON_SRC = '/brand/gullychain-icon-transparent-512.png'

/** Token lists for Gully chains, by chain id. Arbitrum's list service has no list for our chains (its
 *  `<chainId>_arbed_uniswap_labs.json` URL returns 403), so these replace it. Uniswap token-lists format, built by
 *  gully-ops l3/tokenlist and served with `Access-Control-Allow-Origin: *`. */
export const GULLY_TOKEN_LISTS: Record<number, { url: string; name: string }> =
  {
    485590: {
      url: 'https://gullychain.xyz/tokenlist.json',
      name: 'GullyChain Testnet Token List'
    }
  }

/** Chains that never use Circle's CCTP (no native USDC there): skip every Circle API call for them. */
export const GULLY_CHAIN_IDS: readonly number[] = [485590]
/** The 3D logo with background removed, 1315x305: header/nav on dark, shown at height <= 152px, width auto. */
export const GC_LOGO_SRC = '/brand/logo/gullychain-logo-transparent.png'
export const GC_LOGO_SIZE = { width: 1315, height: 305 } as const
/** "Powered by Gully Labs" badge from the Gully Labs kit (brand-kit/badges, byte-exact PNGs; the kit SVG has empty
 *  image slots), native 254x64, shown at 127x32 in the footer of every Gully surface (owner rule 2026-10-26). */
export const GL_BADGE_POWERED = {
  src: '/brand/gully-labs/powered-by-gully-labs-dark.png',
  srcSet:
    '/brand/gully-labs/powered-by-gully-labs-dark.png 1x, /brand/gully-labs/powered-by-gully-labs-dark-2x.png 2x, /brand/gully-labs/powered-by-gully-labs-dark-3x.png 3x',
  width: 127,
  height: 32
} as const
/** "Powered by GullyChain" badge, native 189x56 (vector SVG, PNG fallbacks at 1x/2x/3x). */
export const GC_BADGE_POWERED = {
  svg: '/brand/badges/gullychain-powered-by-dark.svg',
  srcSet:
    '/brand/badges/gullychain-powered-by-dark.png 1x, /brand/badges/gullychain-powered-by-dark-2x.png 2x, /brand/badges/gullychain-powered-by-dark-3x.png 3x',
  width: 189,
  height: 56
} as const
/** Mascot "trader" (335x400) for the activity panel's settlement message. */
export const GC_MASCOT_SRC = '/brand/mascots/gullychain-mascot-trader.png'
export const GC_MASCOT_SIZE = { width: 335, height: 400 } as const
