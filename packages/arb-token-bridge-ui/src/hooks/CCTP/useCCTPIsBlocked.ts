import useSWRImmutable from 'swr/immutable'
import { ChainId } from '../../types/ChainId'
import { getCctpUtils } from '@/token-bridge-sdk/cctp'
import { GULLY_CHAIN_IDS } from '../../gully/brand'
import { useNetworks } from '../useNetworks'

export function useCCTPIsBlocked() {
  const [{ sourceChain, destinationChain }] = useNetworks()
  // Gully: CCTP never runs on a Gully chain (no native USDC there), so don't probe Circle's API for those pairs.
  // The probe sends an empty hash on purpose and Circle answers 400, which showed up as an error on every page load.
  const isGullyPair =
    GULLY_CHAIN_IDS.includes(sourceChain.id) ||
    GULLY_CHAIN_IDS.includes(destinationChain.id)

  const { fetchAttestation } = getCctpUtils({ sourceChainId: ChainId.Ethereum })
  return useSWRImmutable(isGullyPair ? null : ['cctp-check'], async () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful
    // Circle API returns 403 with Cors error for unauthorized users which throws instantly.
    // All successful calls are assumed to be authorized users
    try {
      await fetchAttestation('0x')
      return false
    } catch (_) {
      return true
    }
  })
}
