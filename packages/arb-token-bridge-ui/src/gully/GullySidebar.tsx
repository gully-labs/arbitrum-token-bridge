import { useState } from 'react'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { GULLY, GULLY_LOCKUP_SRC } from './brand'

/**
 * Replaces the Arbitrum-branded sidebar from @offchainlabs/cobalt (its logo, links and footer are hardcoded
 * inside the package and cannot be themed). Wrapped by AppSidebar.tsx and AppMobileSidebar.tsx.
 * The logo is the Gully Labs kit lockup, unmodified (minimum width per the kit: 180px).
 */

const NAV_LINKS = [
  { title: 'Website', href: GULLY.links.website },
  { title: 'Docs', href: GULLY.links.docs },
  { title: `X ${GULLY.links.xHandle}`, href: GULLY.links.x },
  { title: 'GitHub', href: GULLY.links.github }
]

export function GullyLogo({ className }: { className?: string }) {
  return (
    <a href={GULLY.links.website} aria-label={`${GULLY.name} by Gully Labs`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GULLY_LOCKUP_SRC}
        alt="Gully Labs"
        width={1245}
        height={439}
        className={twMerge('h-auto w-[200px]', className)}
      />
    </a>
  )
}

function SidebarMenu({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="flex w-full flex-col gap-2 px-4">
      <div className="flex items-center gap-3 rounded border border-lab-gold/40 bg-lab-gold/10 px-3 py-3 text-white">
        <Image
          src="/icons/bridge.svg"
          alt=""
          width={20}
          height={20}
          aria-hidden
        />
        <span className="font-gully-display text-xl tracking-wide">
          {GULLY.name}
        </span>
      </div>
      {children}
      <div className="my-2 border-t border-slate" />
      {NAV_LINKS.map(link => (
        <a
          key={link.title}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-pale-gold"
        >
          {link.title} <span aria-hidden>↗</span>
        </a>
      ))}
    </nav>
  )
}

function SidebarFooter() {
  return (
    <div className="flex flex-col gap-2 px-5 pb-5 text-xs text-gray-5">
      <a
        href={GULLY.poweredBy.href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-gully-mono text-[11px] uppercase tracking-[0.14em] hover:text-pale-gold"
      >
        {GULLY.poweredBy.label}
      </a>
      <p>
        By{' '}
        <a
          className="text-lab-gold hover:text-pale-gold"
          href={GULLY.links.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          Gully Labs
        </a>
        . Fork of the{' '}
        <a
          className="underline hover:text-pale-gold"
          href="https://github.com/OffchainLabs/arbitrum-token-bridge"
          target="_blank"
          rel="noopener noreferrer"
        >
          Arbitrum token bridge
        </a>
        , Apache-2.0. Arbitrum is a trademark of its owners.
      </p>
    </div>
  )
}

export function GullySidebar() {
  return (
    <div className="relative flex h-screen w-[256px] flex-col border-r border-slate bg-black pt-6">
      <div className="px-6 pb-10">
        <GullyLogo />
      </div>
      <SidebarMenu />
      <div className="flex-grow" />
      <SidebarFooter />
    </div>
  )
}

export function GullyMobileSidebar({
  children
}: {
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  const close = () => {
    document.body.classList.remove('overflow-hidden')
    setOpen(false)
  }

  return (
    <>
      <button
        className="flex h-[42px] w-[42px] items-center justify-center rounded-md bg-transparent p-[8px]"
        aria-label="Menu Toggle Button"
        onClick={() => {
          document.body.classList.add('overflow-hidden')
          setOpen(true)
        }}
      >
        <Bars3Icon className="h-6 w-6 text-white" />
      </button>
      {open && (
        <div className="fixed left-0 top-0 z-[10000] flex h-screen w-full flex-col bg-black">
          <div className="flex w-full items-center justify-between p-4">
            <GullyLogo className="w-[180px]" />
            <button
              className="flex h-[60px] w-[60px] items-center justify-center rounded-md hover:bg-white/10"
              aria-label="Close menu"
              onClick={close}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="pt-4">
            <SidebarMenu>{children}</SidebarMenu>
          </div>
          <div className="flex-grow" />
          <SidebarFooter />
        </div>
      )}
    </>
  )
}
