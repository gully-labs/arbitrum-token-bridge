import type { Metadata, Viewport } from 'next'
import { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'
import { unica } from '@/bridge/components/common/Font'
import { GULLY } from '@/bridge/gully/brand'

import '@/bridge/styles/tailwind.css'

// GullyChain brand kit, CLAUDE_PROMPT.md section 2: favicons, manifest, theme colour and absolute OG/Twitter image.
const OG_IMAGE = `${GULLY.siteUrl}/og-image.png`
const OG_ALT = 'GullyChain logo with the GullyChain mascot'

export const metadata: Metadata = {
  title: GULLY.name,
  description: GULLY.description,
  applicationName: GULLY.name,
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/android-chrome-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' }
  },
  openGraph: {
    type: 'website',
    siteName: 'GullyChain',
    title: 'GullyChain',
    description: GULLY.description,
    url: GULLY.siteUrl,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GullyChain',
    description: GULLY.description,
    images: [{ url: OG_IMAGE, alt: OG_ALT }]
  }
}

export const viewport: Viewport = {
  themeColor: GULLY.themeColor
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={twMerge('relative flex-col bg-black', unica.variable)}>
        {children}
      </body>
    </html>
  )
}
