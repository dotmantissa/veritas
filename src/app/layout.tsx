import './globals.css'

import type { Metadata } from 'next'
import { Bebas_Neue, DM_Mono, DM_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { TxToast } from '@/components/wallet/TxToast'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Veritas',
  description: 'Mock Rialo testnet prediction market dApp',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="bg-bg-base font-body text-text-primary antialiased">
        <div className="veritas-grid min-h-screen">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-28 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
        <TxToast />
      </body>
    </html>
  )
}
