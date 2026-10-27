import { createContext, useContext } from 'react'

import {
  BridgeActivity,
  useGullyBridgeActivity
} from './useGullyBridgeActivity'
import { GullyChainTick, useGullyChainTicker } from './useGullyChainTicker'

export type GullyActivityValue = {
  activity: BridgeActivity
  tick: GullyChainTick
}

const GullyActivityContext = createContext<GullyActivityValue | null>(null)

/**
 * One live feed for every surface that shows it (stat tiles, ticker tape, sidebar panel, phone panel),
 * so the chains are polled once per page, not once per widget. Mounted by components/common/Layout.tsx.
 */
export function GullyActivityProvider({
  children
}: {
  children: React.ReactNode
}) {
  const activity = useGullyBridgeActivity()
  const tick = useGullyChainTicker()
  return (
    <GullyActivityContext.Provider value={{ activity, tick }}>
      {children}
    </GullyActivityContext.Provider>
  )
}

export function useGullyActivity(): GullyActivityValue {
  const value = useContext(GullyActivityContext)
  if (!value) {
    throw new Error(
      'useGullyActivity must be used inside GullyActivityProvider'
    )
  }
  return value
}
