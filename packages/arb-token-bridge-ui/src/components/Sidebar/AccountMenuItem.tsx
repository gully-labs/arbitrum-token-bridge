import { ExternalLink, LogOut, Settings } from 'lucide-react'
import { MenuItem, MenuItemExpandable } from '@offchainlabs/cobalt'

import { getExplorerUrl } from '../../util/networks'
import { SafeImage } from '../common/SafeImage'
import { useAccountMenu } from '../../hooks/useAccountMenu'
import { CustomBoringAvatar } from '../common/CustomBoringAvatar'

export const AccountMenuItem = () => {
  const {
    address,
    accountShort,
    ensName,
    ensAvatar,
    disconnect,
    udInfo,
    chain,
    setQueryParams
  } = useAccountMenu()

  return (
    <MenuItemExpandable
      title={ensName ?? udInfo.name ?? accountShort}
      isMobile
      Icon={
        <SafeImage
          src={ensAvatar || undefined}
          className="h-6 w-6 rounded-full sm:h-8 sm:w-8"
          fallback={<CustomBoringAvatar size={24} name={address} />}
        />
      }
    >
      {chain && (
        <MenuItem
          title="Explorer"
          Icon={
            <ExternalLink
              size={20}
              strokeWidth={1.75}
              aria-hidden
              className="text-gc-muted"
            />
          }
          href={`${getExplorerUrl(chain.id)}/address/${address}`}
          isMobile
        />
      )}
      <MenuItem
        title="Settings"
        Icon={
          <Settings
            size={20}
            strokeWidth={1.75}
            aria-hidden
            className="text-gc-muted"
          />
        }
        onClick={() => setQueryParams({ settingsOpen: true })}
        isMobile
      />
      <MenuItem
        title="Disconnect"
        Icon={
          <LogOut
            size={20}
            strokeWidth={1.75}
            aria-hidden
            className="text-gc-muted"
          />
        }
        onClick={() => disconnect()}
        isMobile
      />
    </MenuItemExpandable>
  )
}
