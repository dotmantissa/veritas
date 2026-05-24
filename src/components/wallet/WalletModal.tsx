'use client'

import { Loader2, Mail, Phone, ShieldCheck, Sparkles, WandSparkles, X } from 'lucide-react'
import { useEffect } from 'react'

const walletOptions = [
  {
    label: 'Rialo Explorer',
    title: 'Rialo Explorer Wallet',
    subtitle: 'Continue with email',
    icon: Sparkles,
  },
  {
    label: 'Alpha Tester',
    title: 'Alpha Tester Wallet',
    subtitle: 'Continue with phone',
    icon: Phone,
  },
  {
    label: 'Veritas Builder',
    title: 'Veritas Builder Wallet',
    subtitle: 'Continue with Google',
    icon: Mail,
  },
] as const

interface WalletModalProps {
  isOpen: boolean
  isConnecting: boolean
  onClose: () => void
  onConnect: (label: string) => Promise<void>
}

export function WalletModal({
  isOpen,
  isConnecting,
  onClose,
  onConnect,
}: WalletModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && !isConnecting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, isConnecting, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-[rgba(7,7,7,0.78)] px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Connect to Veritas"
      onClick={() => {
        if (!isConnecting) {
          onClose()
        }
      }}
    >
      <div
        className="fade-up relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-card p-6 shadow-card-elevated"
        onClick={(event) => event.stopPropagation()}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-accent/15 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-accent-hot/10 blur-3xl"
        />

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
              <WandSparkles className="h-3.5 w-3.5 text-accent" />
              Rialo Account Abstraction
            </div>
            <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.06em] text-text-primary">
              Connect to <span className="accent-text-gradient">Veritas</span>
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Powered by Rialo account abstraction
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isConnecting}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {walletOptions.map((option) => {
            const Icon = option.icon

            return (
              <button
                key={option.label}
                type="button"
                onClick={() => void onConnect(option.label)}
                disabled={isConnecting}
                className="group flex w-full items-center gap-4 rounded-xl border border-border bg-bg-surface px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-bg-card-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-bg-base text-accent shadow-accent-glow transition group-hover:scale-105">
                  {isConnecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </span>
                <span className="flex-1">
                  <span className="block text-base font-medium text-text-primary">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-sm text-text-secondary">
                    {isConnecting ? 'Authenticating...' : option.subtitle}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <p className="mt-6 inline-flex items-center gap-2 text-sm text-text-muted">
          <ShieldCheck className="h-4 w-4 text-status-open" />
          No seed phrase. No browser extension. Rialo handles key management.
        </p>
      </div>
    </div>
  )
}
