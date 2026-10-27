import { useState } from 'react'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  ArrowLeftRight,
  AtSign,
  FlaskConical,
  GitFork,
  Github,
  Globe,
  ScanSearch,
  Zap
} from 'lucide-react'

import { GULLY, GC_BADGE_POWERED, GL_BADGE_POWERED, GC_LOGO_SIZE, GC_LOGO_SRC } from './brand'
import { GullyActivityPanel } from './activity/GullyActivityPanel'

/**
 * Replaces the Arbitrum-branded sidebar from @offchainlabs/cobalt (its logo, links and footer are hardcoded
 * inside the package and cannot be themed). Wrapped by AppSidebar.tsx and AppMobileSidebar.tsx.
 * Brand: GullyChain kit. The header logo is the kit's transparent 3D logo at 40px (width auto, explicit
 * width/height attributes so nothing shifts); the footer carries the kit's "Powered by GullyChain" badge.
 * Every nav and footer item carries a 20px Lucide icon (stroke 1.75): muted by default, cyan when active.
 */

const ICON = { size: 20, strokeWidth: 1.75, 'aria-hidden': true } as const
const navIconClassName =
  'shrink-0 text-gc-muted transition-colors group-hover:text-gc-cyan group-focus-visible:text-gc-cyan'

const NAV_LINKS = [
  { title: 'GullyChain', href: GULLY.links.website, Icon: Globe },
  { title: 'Explorer', href: GULLY.links.explorer, Icon: ScanSearch },
  { title: 'Gully Labs', href: GULLY.links.labs, Icon: FlaskConical },
  { title: `X ${GULLY.links.xHandle}`, href: GULLY.links.x, Icon: AtSign },
  { title: 'GitHub', href: GULLY.links.github, Icon: Github }
]

export function GullyWordmark({ className }: { className?: string }) {
  return (
    <a
      href={GULLY.links.website}
      aria-label="GullyChain"
      className={twMerge('inline-flex items-center', className)}
    >
      <Image
        src={GC_LOGO_SRC}
        alt="GullyChain"
        width={GC_LOGO_SIZE.width}
        height={GC_LOGO_SIZE.height}
        unoptimized
        priority
        className="h-10 w-auto"
      />
    </a>
  )
}

function SidebarMenu({ children }: { children?: React.ReactNode }) {
  return (
    <nav aria-label="GullyChain" className="flex w-full flex-col gap-2 px-4">
      <div
        aria-current="page"
        className="flex items-center gap-3 rounded-[14px] border border-gc-line bg-gc-ink px-4 py-3 text-white"
      >
        <ArrowLeftRight {...ICON} className="shrink-0 text-gc-cyan" />
        <span className="font-semibold">{GULLY.name}</span>
        <span className="gc-badge font-gully-label ml-auto text-[11px]">
          Testnet
        </span>
      </div>
      {children}
      <div className="my-1 border-t border-gc-line" />
      {NAV_LINKS.map(({ title, href, Icon }) => (
        <a
          key={title}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-pill px-4 py-2 text-sm text-white/80 transition-colors hover:bg-gc-ink hover:text-white"
        >
          <Icon {...ICON} className={navIconClassName} />
          <span>{title}</span>
          <span aria-hidden className="ml-auto text-gc-muted">
            ↗
          </span>
        </a>
      ))}
    </nav>
  )
}

function SidebarFooter() {
  return (
    <div className="flex flex-col gap-2 px-5 pb-5 text-xs text-gc-muted">
      <a
        href={GULLY.poweredBy.href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-gully-label group flex items-center gap-2 text-[11px] hover:text-white"
      >
        <Zap {...ICON} className={navIconClassName} />
        {GULLY.poweredBy.label}
      </a>
      <a
        href={GULLY.links.labs}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 hover:text-white"
      >
        <FlaskConical {...ICON} className={navIconClassName} />
        By Gully Labs
      </a>
      <a
        href="https://github.com/OffchainLabs/arbitrum-token-bridge"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 hover:text-white"
      >
        <GitFork {...ICON} className={navIconClassName} />
        Fork of the Arbitrum token bridge
      </a>
      <p>
        Arbitrum token bridge by Offchain Labs, Apache-2.0. Arbitrum is a
        trademark of its owners.
      </p>
      {/* Kit badge (section 5): vector SVG with PNG fallbacks, scaled proportionally to 142x42 */}
      <a
        href={GULLY.links.website}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GC_BADGE_POWERED.svg}
          srcSet={GC_BADGE_POWERED.srcSet}
          width={GC_BADGE_POWERED.width}
          height={GC_BADGE_POWERED.height}
          alt="Powered by GullyChain"
          className="h-[42px] w-[142px]"
        />
      </a>
      <a
        href={GULLY.links.labs}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Powered by Gully Labs (opens in a new tab)"
        className="mt-1 inline-block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GL_BADGE_POWERED.src}
          srcSet={GL_BADGE_POWERED.srcSet}
          width={GL_BADGE_POWERED.width}
          height={GL_BADGE_POWERED.height}
          alt="Powered by Gully Labs"
          loading="lazy"
          className="h-[32px] w-[127px]"
        />
      </a>
    </div>
  )
}

export function GullySidebar() {
  return (
    <div className="relative flex h-screen w-[300px] flex-col overflow-y-auto border-r border-gc-line bg-black pt-6">
      <div className="px-5 pb-6">
        <GullyWordmark />
      </div>
      <SidebarMenu />
      <div className="px-4 pt-4">
        <GullyActivityPanel />
      </div>
      <div className="min-h-[20px] flex-grow" />
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
        className="flex h-[42px] w-[42px] items-center justify-center rounded-pill bg-transparent p-[8px]"
        aria-label="Menu Toggle Button"
        onClick={() => {
          document.body.classList.add('overflow-hidden')
          setOpen(true)
        }}
      >
        <Bars3Icon className="h-6 w-6 text-white" />
      </button>
      {open && (
        <div className="fixed left-0 top-0 z-[10000] flex h-screen w-full flex-col overflow-y-auto bg-black">
          <div className="flex w-full items-center justify-between p-4">
            <GullyWordmark />
            <button
              className="flex h-[60px] w-[60px] items-center justify-center rounded-pill hover:bg-gc-ink"
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
