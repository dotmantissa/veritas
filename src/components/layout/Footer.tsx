'use client'

import Link from 'next/link'

import { LogoFull } from '@/components/brand'
import { useChainStore } from '@/store/chainStore'

export function Footer() {
  const currentBlock = useChainStore((state) => state.currentBlock)

  return (
    <footer className="relative border-t border-border bg-bg-base">
      <div className="gradient-divider absolute inset-x-12 top-0" />
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <LogoFull size="lg" />
            <p className="mt-3 max-w-sm text-sm text-text-muted">
              Truth from consensus. Not gatekeepers.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-muted">
            <Link href="/markets" className="transition hover:text-text-primary">
              Markets
            </Link>
            <Link href="/markets/create" className="transition hover:text-text-primary">
              Create
            </Link>
            <Link href="/portfolio" className="transition hover:text-text-primary">
              Portfolio
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 font-mono text-xs uppercase tracking-[0.12em] text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2">
            <span className="text-accent-hot">◈</span>
            Powered by Rialo
          </p>
          <p className="inline-flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-status-open/40 motion-safe:animate-ping" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-status-open" />
            </span>
            Block #{currentBlock}
          </p>
        </div>
      </div>
    </footer>
  )
}
