import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { TooltipProps } from 'recharts'
import { twMerge } from 'tailwind-merge'

import { GULLY, GC_MASCOT_SIZE, GC_MASCOT_SRC } from '../brand'
import {
  BridgeDeposit,
  BridgeTransfer,
  DEPOSIT_KIND_LABEL,
  DayBucket,
  depositsPerDay,
  formatEth,
  recentTransfers,
  relativeTime,
  shortHex,
  totalWei,
  weiToEthNumber
} from './bridgeActivity'
import { useGullyActivity } from './GullyActivityContext'

// Kit tokens (tailwind.css :root). Recharts takes literal colours, so they are repeated here.
const CYAN = '#00B2FA'
const LINE = 'rgba(138, 151, 168, 0.18)'
const MUTED = '#8A97A8'

const DAYS = 14
const RECENT_SIZES = 10
const RECENT_TRANSFERS = 20
const CHART_HEIGHT = 96

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

/** A clock that ticks every `ms`, for the relative times in the transfers list. */
function useNow(ms: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

type SizeDatum = {
  key: number
  label: string
  eth: number
  deposit: BridgeDeposit
}

type TooltipRow = { value: string; label: string; detail?: string }

/** Night card, 1px line, value first (the reader has the series and wants the number). */
function PanelTooltip<T>({
  active,
  payload,
  render
}: TooltipProps<number, string> & { render: (datum: T) => TooltipRow }) {
  const datum = payload?.[0]?.payload as T | undefined
  if (!active || datum === undefined) return null
  const row = render(datum)
  return (
    <div className="rounded-[12px] border border-gc-line bg-gc-ink px-3 py-2 text-left shadow-none">
      <p className="font-gully-numbers text-[13px] font-semibold text-white">
        {row.value}
      </p>
      <p className="text-[11px] text-gc-muted">{row.label}</p>
      {row.detail && (
        <p className="font-gully-numbers text-[11px] text-gc-muted">
          {row.detail}
        </p>
      )}
    </div>
  )
}

const axisTick = { fill: MUTED, fontSize: 10 }
const cursorFill = { fill: 'rgba(255,255,255,0.06)' }

function formatUtcDate(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(0, 16).replace('T', ' ')
}

function compactEth(value: number): string {
  if (value === 0) return '0'
  if (value < 0.001) return '<0.001'
  return value < 1 ? value.toFixed(3).replace(/0+$/, '') : value.toFixed(1)
}

function TransferRow({
  transfer,
  now,
  animate
}: {
  transfer: BridgeTransfer
  now: number
  animate: boolean
}) {
  const isDeposit = transfer.direction === 'deposit'
  const eth = formatEth(transfer.valueWei, 6)
  const when = relativeTime(transfer.timestamp, now)
  return (
    <li
      className={twMerge(
        'flex items-center gap-2 border-t border-gc-line py-[6px] first:border-t-0',
        animate && 'motion-safe:animate-gc-row-in'
      )}
    >
      <span
        aria-hidden
        className={twMerge(
          'font-gully-numbers flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-pill text-[12px] font-semibold',
          isDeposit ? 'bg-gc-cyan text-black' : 'bg-gc-blue text-white'
        )}
      >
        {isDeposit ? '↓' : '↑'}
      </span>
      <span className="flex min-w-0 grow flex-col">
        <span className="truncate text-[12px] text-white">
          <span className="sr-only">
            {isDeposit ? 'Deposit' : 'Withdrawal'}:{' '}
          </span>
          {transfer.label}
        </span>
        <span className="font-gully-numbers truncate text-[11px] text-gc-muted">
          {shortHex(transfer.sender)} · {when}
        </span>
      </span>
      <a
        href={transfer.explorerTxUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-gully-numbers shrink-0 text-[12px] text-white underline decoration-gc-line underline-offset-2 hover:decoration-gc-cyan"
        aria-label={`${transfer.label} of ${eth} ETH, ${when}, open transaction`}
      >
        {formatEth(transfer.valueWei)} ETH
      </a>
    </li>
  )
}

export function GullyActivityPanel({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion()
  const { activity, tick } = useGullyActivity()
  const now = useNow(10_000)

  const perDay = useMemo<DayBucket[]>(
    () => depositsPerDay(activity.deposits, DAYS),
    [activity.deposits]
  )
  const recentSizes = useMemo<SizeDatum[]>(
    () =>
      activity.deposits.slice(-RECENT_SIZES).map(deposit => ({
        key: deposit.messageIndex,
        label: `#${deposit.messageIndex}`,
        eth: weiToEthNumber(deposit.valueWei),
        deposit
      })),
    [activity.deposits]
  )
  const transfers = useMemo<BridgeTransfer[]>(
    () =>
      recentTransfers(
        activity.deposits,
        activity.withdrawals,
        RECENT_TRANSFERS,
        {
          parent: GULLY.activity.parentExplorerUrl,
          chain: GULLY.links.explorer
        }
      ),
    [activity.deposits, activity.withdrawals]
  )
  const total = useMemo(() => totalWei(activity.deposits), [activity.deposits])
  const transferCount = activity.deposits.length + activity.withdrawals.length
  const animate = !reducedMotion

  const openDeposit = (datum: SizeDatum) => {
    window.open(
      `${GULLY.activity.parentExplorerUrl}/tx/${datum.deposit.txHash}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <section
      aria-labelledby="gc-activity-title"
      className={twMerge('gc-card flex w-full flex-col gap-4 !p-4', className)}
    >
      <h2
        id="gc-activity-title"
        className="font-gully-label text-[12px] text-gc-muted"
      >
        GullyChain bridge activity
      </h2>

      {/* Kit mascot (trader) for the settlement message, on the page ground, faded in */}
      <div className="relative h-[84px] overflow-hidden rounded-[14px] border border-gc-line bg-black">
        <Image
          src={GC_MASCOT_SRC}
          alt=""
          aria-hidden
          width={GC_MASCOT_SIZE.width}
          height={GC_MASCOT_SIZE.height}
          unoptimized
          className="absolute -right-1 top-0 h-[84px] w-auto"
        />
        <div className="absolute inset-0 bg-gcMascotFade" aria-hidden />
        <div className="relative flex h-full flex-col justify-center px-4">
          <p className="font-gully-label text-[11px] text-gc-cyan">
            Rapid settlement
          </p>
          <p className="font-gully-display text-[15px] text-white">
            Deposits land in minutes
          </p>
          <p className="text-[11px] text-gc-muted">
            Arbitrum Sepolia to GullyChain
          </p>
        </div>
      </div>

      {/* Live ticker from the GullyChain RPC */}
      <dl className="grid grid-cols-2 gap-2">
        <div className="rounded-[14px] border border-gc-line bg-black px-3 py-2">
          <dt className="font-gully-label text-[10px] text-gc-muted">
            GullyChain block
          </dt>
          <dd className="font-gully-numbers flex items-center gap-2 text-[15px] text-white">
            <span
              aria-hidden
              className={twMerge(
                'inline-block h-[6px] w-[6px] rounded-full',
                tick.error
                  ? 'bg-gc-muted'
                  : 'bg-gc-cyan motion-safe:animate-pulse'
              )}
            />
            <span aria-live="polite">
              {tick.block === null ? '…' : tick.block.toLocaleString('en-US')}
            </span>
          </dd>
        </div>
        <div className="rounded-[14px] border border-gc-line bg-black px-3 py-2">
          <dt className="font-gully-label text-[10px] text-gc-muted">Gas</dt>
          <dd className="font-gully-numbers text-[15px] text-white">
            {tick.gasGwei === null
              ? '…'
              : `${tick.gasGwei.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                })} gwei`}
          </dd>
        </div>
      </dl>

      {/* Deposits per day */}
      <figure className="m-0 flex flex-col gap-1">
        <figcaption className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-white">
            Deposits per day
          </span>
          <span className="font-gully-numbers text-[11px] text-gc-muted">
            last {DAYS} days
          </span>
        </figcaption>
        <div className="w-full" style={{ height: CHART_HEIGHT }} aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={perDay}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              barCategoryGap={2}
            >
              <CartesianGrid vertical={false} stroke={LINE} strokeWidth={1} />
              <XAxis
                dataKey="label"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                allowDecimals={false}
                width={22}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={cursorFill}
                isAnimationActive={false}
                content={
                  <PanelTooltip<DayBucket>
                    render={d => ({
                      value: `${d.count} deposit${d.count === 1 ? '' : 's'}`,
                      label: `${d.label} (UTC)`,
                      detail: `${formatEth(d.valueWei)} ETH`
                    })}
                  />
                }
              />
              <Bar
                dataKey="count"
                fill={CYAN}
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
                isAnimationActive={animate}
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="sr-only">
          <table>
            <caption>Deposits per day, last {DAYS} days (UTC)</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Deposits</th>
                <th scope="col">ETH</th>
              </tr>
            </thead>
            <tbody>
              {perDay.map(d => (
                <tr key={d.day}>
                  <td>{d.day}</td>
                  <td>{d.count}</td>
                  <td>{formatEth(d.valueWei)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>

      {/* Recent deposit sizes */}
      <figure className="m-0 flex flex-col gap-1">
        <figcaption className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-white">
            Recent deposit sizes
          </span>
          <span className="font-gully-numbers text-[11px] text-gc-muted">
            ETH, last{' '}
            {Math.min(RECENT_SIZES, recentSizes.length) || RECENT_SIZES}
          </span>
        </figcaption>
        <div className="w-full" style={{ height: CHART_HEIGHT }} aria-hidden>
          {recentSizes.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={recentSizes}
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                barCategoryGap={2}
              >
                <CartesianGrid vertical={false} stroke={LINE} strokeWidth={1} />
                <XAxis
                  dataKey="label"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis
                  width={30}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={compactEth}
                />
                <Tooltip
                  cursor={cursorFill}
                  isAnimationActive={false}
                  content={
                    <PanelTooltip<SizeDatum>
                      render={d => ({
                        value: `${formatEth(d.deposit.valueWei, 6)} ETH`,
                        label: DEPOSIT_KIND_LABEL[d.deposit.kind],
                        detail: `${shortHex(
                          d.deposit.sender
                        )} · ${formatUtcDate(d.deposit.timestamp)}`
                      })}
                    />
                  }
                />
                <Bar
                  dataKey="eth"
                  fill={CYAN}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  minPointSize={2}
                  isAnimationActive={animate}
                  animationDuration={600}
                  className="cursor-pointer"
                  onClick={(datum: SizeDatum) => openDeposit(datum)}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-[14px] border border-gc-line text-[11px] text-gc-muted">
              {activity.loading
                ? 'Reading Arbitrum Sepolia…'
                : 'No deposits yet'}
            </div>
          )}
        </div>
        <div className="sr-only">
          <table>
            <caption>Recent deposits into GullyChain Testnet</caption>
            <thead>
              <tr>
                <th scope="col">Message</th>
                <th scope="col">Kind</th>
                <th scope="col">ETH</th>
                <th scope="col">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {recentSizes.map(d => (
                <tr key={d.key}>
                  <td>{d.label}</td>
                  <td>{DEPOSIT_KIND_LABEL[d.deposit.kind]}</td>
                  <td>{formatEth(d.deposit.valueWei, 6)}</td>
                  <td>
                    <a
                      href={`${GULLY.activity.parentExplorerUrl}/tx/${d.deposit.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortHex(d.deposit.txHash)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>

      {/* Last transfers, both directions, live */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-white">
            Last {RECENT_TRANSFERS} transfers
          </span>
          <span className="font-gully-numbers text-[11px] text-gc-muted">
            {activity.updatedAt
              ? `updated ${relativeTime(
                  Math.floor(activity.updatedAt / 1000),
                  now
                )}`
              : 'live'}
          </span>
        </div>
        {transfers.length > 0 ? (
          <ul
            aria-label="Last bridge transfers"
            className="max-h-[260px] overflow-y-auto rounded-[14px] border border-gc-line bg-black px-3"
          >
            {transfers.map(transfer => (
              <TransferRow
                key={transfer.id}
                transfer={transfer}
                now={now}
                animate={animate}
              />
            ))}
          </ul>
        ) : (
          <div className="flex h-[56px] items-center justify-center rounded-[14px] border border-gc-line text-[11px] text-gc-muted">
            {activity.loading ? 'Reading the chains…' : 'No transfers yet'}
          </div>
        )}
      </div>

      <p className="font-gully-numbers text-[11px] text-gc-muted">
        {activity.loading && transferCount === 0 ? (
          <>Reading Arbitrum Sepolia… {Math.round(activity.progress * 100)}%</>
        ) : activity.error && transferCount === 0 ? (
          <>
            Bridge events unavailable.{' '}
            <button
              type="button"
              onClick={activity.refresh}
              className="underline hover:text-white"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <span className="text-white">{activity.deposits.length}</span>{' '}
            deposit{activity.deposits.length === 1 ? '' : 's'},{' '}
            <span className="text-white">{activity.withdrawals.length}</span>{' '}
            withdrawal{activity.withdrawals.length === 1 ? '' : 's'} ·{' '}
            <span className="text-white">{formatEth(total)}</span> ETH in ·{' '}
            <a
              href={`${GULLY.activity.parentExplorerUrl}/address/${GULLY.activity.bridge}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Bridge on Arbiscan
            </a>
          </>
        )}
      </p>
    </section>
  )
}
