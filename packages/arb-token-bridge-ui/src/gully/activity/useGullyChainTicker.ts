import { useEffect, useState } from 'react'
import { GULLY } from '../brand'

export type GullyChainSample = { t: number; block: number; gasGwei: number }

export type GullyChainTick = {
  block: number | null
  gasGwei: number | null
  updatedAt: number | null
  error: string | null
  /** The last `HISTORY` samples, oldest first (for the stat-tile sparklines). */
  history: GullyChainSample[]
}

const HISTORY = 30

const INITIAL: GullyChainTick = {
  block: null,
  gasGwei: null,
  updatedAt: null,
  error: null,
  history: []
}

type RpcResult = { id: number; result?: string; error?: { message: string } }

/**
 * Live block height and gas price of GullyChain Testnet, read from the public RPC
 * (one batched eth_blockNumber + eth_gasPrice call every `intervalMs`, paused while the tab is hidden).
 */
export function useGullyChainTicker(intervalMs = 4000): GullyChainTick {
  const [tick, setTick] = useState<GullyChainTick>(INITIAL)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      if (typeof document !== 'undefined' && document.hidden) return
      try {
        const response = await fetch(GULLY.activity.chainRpcUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify([
            { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] },
            { jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: [] }
          ])
        })
        if (!response.ok) throw new Error(`RPC ${response.status}`)
        const results = (await response.json()) as RpcResult[]
        const blockHex = results.find(r => r.id === 1)?.result
        const gasHex = results.find(r => r.id === 2)?.result
        if (!blockHex || !gasHex) throw new Error('RPC returned no result')
        if (cancelled) return
        const sample: GullyChainSample = {
          t: Date.now(),
          block: Number(BigInt(blockHex)),
          gasGwei: Number(BigInt(gasHex)) / 1e9
        }
        setTick(previous => ({
          block: sample.block,
          gasGwei: sample.gasGwei,
          updatedAt: sample.t,
          error: null,
          history: [...previous.history, sample].slice(-HISTORY)
        }))
      } catch (error) {
        if (cancelled) return
        setTick(previous => ({
          ...previous,
          error: error instanceof Error ? error.message : String(error)
        }))
      }
    }

    poll()
    const id = setInterval(poll, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [intervalMs])

  return tick
}
