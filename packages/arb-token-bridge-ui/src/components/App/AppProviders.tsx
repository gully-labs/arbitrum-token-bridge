import { ReactNode, useMemo } from 'react'
import { Provider as OvermindProvider } from 'overmind-react'
import { WagmiProvider } from 'wagmi'
import { darkTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit'
import merge from 'lodash-es/merge'
import { createOvermind } from 'overmind'

import { config } from '../../state'
import { ArbQueryParamProvider } from '../../hooks/useArbQueryParams'
import { AppContextProvider } from './AppContext'
import { getProps } from '../../util/wagmi/setup'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig } from '@lifi/sdk'
import { INTEGRATOR_ID } from '@/bridge/app/api/crosschain-transfers/lifi'

const rainbowkitTheme = merge(darkTheme(), {
  colors: {
    // GullyChain kit: cyan primary action with black text, night surfaces, 1px line borders, muted text
    accentColor: '#01D9FA',
    accentColorForeground: '#000000',
    modalBackground: '#0A0F1A',
    modalBorder: '#16213A',
    generalBorder: '#16213A',
    modalText: '#FFFFFF',
    modalTextSecondary: '#9FB3CC',
    menuItemBackground: '#111A2E',
    connectButtonBackground: '#0A0F1A',
    connectButtonText: '#FFFFFF'
  },
  radii: {
    // pills for buttons, 22px for cards/modals
    actionButton: '9999px',
    connectButton: '9999px',
    menuButton: '9999px',
    modal: '22px',
    modalMobile: '22px'
  },
  fonts: {
    body: 'var(--font-family, var(--font-unica77), Roboto, sans-serif)'
  }
} as Theme)

// We're doing this as a workaround so users can select their preferred chain on WalletConnect.
//
// https://github.com/orgs/WalletConnect/discussions/2733
// https://github.com/wagmi-dev/references/blob/main/packages/connectors/src/walletConnect.ts#L114
const searchParams = new URLSearchParams(window.location.search)
const targetChainKey = searchParams.get('sourceChain')

const wagmiConfig = getProps(targetChainKey)

// Clear cache for everything related to WalletConnect v2.
//
// TODO: Remove this once the fix for the infinite loop / memory leak is identified.
Object.keys(localStorage).forEach(key => {
  if (
    key === 'wagmi.requestedChains' ||
    key === 'wagmi.store' ||
    key.startsWith('wc@2')
  ) {
    localStorage.removeItem(key)
  }
})

interface AppProvidersProps {
  children: ReactNode
}

const queryClient = new QueryClient()

createConfig({ integrator: INTEGRATOR_ID })
export function AppProviders({ children }: AppProvidersProps) {
  const overmind = useMemo(() => createOvermind(config), [])

  return (
    <OvermindProvider value={overmind}>
      <ArbQueryParamProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={rainbowkitTheme}>
              <AppContextProvider>{children}</AppContextProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ArbQueryParamProvider>
    </OvermindProvider>
  )
}
