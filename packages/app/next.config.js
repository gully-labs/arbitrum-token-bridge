// @ts-check type next.config.js

// Gully: fail the build on env values that would ship broken. A CRLF env file once inlined
// NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as a bare carriage return, so the live site sent projectId=%0D and every
// WalletConnect request failed with 400. Empty is allowed (browser wallets only); anything else must be a real id.
const gullyEnvProblems = Object.entries(process.env)
  .filter(([key]) => key.startsWith('NEXT_PUBLIC_') || key.startsWith('GULLY_'))
  .filter(([, value]) => typeof value === 'string' && /[\r\n]/.test(value))
  .map(
    ([key]) => `${key} contains a carriage return or newline (CRLF env file?)`
  )
const gullyWalletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
if (gullyWalletConnectId && !/^[0-9a-f]{32}$/i.test(gullyWalletConnectId)) {
  gullyEnvProblems.push(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set but is not a 32-character hex WalletConnect Cloud project id'
  )
}
if (gullyEnvProblems.length > 0) {
  throw new Error(
    `Refusing to build with a broken env:\n- ${gullyEnvProblems.join('\n- ')}`
  )
}

// Gully: optional default chain pair for a site that serves one chain, e.g.
// GULLY_DEFAULT_QUERY="sourceChain=arbitrum-sepolia&destinationChain=gully-chain-testnet".
// Read at build time; `/` without chain query params redirects (temporary) to `/?<query>`.
const gullyDefaultQuery = process.env.GULLY_DEFAULT_QUERY

/** @type {import('next/dist/lib/load-custom-routes').Redirect[]} */
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

/**
 * @type {import('next').NextConfig}
 **/
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
