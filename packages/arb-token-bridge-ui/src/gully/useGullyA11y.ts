import { useEffect } from 'react'

/**
 * Small accessibility fixes for third-party widgets the bridge mounts.
 * The WalletConnect modal (<wcm-modal>, from @walletconnect/modal) renders a role="dialog" element in its
 * shadow root without an accessible name (axe "aria-dialog-name", serious). Give it one.
 */
export function useGullyA11y() {
  useEffect(() => {
    if (typeof document === 'undefined' || !('MutationObserver' in window)) {
      return
    }

    const label = () => {
      const modal = document.querySelector('wcm-modal')
      const dialog = modal?.shadowRoot?.querySelector('#wcm-modal')
      if (dialog && !dialog.getAttribute('aria-label')) {
        dialog.setAttribute('aria-label', 'WalletConnect')
      }
    }

    label()
    const observer = new MutationObserver(label)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
}
