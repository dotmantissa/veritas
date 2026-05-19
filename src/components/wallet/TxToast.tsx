'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'

import { RIALO_EXPLORER } from '@/lib/constants'
import { startBlockProduction } from '@/lib/mock/chain'
import { autoResolveExpiredMarkets } from '@/lib/mock/resolution'
import type { TxRecord } from '@/lib/types'
import { useChainStore } from '@/store/chainStore'
import { useMarketStore } from '@/store/marketStore'
import { useWalletStore } from '@/store/walletStore'

function txToastKey(record: TxRecord): string {
  return `${record.description}:${record.timestamp}`
}

export function TxToast() {
  const currentBlock = useChainStore((state) => state.currentBlock)
  const txHistory = useWalletStore((state) => state.txHistory)
  const loadMarkets = useMarketStore((state) => state.loadFromStorage)
  const toastStatesRef = useRef<Record<string, TxRecord['status']>>({})

  useEffect(() => {
    startBlockProduction()
    loadMarkets()

    void autoResolveExpiredMarkets()

    const interval = window.setInterval(() => {
      void autoResolveExpiredMarkets()
    }, 30_000)

    return () => {
      window.clearInterval(interval)
    }
  }, [loadMarkets])

  useEffect(() => {
    for (const record of txHistory) {
      const key = txToastKey(record)
      const previousStatus = toastStatesRef.current[key]

      if (previousStatus === record.status) {
        continue
      }

      if (!previousStatus && record.status === 'pending') {
        toast.loading('Transaction submitted — awaiting confirmation', {
          id: key,
          description: `${record.description} · gas fee 0.000005 RIALO`,
          duration: Infinity,
        })
        toastStatesRef.current[key] = 'pending'
        continue
      }

      if (record.status === 'confirmed') {
        toast.success(
          `Confirmed in block #${currentBlock} — ${record.description}`,
          {
            id: key,
            description: (
              <Link
                href={`${RIALO_EXPLORER}/tx/${record.signature}`}
                target="_blank"
                className="text-cyan-300 underline underline-offset-2"
              >
                View on Explorer
              </Link>
            ),
          }
        )
        toastStatesRef.current[key] = 'confirmed'
        continue
      }

      if (record.status === 'failed') {
        toast.error(`Transaction failed — ${record.description}`, {
          id: key,
          description: 'Please retry the operation.',
        })
        toastStatesRef.current[key] = 'failed'
      }
    }
  }, [currentBlock, txHistory])

  return (
    <Toaster
      position="top-right"
      richColors
      theme="dark"
      toastOptions={{
        classNames: {
          toast: 'border border-white/10 bg-slate-900 text-slate-100',
          description: 'text-slate-300',
        },
      }}
    />
  )
}
