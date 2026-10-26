import { useLocalStorage } from '@uidotdev/usehooks'
import { Tab } from '@headlessui/react'
import { useCallback, Fragment } from 'react'

import { TransferPanel } from '../TransferPanel/TransferPanel'
import { ArbitrumStats, statsLocalStorageKey } from './ArbitrumStats'
import { SettingsDialog } from '../common/SettingsDialog'
import { TransactionHistory } from '../TransactionHistory/TransactionHistory'
import { TopNavBar } from '../TopNavBar'
import { useBalanceUpdater } from '../syncers/useBalanceUpdater'
import { useArbQueryParams } from '../../hooks/useArbQueryParams'
import { useMode } from '../../hooks/useMode'
import { RecoverFunds } from '../RecoverFunds'
import { GullyActivityPanel } from '../../gully/activity/GullyActivityPanel'
import { GullyStepper } from '../../gully/GullyStepper'
import { useGullyA11y } from '../../gully/useGullyA11y'

export function MainContent() {
  const [isArbitrumStatsVisible] =
    useLocalStorage<boolean>(statsLocalStorageKey)
  const [{ tab }, setQueryParams] = useArbQueryParams()

  const setSelectedTab = useCallback(
    (index: number) => {
      setQueryParams({ tab: index })
    },
    [setQueryParams]
  )

  useBalanceUpdater()
  useGullyA11y()

  const { embedMode } = useMode()

  if (embedMode) {
    return <TransferPanel />
  }

  return (
    <>
      <RecoverFunds />

      <div className="main-panel mx-auto flex w-full flex-col items-center gap-3 sm:pt-6">
        {/* Gully: the bridge flow at a glance (Connect, Amount, Confirm, Track) */}
        <GullyStepper className="w-full px-4 sm:max-w-[600px] sm:px-0" />
        <Tab.Group as={Fragment} selectedIndex={tab} onChange={setSelectedTab}>
          <TopNavBar />
          <Tab.Panels className="flex w-full items-center justify-center">
            <Tab.Panel className="w-full sm:max-w-[600px]">
              <TransferPanel />
            </Tab.Panel>
            <Tab.Panel className="w-full md:px-4">
              <TransactionHistory />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        {/* Gully: on phones the activity panel sits under the bridge (desktop shows it in the sidebar) */}
        <div className="w-full px-4 pb-8 sm:hidden">
          <GullyActivityPanel />
        </div>
      </div>

      {/* Settings panel */}
      <SettingsDialog />

      {/* Toggle-able Stats for nerds */}
      {isArbitrumStatsVisible && <ArbitrumStats />}
    </>
  )
}
