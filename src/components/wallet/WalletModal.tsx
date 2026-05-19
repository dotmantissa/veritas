'use client'

import { Loader2, Mail, Phone, Sparkles, WandSparkles } from 'lucide-react'

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
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,8,8,0.82)] px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Connect to Veritas"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-card p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
              <WandSparkles className="h-3.5 w-3.5" />
              Rialo Account Abstraction
            </div>
            <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.06em] text-text-primary">
              Connect to Veritas
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Powered by Rialo account abstraction
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isConnecting}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary transition hover:border-text-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
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
                className="flex w-full items-center gap-4 rounded-xl border border-border bg-bg-surface px-4 py-4 text-left transition hover:border-text-muted hover:bg-bg-card-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-base text-accent">
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

        <p className="mt-6 text-sm text-text-muted">
          No seed phrase. No browser extension. Rialo handles key management.
        </p>
      </div>
    </div>
  )
}
