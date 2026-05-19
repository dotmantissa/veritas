'use client'

import Link from 'next/link'

import { WalletButton } from '@/components/wallet/WalletButton'

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="group">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/30">
                V
              </span>
              <span>
                <span className="block text-lg font-semibold tracking-tight text-white">
                  Veritas
                </span>
                <span className="block text-xs uppercase tracking-[0.28em] text-cyan-200/80">
                  Consensus Markets
                </span>
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/markets" className="transition hover:text-white">
              Markets
            </Link>
            <Link href="/markets/create" className="transition hover:text-white">
              Create
            </Link>
            <Link href="/portfolio" className="transition hover:text-white">
              Portfolio
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-100 sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Rialo Testnet
          </span>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
