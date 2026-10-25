import type { Metadata, Viewport } from 'next'
import { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'
import {
  unica,
  gullyDisplay,
  gullyMono
} from '@/bridge/components/common/Font'
import { GULLY } from '@/bridge/gully/brand'

import '@/bridge/styles/tailwind.css'

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
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' }
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' }
  }
}

export const viewport: Viewport = {
  themeColor: GULLY.themeColor
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={twMerge(
          'relative flex-col bg-black',
          unica.variable,
          gullyDisplay.variable,
          gullyMono.variable
        )}>
        {children}
      </body>
    </html>
  )
}
