import type { Metadata, Viewport } from 'next'
import { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'
import {
  unica,
  gullyDisplay,
  gullyLabel,
  gullyNumbers,
  gullyTagline
} from '@/bridge/components/common/Font'
import { GULLY } from '@/bridge/gully/brand'

import '@/bridge/styles/tailwind.css'

// GullyChain brand kit v2, section 6: favicons, theme colour and the default Open Graph image.
export const metadata: Metadata = {
  title: GULLY.name,
  description: GULLY.description,
  applicationName: GULLY.name,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/favicon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon-512.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' }
  },
  openGraph: {
    title: 'GullyChain',
    description: GULLY.tagline,
    url: GULLY.siteUrl,
    type: 'website',
    images: [{ url: `${GULLY.siteUrl}/og-image.png`, width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GullyChain',
    description: GULLY.tagline,
    images: [`${GULLY.siteUrl}/og-image.png`]
  }
}

export const viewport: Viewport = {
  themeColor: GULLY.themeColor
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body
        className={twMerge(
          'relative flex-col bg-black',
          unica.variable,
          gullyDisplay.variable,
          gullyLabel.variable,
          gullyNumbers.variable,
          gullyTagline.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}
