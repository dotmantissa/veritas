'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  Loader2,
  LogOut,
  Wallet2,
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
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet2 className="h-4 w-4" />
              Connect Wallet
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
          className="inline-flex items-center gap-3 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm text-white transition hover:border-cyan-300/50 hover:bg-cyan-400/15"
        >
          <span className="hidden text-slate-100 sm:block">
            {formatAddress(wallet.address)}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
            {formatRIALO(wallet.balance)}
          </span>
          <ChevronDown className="h-4 w-4 text-cyan-100" />
        </button>

        {isOpen ? (
          <div className="absolute right-0 z-40 mt-3 w-[22rem] rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Connected Wallet
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-white">
                    {wallet.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
                  aria-label="Copy wallet address"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-cyan-100">
                Balance: {formatRIALO(wallet.balance)}
              </p>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Recent Transactions
                </span>
                <Link
                  href="/portfolio"
                  className="text-sm text-cyan-200 transition hover:text-cyan-100"
                  onClick={() => setIsOpen(false)}
                >
                  View Portfolio
                </Link>
              </div>
              <div className="space-y-2">
                {txHistory.slice(0, 5).map((record) => (
                  <div
                    key={`${record.description}-${record.timestamp}`}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-3"
                  >
                    <span className="mt-0.5 text-slate-300">
                      {record.status === 'confirmed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : record.status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-100">
                        {record.description}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {record.status}
                      </span>
                    </span>
                  </div>
                ))}
                {txHistory.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-slate-400">
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
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:border-rose-300/40 hover:bg-rose-400/15"
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
