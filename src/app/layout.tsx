import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { TxToast } from '@/components/wallet/TxToast'

export const metadata: Metadata = {
  title: 'Veritas',
  description: 'Mock Rialo testnet prediction market dApp',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <div className="veritas-grid min-h-screen">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
        <TxToast />
      </body>
    </html>
  )
}
