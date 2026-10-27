import { useAccount } from 'wagmi'
import { Check, CheckCircle2, Coins, Radar, Wallet } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import { useArbQueryParams } from '../hooks/useArbQueryParams'
import { useAppContextState } from '../components/App/AppContext'

/**
 * The bridge flow at a glance (owner rule): Connect -> Amount -> Confirm -> Track. Purely presentational;
 * the current step is read from the wallet connection, the amount query param, the transfer-in-flight flag
 * and the selected tab. It never drives the bridge.
 */
const STEPS = [
  { label: 'Connect', Icon: Wallet },
  { label: 'Amount', Icon: Coins },
  { label: 'Confirm', Icon: CheckCircle2 },
  { label: 'Track', Icon: Radar }
] as const

export function useBridgeStep(): number {
  const { isConnected } = useAccount()
  const [{ amount, tab }] = useArbQueryParams()
  const {
    layout: { isTransferring }
  } = useAppContextState()

  if (tab === 1) return 3
  if (!isConnected) return 0
  if (isTransferring) return 2
  if (Number(amount) > 0) return 2
  return 1
}

export function GullyStepper({ className }: { className?: string }) {
  const current = useBridgeStep()

  return (
    <nav aria-label="Bridge steps" className={className}>
      <ol className="flex items-center gap-1">
        {STEPS.map(({ label, Icon }, index) => {
          const done = index < current
          const active = index === current
          return (
            <li
              key={label}
              className={twMerge(
                'flex min-w-0 items-center gap-1',
                index < STEPS.length - 1 && 'flex-1'
              )}
              aria-current={active ? 'step' : undefined}
            >
              <span className="flex items-center gap-2">
                <span
                  className={twMerge(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-pill border transition-colors',
                    done && 'border-gc-cyan bg-gc-cyan text-black',
                    active && 'border-gc-cyan bg-black text-gc-cyan',
                    !done && !active && 'border-gc-line bg-black text-gc-muted'
                  )}
                >
                  {done ? (
                    <Check size={16} strokeWidth={2} aria-hidden />
                  ) : (
                    <Icon size={16} strokeWidth={1.75} aria-hidden />
                  )}
                </span>
                <span className="sr-only">
                  {done ? 'Done: ' : active ? 'Current step: ' : ''}
                  {label}
                </span>
                <span
                  aria-hidden
                  className={twMerge(
                    'font-gully-label text-[11px]',
                    active ? 'text-white' : 'hidden text-gc-muted sm:inline'
                  )}
                >
                  {label}
                </span>
              </span>
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={twMerge(
                    'mx-1 h-px min-w-[6px] flex-1 sm:mx-2',
                    done ? 'bg-gc-cyan' : 'bg-gc-line'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
