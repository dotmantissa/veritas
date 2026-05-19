'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  Loader2,
  LogOut,
  MoveRight,
  XCircle,
} from 'lucide-react'

import { disconnectWallet } from '@/lib/mock/wallet'
import { formatAddress, formatRIALO } from '@/lib/utils'
import { useWalletStore } from '@/store/walletStore'

import { WalletModal } from './WalletModal'

export function WalletButton() {
  const wallet = useWalletStore((state) => state.wallet)
  const isConnecting = useWalletStore((state) => state.isConnecting)
  const txHistory = useWalletStore((state) => state.txHistory)
  const connect = useWalletStore((state) => state.connect)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  async function handleConnect(label: string): Promise<void> {
    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 800)
    })
    await connect(label)
    setIsModalOpen(false)
  }

  async function handleCopy(): Promise<void> {
    if (!wallet) {
      return
    }

    await navigator.clipboard.writeText(wallet.address)
  }

  if (!wallet || !wallet.connected) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-text-muted hover:bg-accent-hot hover:text-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Connect Wallet
              <MoveRight className="h-4 w-4" />
            </>
          )}
        </button>
        <WalletModal
          isOpen={isModalOpen}
          isConnecting={isConnecting}
          onClose={() => setIsModalOpen(false)}
          onConnect={handleConnect}
        />
      </>
    )
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-3 rounded-full border border-border bg-bg-card px-4 py-2 text-sm text-text-primary transition hover:border-text-muted hover:bg-bg-card-hover active:scale-[0.97]"
        >
          <span className="hidden font-mono text-text-primary sm:block">
            {formatAddress(wallet.address)}
          </span>
          <span className="rounded-full bg-bg-surface px-2.5 py-1 font-mono text-xs text-text-primary">
            {formatRIALO(wallet.balance)}
          </span>
          <ChevronDown className="h-4 w-4 text-text-secondary" />
        </button>

        {isOpen ? (
          <div className="absolute right-0 z-40 mt-3 w-[22rem] rounded-xl border border-border bg-bg-card p-4 backdrop-blur">
            <div className="rounded-xl border border-border bg-bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-text-muted">
                    Connected Wallet
                  </p>
                  <p className="mt-2 break-all font-mono text-sm text-text-primary">
                    {wallet.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="rounded-full border border-border p-2 text-text-secondary transition hover:border-text-muted hover:text-text-primary"
                  aria-label="Copy wallet address"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 font-mono text-sm text-text-primary">
                Balance: {formatRIALO(wallet.balance)}
              </p>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.22em] text-text-muted">
                  Recent Transactions
                </span>
                <Link
                  href="/portfolio"
                  className="text-sm text-text-secondary transition hover:text-text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  View Portfolio
                </Link>
              </div>
              <div className="space-y-2">
                {txHistory.slice(0, 5).map((record) => (
                  <div
                    key={`${record.description}-${record.timestamp}`}
                    className="flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-surface px-3 py-3"
                  >
                    <span className="mt-0.5 text-text-secondary">
                      {record.status === 'confirmed' ? (
                        <CheckCircle2 className="h-4 w-4 text-status-open" />
                      ) : record.status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-status-disputed" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-status-resolving" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-text-primary">
                        {record.description}
                      </span>
                      <span className="mt-1 block font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
                        {record.status}
                      </span>
                    </span>
                  </div>
                ))}
                {txHistory.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-text-muted">
                    No transactions yet.
                  </p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                disconnectWallet()
                setIsOpen(false)
              }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-4 py-3 text-sm font-medium text-text-primary transition hover:border-text-muted hover:bg-bg-input active:scale-[0.97]"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        ) : null}
      </div>

      <WalletModal
        isOpen={isModalOpen}
        isConnecting={isConnecting}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </>
  )
}
