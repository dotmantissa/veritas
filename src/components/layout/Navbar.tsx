'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import { WalletButton } from '@/components/wallet/WalletButton'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  const navLinks = [
    { href: '/markets', label: 'Markets' },
    { href: '/markets/create', label: 'Create' },
    { href: '/portfolio', label: 'Portfolio' },
  ] as const

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-[rgba(8,8,8,0.8)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="group" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <span className="font-display text-xl uppercase tracking-[0.08em] text-accent sm:text-2xl">
                  <span className="mr-2 text-accent-hot">◈</span>
                  Veritas
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-text-secondary transition hover:text-text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-status-open" />
              Rialo Testnet
            </span>

            <div className="hidden md:block">
              <WalletButton />
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-transparent text-text-primary transition hover:border-text-muted hover:bg-bg-surface md:hidden"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-30 bg-bg-base md:hidden">
          <div className="flex min-h-screen flex-col px-6 pt-28">
            <nav className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-display text-4xl uppercase tracking-[0.08em] text-text-primary transition hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border py-8">
              <div className="mb-5 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-open" />
                  Rialo Testnet
                </span>
              </div>
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
