import { Tab } from '@headlessui/react'
import { ArrowLeftRight, History } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'
import { useTransactionReminderInfo } from './TransactionHistory/useTransactionReminderInfo'

// Gully: every nav item carries a 20px Lucide icon (stroke 1.75), muted by default, cyan when active.
function StyledTab({ children, ...props }: PropsWithChildren) {
  return (
    <Tab
      className="flex h-full min-h-[40px] items-center justify-center gap-2 rounded-pill p-1 text-base font-semibold text-gc-muted ui-selected:bg-black ui-selected:text-white"
      {...props}
    >
      {children}
    </Tab>
  )
}

StyledTab.displayName = 'StyledTab'

const navIconClassName = 'text-gc-muted ui-selected:text-gc-cyan'

export function TopNavBar() {
  const { colorClassName } = useTransactionReminderInfo()

  return (
    <Tab.List
      className={twMerge(
        'grid w-full max-w-[600px] grid-cols-2 border-y border-gc-line bg-gc-ink p-[6px] text-white md:rounded-pill md:border'
      )}
    >
      <StyledTab aria-label="Switch to Bridge Tab">
        <ArrowLeftRight
          size={20}
          strokeWidth={1.75}
          aria-hidden
          className={navIconClassName}
        />
        Bridge
      </StyledTab>
      <StyledTab aria-label="Switch to Transaction History Tab">
        <History
          size={20}
          strokeWidth={1.75}
          aria-hidden
          className={navIconClassName}
        />
        Txn History{' '}
        <span
          className={twMerge('h-3 w-3 rounded-full', colorClassName.light)}
        />
      </StyledTab>
    </Tab.List>
  )
}
