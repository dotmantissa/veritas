'use client'

import Link from 'next/link'

import { useChainStore } from '@/store/chainStore'

export function Footer() {
  const currentBlock = useChainStore((state) => state.currentBlock)

  return (
    <footer className="border-t border-border bg-bg-base">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-3xl uppercase tracking-[0.08em] text-accent">
              Veritas
            </p>
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
            <Link href="/markets" className="transition hover:text-text-primary">
              Docs
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 font-mono text-xs uppercase tracking-[0.12em] text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="mr-2 text-accent-hot">◈</span>
            Powered by Rialo
          </p>
          <p>
            <span className="mr-2 text-status-open">●</span>
            Block #{currentBlock}
          </p>
        </div>
      </div>
    </footer>
  )
}
