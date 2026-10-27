import { mainnet, arbitrum } from 'wagmi/chains'
import { createConfig, http } from 'wagmi'
import {
  Chain,
  connectorsForWallets,
  getDefaultConfig,
  getDefaultWallets
} from '@rainbow-me/rainbowkit'
import {
  trustWallet,
  okxWallet,
  rabbyWallet,
  injectedWallet,
  coinbaseWallet
} from '@rainbow-me/rainbowkit/wallets'

import {
  sepolia,
  arbitrumNova,
  arbitrumSepolia,
  localL1Network as local,
  localL2Network as arbitrumLocal,
  localL3Network as l3Local,
  base,
  baseSepolia
} from './wagmiAdditionalNetworks'
import {
  isE2eTestingEnvironment,
  isDevelopmentEnvironment
} from '../CommonUtils'
import { getCustomChainsFromLocalStorage, rpcURLs } from '../networks'
import { ChainId } from '../../types/ChainId'
import { getOrbitChains } from '../orbitChainsList'
import { getWagmiChain } from './getWagmiChain'
import { GULLY } from '../../gully/brand'
import { _chains } from '@rainbow-me/rainbowkit/dist/config/getDefaultConfig'

const customChains = getCustomChainsFromLocalStorage().map(chain =>
  getWagmiChain(chain.chainId)
)
const wagmiOrbitChains = getOrbitChains().map(chain =>
  getWagmiChain(chain.chainId)
)

const defaultChains: readonly [Chain, ...Chain[]] = [
  // mainnet, arb1, & arb nova are for network switch tests
  mainnet,
  arbitrum,
  arbitrumNova,
  base,
  // sepolia & arb sepolia are for tx history panel tests
  sepolia,
  arbitrumSepolia,
  baseSepolia
]

function getChainList(): readonly [Chain, ...Chain[]] {
  // for E2E tests, only have local + minimal required chains
  if (isE2eTestingEnvironment) {
    return [
      local,
      arbitrumLocal,
      l3Local,
      sepolia, // required for testing cctp
      arbitrumSepolia, // required for testing cctp
      mainnet // required for import token test
    ]
  }

  // for local env, have all local + default + user added chains
  if (isDevelopmentEnvironment) {
    return [
      ...defaultChains,
      // Orbit chains
      ...wagmiOrbitChains,
      // add local environments during testing
      local,
      arbitrumLocal,
      l3Local,
      // user-added custom chains
      ...customChains
    ]
  }

  // for preview + production env, return all non-local chains
  return [...defaultChains, ...wagmiOrbitChains, ...customChains]
}

const chainList = getChainList()

// Gully: a WalletConnect Cloud project id is 32 hex characters. Anything else (a stray carriage return from a CRLF
// env file, spaces, a placeholder) used to ship as-is and made every WalletConnect request fail with 400, so treat it
// as missing. packages/app/next.config.js also fails the build on such a value.
const rawProjectId = (
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''
).trim()
const projectId = /^[0-9a-f]{32}$/i.test(rawProjectId) ? rawProjectId : ''

if (!projectId) {
  console.error(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID variable missing, WalletConnect disabled (browser wallets only).'
  )
}

const appInfo = {
  appName: GULLY.name,
  projectId
}

enum TargetChainKey {
  Ethereum = 'mainnet',
  ArbitrumOne = 'arbitrum-one',
  ArbitrumNova = 'arbitrum-nova',
  Base = 'base',
  Sepolia = 'sepolia',
  ArbitrumSepolia = 'arbitrum-sepolia',
  BaseSepolia = 'base-sepolia'
}

function sanitizeTargetChainKey(targetChainKey: string | null): TargetChainKey {
  // Default to Ethereum Mainnet if nothing passed in
  if (targetChainKey === null) {
    return TargetChainKey.Ethereum
  }

  // Default to Ethereum Mainnet if invalid
  if (!(Object.values(TargetChainKey) as string[]).includes(targetChainKey)) {
    return TargetChainKey.Ethereum
  }

  return targetChainKey as TargetChainKey
}

function getChainId(targetChainKey: TargetChainKey): number {
  switch (targetChainKey) {
    case TargetChainKey.Ethereum:
      return ChainId.Ethereum

    case TargetChainKey.ArbitrumOne:
      return ChainId.ArbitrumOne

    case TargetChainKey.ArbitrumNova:
      return ChainId.ArbitrumNova

    case TargetChainKey.Base:
      return ChainId.Base

    case TargetChainKey.Sepolia:
      return ChainId.Sepolia

    case TargetChainKey.ArbitrumSepolia:
      return ChainId.ArbitrumSepolia

    case TargetChainKey.BaseSepolia:
      return ChainId.BaseSepolia
  }
}

function getChains(targetChainKey: TargetChainKey) {
  const targetChainId = getChainId(targetChainKey)

  // Doing `Array.filter` instead of `Array.find` in case it's empty, just in case.
  const target = chainList.filter(chain => chain.id === targetChainId)
  const others = chainList.filter(chain => chain.id !== targetChainId)

  return [...target, ...others] as unknown as _chains
}

let cachedProps: ReturnType<typeof createConfig>
export function getProps(targetChainKey: string | null) {
  if (cachedProps) {
    return cachedProps
  }

  // Gully: without a WalletConnect project id RainbowKit's default wallets throw at startup, so fall back to
  // browser (injected) wallets only. No WalletConnect id is shipped in the repo.
  if (!projectId) {
    cachedProps = getInjectedOnlyProps(targetChainKey)
    return cachedProps
  }

  const config = getDefaultConfig({
    // Wagmi selects the first chain as the one to target in WalletConnect, so it has to be the first in the array.
    //
    // https://github.com/wagmi-dev/references/blob/main/packages/connectors/src/walletConnect.ts#L114
    ...appInfo,
    chains: getChains(sanitizeTargetChainKey(targetChainKey))
  })

  const { wallets } = getDefaultWallets()

  wallets[0]?.wallets.push(okxWallet)

  const connectors = connectorsForWallets(
    [
      ...wallets,
      {
        groupName: 'More',
        wallets: [trustWallet, rabbyWallet]
      }
    ],
    appInfo
  )

  const transports = Object.keys(rpcURLs).reduce((acc, chainId) => {
    const chainIdNumber = Number(chainId)
    acc[chainIdNumber] = http(rpcURLs[chainIdNumber])
    return acc
  }, {} as Record<number, ReturnType<typeof http>>)

  const wagmiConfig = createConfig({
    ...config,
    batch: { multicall: true },
    ssr: true,
    connectors,
    transports
  })

  cachedProps = wagmiConfig
  return cachedProps
}

function getInjectedOnlyProps(targetChainKey: string | null) {
  const chains = getChains(sanitizeTargetChainKey(targetChainKey))

  const connectors = connectorsForWallets(
    [
      {
        groupName: 'Browser wallets',
        wallets: [injectedWallet, rabbyWallet, coinbaseWallet]
      }
    ],
    { appName: appInfo.appName, projectId: '' }
  )

  const transports = chains.reduce((acc, chain) => {
    acc[chain.id] = http(rpcURLs[chain.id] ?? chain.rpcUrls.default.http[0])
    return acc
  }, {} as Record<number, ReturnType<typeof http>>)

  return createConfig({
    chains,
    batch: { multicall: true },
    ssr: true,
    connectors,
    transports
  })
}
