import { useCallback, useEffect, useRef, useState } from 'react'
import { GULLY } from '../brand'
import {
  ARB_SYS_ADDRESS,
  BridgeDeposit,
  BridgeWithdrawal,
  INBOX_MESSAGE_DELIVERED_TOPIC,
  L2_TO_L1_TX_TOPIC,
  MESSAGE_DELIVERED_TOPIC,
  RawLog,
  buildDeposits,
  buildWithdrawals,
  chunkRanges,
  mergeDeposits,
  mergeWithdrawals
} from './bridgeActivity'

const CACHE_KEY = `gullychain:bridge:activity:v2:${GULLY.activity.fromBlock}`
/** Blocks per eth_getLogs call (Arbitrum Sepolia blocks are ~0.25s; 50k blocks is a few hours). */
const CHUNK_BLOCKS = 50_000
/** Re-read this many blocks before the cached head on every scan, in case of a reorg. */
const REORG_MARGIN = 64
const REFRESH_MS = 30_000

type Cache = {
  toBlock: number
  deposits: BridgeDeposit[]
  chainToBlock: number
  withdrawals: BridgeWithdrawal[]
}

export type BridgeActivity = {
  deposits: BridgeDeposit[]
  withdrawals: BridgeWithdrawal[]
  /** Last parent-chain block scanned for deposits. */
  scannedTo: number | null
  headBlock: number | null
  /** True while the first scan (or a catch-up) is in progress. */
  loading: boolean
  /** 0..1 of the current scan. */
  progress: number
  error: string | null
  /** Time of the last completed scan, ms. */
  updatedAt: number | null
  refresh: () => void
}

function readCache(): Cache | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Cache>
    if (
      typeof parsed.toBlock !== 'number' ||
      !Array.isArray(parsed.deposits) ||
      typeof parsed.chainToBlock !== 'number' ||
      !Array.isArray(parsed.withdrawals)
    ) {
      return null
    }
    return parsed as Cache
  } catch {
    return null
  }
}

function writeCache(cache: Cache) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage full or blocked: the panel still works, it just re-scans next time
  }
}

async function rpc<T>(
  url: string,
  method: string,
  params: unknown[]
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  if (!response.ok) throw new Error(`RPC ${response.status}`)
  const json = (await response.json()) as {
    result?: T
    error?: { message: string }
  }
  if (json.error) throw new Error(json.error.message)
  if (json.result === undefined) throw new Error('RPC returned no result')
  return json.result
}

function getLogs(
  url: string,
  address: string,
  topic: string,
  fromBlock: number,
  toBlock: number
) {
  return rpc<RawLog[]>(url, 'eth_getLogs', [
    {
      address,
      topics: [topic],
      fromBlock: '0x' + fromBlock.toString(16),
      toBlock: '0x' + toBlock.toString(16)
    }
  ])
}

async function blockNumber(url: string): Promise<number> {
  return Number(BigInt(await rpc<string>(url, 'eth_blockNumber', [])))
}

/**
 * Transfers of GullyChain Testnet, read live from the chains themselves: deposits from the Bridge/Inbox
 * events on Arbitrum Sepolia (in block chunks from the chain's deployment block) and withdrawals from
 * ArbSys.L2ToL1Tx on GullyChain. Cached in localStorage and topped up every 30 seconds.
 */
export function useGullyBridgeActivity(): BridgeActivity {
  const [deposits, setDeposits] = useState<BridgeDeposit[]>([])
  const [withdrawals, setWithdrawals] = useState<BridgeWithdrawal[]>([])
  const [scannedTo, setScannedTo] = useState<number | null>(null)
  const [headBlock, setHeadBlock] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [generation, setGeneration] = useState(0)
  const scanning = useRef(false)

  const refresh = useCallback(() => setGeneration(g => g + 1), [])

  useEffect(() => {
    let cancelled = false

    async function scan() {
      if (scanning.current) return
      scanning.current = true
      try {
        const cached = readCache()
        let knownDeposits = cached?.deposits ?? []
        let knownWithdrawals = cached?.withdrawals ?? []
        if (cached) {
          setDeposits(knownDeposits)
          setWithdrawals(knownWithdrawals)
          setScannedTo(cached.toBlock)
        }

        const [head, chainHead] = await Promise.all([
          blockNumber(GULLY.activity.parentRpcUrl),
          blockNumber(GULLY.activity.chainRpcUrl)
        ])
        if (cancelled) return
        setHeadBlock(head)

        const start = cached
          ? Math.max(GULLY.activity.fromBlock, cached.toBlock - REORG_MARGIN)
          : GULLY.activity.fromBlock
        const chainStart = cached
          ? Math.max(0, cached.chainToBlock - REORG_MARGIN)
          : 0
        const ranges = chunkRanges(start, head, CHUNK_BLOCKS)
        const chainRanges = chunkRanges(chainStart, chainHead, CHUNK_BLOCKS)
        const steps = ranges.length + chainRanges.length
        setLoading(ranges.length > 1 || !cached)
        setProgress(steps === 0 ? 1 : 0)
        let done = 0
        let toBlock = cached?.toBlock ?? start
        let chainToBlock = cached?.chainToBlock ?? chainStart

        for (const [from, to] of ranges) {
          const [bridgeLogs, inboxLogs] = await Promise.all([
            getLogs(
              GULLY.activity.parentRpcUrl,
              GULLY.activity.bridge,
              MESSAGE_DELIVERED_TOPIC,
              from,
              to
            ),
            getLogs(
              GULLY.activity.parentRpcUrl,
              GULLY.activity.inbox,
              INBOX_MESSAGE_DELIVERED_TOPIC,
              from,
              to
            )
          ])
          if (cancelled) return
          knownDeposits = mergeDeposits(
            knownDeposits,
            buildDeposits(bridgeLogs, inboxLogs)
          )
          toBlock = to
          setDeposits(knownDeposits)
          setScannedTo(to)
          setProgress(++done / steps)
          writeCache({
            toBlock,
            deposits: knownDeposits,
            chainToBlock,
            withdrawals: knownWithdrawals
          })
        }

        for (const [from, to] of chainRanges) {
          const logs = await getLogs(
            GULLY.activity.chainRpcUrl,
            ARB_SYS_ADDRESS,
            L2_TO_L1_TX_TOPIC,
            from,
            to
          )
          if (cancelled) return
          knownWithdrawals = mergeWithdrawals(
            knownWithdrawals,
            buildWithdrawals(logs)
          )
          chainToBlock = to
          setWithdrawals(knownWithdrawals)
          setProgress(++done / steps)
          writeCache({
            toBlock,
            deposits: knownDeposits,
            chainToBlock,
            withdrawals: knownWithdrawals
          })
        }
        setError(null)
        setUpdatedAt(Date.now())
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        scanning.current = false
        if (!cancelled) setLoading(false)
      }
    }

    scan()
    const id = setInterval(() => {
      if (typeof document === 'undefined' || !document.hidden) scan()
    }, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [generation])

  return {
    deposits,
    withdrawals,
    scannedTo,
    headBlock,
    loading,
    progress,
    error,
    updatedAt,
    refresh
  }
}
