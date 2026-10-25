import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { twMerge } from 'tailwind-merge'

export function HeaderConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <div className="w-full px-4 sm:px-0">
          <button
            onClick={openConnectModal}
            type="button"
            className={twMerge(
              'arb-hover flex w-full flex-row items-center rounded-pill border border-primary-cta bg-primary-cta px-[12px] py-2 font-bold text-black hover:bg-gc-cyan/90',
              'sm:min-h-[44px] sm:min-w-[198px] sm:bg-primary-cta sm:py-1 sm:pl-2 sm:pr-3 sm:text-base'
            )}
          >
            <PlusCircleIcon className="mr-3 h-[24px] w-[24px] stroke-1 sm:h-8 sm:w-8" />
            Connect Wallet
          </button>
        </div>
      )}
    </ConnectButton.Custom>
  )
}
