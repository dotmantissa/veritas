'use client'

import { useChainStore } from '@/store/chainStore'

export function Footer() {
  const currentBlock = useChainStore((state) => state.currentBlock)

  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Powered by Rialo. Mock testnet simulation, local persistence, live UX.</p>
        <p className="font-medium text-slate-200">Block #{currentBlock}</p>
      </div>
    </footer>
  )
}
