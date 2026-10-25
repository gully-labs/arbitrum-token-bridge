// @ts-check type next.config.js

/**
 * @type {import('next').NextConfig}
 **/

// Gully: optional default chain pair for a site that serves one chain, e.g.
// GULLY_DEFAULT_QUERY="sourceChain=arbitrum-sepolia&destinationChain=gully-chain-testnet".
// Read at build time; `/` without chain query params redirects (temporary) to `/?<query>`.
const gullyDefaultQuery = process.env.GULLY_DEFAULT_QUERY

const gullyDefaultPairRedirects = gullyDefaultQuery
  ? [
      {
        source: '/',
        missing: [
          { type: 'query', key: 'sourceChain' },
          { type: 'query', key: 'destinationChain' }
        ],
        destination: `/?${gullyDefaultQuery}`,
        permanent: false
      }
    ]
  : []

module.exports = {
  distDir: 'build',
  // Gully: GULLY_STANDALONE=1 (set in gully/Dockerfile) emits build/standalone for a small runtime image.
  ...(process.env.GULLY_STANDALONE === '1' ? { output: 'standalone' } : {}),
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  experimental: {
    externalDir: true,
    // monorepo: trace files from the repo root so packages/arb-token-bridge-ui lands in the standalone output
    outputFileTracingRoot: require('path').join(__dirname, '../../')
  },
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'portal.arbitrum.io'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/status',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://portal.arbitrum.io'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET'
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      ...gullyDefaultPairRedirects,
      {
        source:
          '/:slug((?!^$|api/|_next/|public/|restricted)(?!.*\\.[^/]+$).+)',
        missing: [
          {
            type: 'query',
            key: 'destinationChain'
          },
          {
            type: 'header',
            key: 'accept',
            value: 'image/.*'
          }
        ],
        destination: '/?destinationChain=:slug',
        permanent: true
      }
    ]
  }
}
