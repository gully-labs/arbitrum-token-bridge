import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

import {
  depositsPerDay,
  formatEth,
  totalWei,
  weiToEthNumber
} from './bridgeActivity'
import { sparkBars, sparkLine } from './sparkline'
import { useGullyActivity } from './GullyActivityContext'

const DAYS = 14

/**
 * Chart-led header in the landing's "Direction A: Terminal" language: a strip of stat tiles (Exo 2
 * 600 uppercase label, Exo 2 800 value, 40px sparkline, tabular sub line) on a hairline grid.
 * Sparklines: royal line/area with a cyan end dot, or royal bars with the last one cyan.
 */

function LineSpark({ values, title }: { values: number[]; title: string }) {
  const { line, area, last } = sparkLine(values)
  return (
    <svg
      className="gc-spark block h-10 w-full overflow-visible"
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <title>{title}</title>
      {area && <path d={area} className="fill-gc-blue opacity-[0.12]" />}
      {line && (
        <path
          d={line}
          fill="none"
          className="stroke-gc-blue"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {last && (
        <circle
          cx={last.x}
          cy={last.y}
          r={3}
          className="fill-gc-cyan stroke-black"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}

function BarSpark({ values, title }: { values: number[]; title: string }) {
  const bars = sparkBars(values)
  return (
    <svg
      className="gc-spark block h-10 w-full"
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <title>{title}</title>
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.width}
          height={b.height}
          className={i === bars.length - 1 ? 'fill-gc-cyan' : 'fill-gc-blue'}
        />
      ))}
    </svg>
  )
}

function Tile({
  label,
  value,
  unit,
  sub,
  children
}: {
  label: string
  value: string
  unit?: string
  sub: string
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-w-0 flex-col gap-[6px] overflow-hidden border-b border-r border-gc-line px-[14px] pb-[10px] pt-3 last:border-r-0 sm:border-b-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r">
      <span className="font-gully-label text-[12.5px] text-gc-muted">
        {label}
      </span>
      <div className="font-gully-display text-[clamp(22px,2vw,30px)] leading-none text-white [font-variant-numeric:tabular-nums]">
        {value}
        {unit && (
          <small className="ml-[6px] font-unica77 text-[12px] font-normal tracking-normal text-gc-muted">
            {unit}
          </small>
        )}
      </div>
      {children}
      <span className="font-gully-numbers text-[12px] text-gc-muted">
        {sub}
      </span>
    </div>
  )
}

export function GullyStatsStrip({ className }: { className?: string }) {
  const { activity, tick } = useGullyActivity()

  const perDay = useMemo(
    () => depositsPerDay(activity.deposits, DAYS),
    [activity.deposits]
  )
  const countsPerDay = useMemo(() => perDay.map(d => d.count), [perDay])
  const ethPerDay = useMemo(
    () => perDay.map(d => weiToEthNumber(d.valueWei)),
    [perDay]
  )
  const last14 = countsPerDay.reduce((a, b) => a + b, 0)
  const totalEth = useMemo(
    () => totalWei(activity.deposits),
    [activity.deposits]
  )
  const blockHistory = useMemo(
    () => tick.history.map(h => h.block),
    [tick.history]
  )
  const gasHistory = useMemo(
    () => tick.history.map(h => h.gasGwei),
    [tick.history]
  )
  const span = tick.history.length
    ? Math.round(
        ((tick.history[tick.history.length - 1]?.t ?? 0) -
          (tick.history[0]?.t ?? 0)) /
          1000
      )
    : 0

  return (
    <section
      aria-label="Live GullyChain bridge numbers"
      className={twMerge(
        'grid grid-cols-2 border border-gc-line bg-black sm:grid-cols-4',
        className
      )}
    >
      <Tile
        label="Latest block"
        value={tick.block === null ? '…' : tick.block.toLocaleString('en-US')}
        sub={span > 0 ? `height, last ${span}s` : 'GullyChain Testnet'}
      >
        <LineSpark values={blockHistory} title="Block height, recent polls" />
      </Tile>
      <Tile
        label="Gas"
        value={
          tick.gasGwei === null
            ? '…'
            : tick.gasGwei.toLocaleString('en-US', { maximumFractionDigits: 2 })
        }
        unit="gwei"
        sub="base fee, recent polls"
      >
        <LineSpark values={gasHistory} title="Gas price, recent polls" />
      </Tile>
      <Tile
        label="Deposits"
        value={activity.deposits.length.toLocaleString('en-US')}
        unit={`${last14} in ${DAYS}d`}
        sub="per day, Arbitrum Sepolia to GullyChain"
      >
        <BarSpark
          values={countsPerDay}
          title={`Deposits per day, last ${DAYS} days`}
        />
      </Tile>
      <Tile
        label="ETH bridged in"
        value={formatEth(totalEth)}
        unit="ETH"
        sub="per day, since launch"
      >
        <BarSpark
          values={ethPerDay}
          title={`ETH deposited per day, last ${DAYS} days`}
        />
      </Tile>
    </section>
  )
}
