import { useConnectModal } from '@rainbow-me/rainbowkit'

import { Wallet } from 'lucide-react'
import { Button } from '../common/Button'

export function ConnectWalletButton({ onClick }: { onClick?: () => void }) {
  const { openConnectModal } = useConnectModal()

  return (
    <Button
      variant="primary"
      onClick={onClick ?? openConnectModal}
      icon={<Wallet size={20} strokeWidth={1.75} aria-hidden />}
      showArrow
      className="w-full py-3 text-lg lg:text-2xl"
    >
      <span className="block w-full truncate">Connect Wallet</span>
    </Button>
  )
}
