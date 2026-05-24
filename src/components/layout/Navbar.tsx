'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import { LogoFull } from '@/components/brand'
import { WalletButton } from '@/components/wallet/WalletButton'

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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

  useEffect(() => {
    function handleScroll(): void {
      setScrolled(window.scrollY > 8)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const navLinks = [
    { href: '/markets', label: 'Markets' },
    { href: '/markets/create', label: 'Create' },
    { href: '/portfolio', label: 'Portfolio' },
  ] as const

  function isActive(href: string): boolean {
    if (href === '/markets/create') {
      return pathname === '/markets/create'
    }
    if (href === '/markets') {
      return pathname === '/markets' || pathname?.startsWith('/markets/')
        ? pathname !== '/markets/create'
        : false
    }
    return pathname === href
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? 'border-border bg-[rgba(7,7,7,0.86)] backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]'
            : 'border-transparent bg-[rgba(7,7,7,0.55)] backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="group" onClick={() => setIsMenuOpen(false)}>
              <LogoFull size="md" />
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-full px-3 py-1.5 text-sm transition ${
                      active
                        ? 'text-text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {link.label}
                    {active ? (
                      <span className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-accent" />
                    ) : null}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-border bg-bg-surface/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted backdrop-blur-xs sm:inline-flex">
              <span className="relative inline-flex h-2 w-2 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-status-open/40 motion-safe:animate-ping" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-status-open" />
              </span>
              Rialo Testnet
            </span>

            <div className="hidden md:block">
              <WalletButton />
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-transparent text-text-primary transition hover:border-border-strong hover:bg-bg-surface md:hidden"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fade-in fixed inset-0 z-30 bg-bg-base/95 backdrop-blur-md md:hidden">
          <div className="flex min-h-screen flex-col px-6 pt-28">
            <nav className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`font-display text-4xl uppercase tracking-[0.08em] transition hover:text-accent ${
                      active ? 'text-accent' : 'text-text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
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
