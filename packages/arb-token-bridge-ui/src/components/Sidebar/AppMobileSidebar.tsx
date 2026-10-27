import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { MenuItem } from '@offchainlabs/cobalt'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { AccountMenuItem } from './AccountMenuItem'
import { GullyMobileSidebar } from '../../gully/GullySidebar'

export const AppMobileSidebar: React.FC<React.PropsWithChildren> = () => {
  const { isConnected } = useAccount()

  return (
    <div className="flex flex-col justify-center sm:hidden">
      <GullyMobileSidebar>
        {isConnected ? (
          <AccountMenuItem />
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <MenuItem
                title="Connect Wallet"
                onClick={openConnectModal}
                Icon={<PlusCircleIcon className="h-[24px] w-[24px] stroke-1" />}
                className="rounded-pill border-primary-cta bg-primary-cta py-3 font-bold text-black"
                isMobile
              />
            )}
          </ConnectButton.Custom>
        )}
      </GullyMobileSidebar>
    </div>
  )
}
