/**
 * GullyChain Bridge brand constants. Everything the Gully fork says about itself lives here, so upstream
 * merges only ever touch the few call sites that import from this file.
 * Colours and fonts live in the theming layer (tailwind.config.js, styles/tailwind.css, Font.ts); the
 * values come from the GullyChain brand kit v2 (GRAPHICS/gullychain-brand-kit-v2/CLAUDE_PROMPT.md).
 * The brand name is always written "GullyChain" (one word, capital G, capital C).
 */
export const GULLY = {
  name: 'GullyChain Bridge',
  shortName: 'GullyChain Bridge',
  /** Kit slogan, verbatim, Title Case. */
  tagline: 'Your Profile Is Your Wallet',
  description:
    'Bridge assets between Arbitrum Sepolia and GullyChain Testnet. Built by Gully Labs on the Arbitrum token bridge.',
  siteUrl: 'https://testnet-bridge.gullychain.xyz',
  themeColor: '#000000',
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
export const GC_ICON_SRC = '/brand/gc-icon-192.png'
export const GC_ICON_512_SRC = '/brand/gc-icon-512.png'
/** Mascot pose 05 "Rapid Transaction": the kit's pose for speed and settlement messaging. */
export const GC_MASCOT_RAPID_SRC = '/brand/gc-mascot-05-rapid-transaction.png'
