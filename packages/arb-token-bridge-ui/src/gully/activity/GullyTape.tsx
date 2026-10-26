import { useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import { GULLY } from '../brand'
import {
  BridgeTransfer,
  formatEth,
  recentTransfers,
  relativeTime,
  shortHex
} from './bridgeActivity'
import { useGullyActivity } from './GullyActivityContext'

const LIMIT = 20

/**
 * Ticker strip of the last transfers in the landing's language: 38px night tape with a fixed label,
 * items in Exo 2 tabular, sliding left (60s loop, paused on hover/focus, static under reduced motion).
 */
export function GullyTape({ className }: { className?: string }) {
  const { activity } = useGullyActivity()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000)
    return () => clearInterval(id)
  }, [])

  const transfers = useMemo<BridgeTransfer[]>(
    () =>
      recentTransfers(activity.deposits, activity.withdrawals, LIMIT, {
        parent: GULLY.activity.parentExplorerUrl,
        chain: GULLY.links.explorer
      }),
    [activity.deposits, activity.withdrawals]
  )

  return (
    <div
      aria-label="Latest bridge transfers"
      className={twMerge(
        'relative flex h-[38px] items-center overflow-hidden border border-gc-line bg-gc-ink',
        className
      )}
    >
      <span className="font-gully-label absolute bottom-0 left-0 top-0 z-[3] flex items-center border-r border-gc-line bg-gc-ink px-3 text-[12.5px] text-gc-cyan">
        Transfers
      </span>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 top-0 z-[2] w-10 bg-gradient-to-l from-gc-ink to-transparent"
      />
      <div
        className={twMerge(
          'flex whitespace-nowrap will-change-transform',
          transfers.length > 0
            ? 'focus-within:[animation-play-state:paused] hover:[animation-play-state:paused] motion-safe:animate-gc-tape motion-safe:pl-[100%] motion-reduce:overflow-x-auto motion-reduce:pl-[104px]'
            : 'pl-[104px]'
        )}
      >
        {transfers.length === 0 && (
          <span className="font-gully-numbers inline-flex items-center px-[22px] text-[13px] text-gc-muted">
            {activity.loading
              ? 'Reading Arbitrum Sepolia and GullyChain…'
              : 'No transfers yet'}
          </span>
        )}
        {transfers.map(transfer => {
          const isDeposit = transfer.direction === 'deposit'
          const Icon = isDeposit ? ArrowDownToLine : ArrowUpFromLine
          return (
            <a
              key={transfer.id}
              href={transfer.explorerTxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-gully-numbers inline-flex items-center gap-2 border-r border-gc-line px-[22px] text-[13px] text-gc-muted no-underline hover:text-white"
            >
              <Icon
                size={14}
                strokeWidth={1.75}
                aria-hidden
                className={isDeposit ? 'text-gc-cyan' : 'text-gc-blue'}
              />
              <b className="font-semibold text-white">
                {formatEth(transfer.valueWei)} ETH
              </b>
              <span>{transfer.label}</span>
              <span>{shortHex(transfer.sender)}</span>
              <span>{relativeTime(transfer.timestamp, now)}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
