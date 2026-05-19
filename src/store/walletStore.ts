import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { MockWallet, PendingTx, TxRecord } from '@/lib/types'

export interface WalletState {
  wallet: MockWallet | null
  isConnecting: boolean
  pendingTxs: PendingTx[]
  txHistory: TxRecord[]
  connect: (label: string) => Promise<void>
  disconnect: () => void
  addPendingTx: (tx: PendingTx) => void
  confirmTx: (id: string, signature: string) => void
  failTx: (id: string) => void
  setWallet: (wallet: MockWallet | null) => void
  setConnecting: (isConnecting: boolean) => void
  pushTxRecord: (record: TxRecord) => void
  updateWalletBalance: (balance: number) => void
  resetRuntimeState: () => void
}

const storage = createJSONStorage(() =>
  typeof window === 'undefined'
    ? {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      }
    : window.localStorage
)

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      isConnecting: false,
      pendingTxs: [],
      txHistory: [],
      connect: async (label) => {
        const { connectWallet } = await import('@/lib/mock/wallet')

        set({ isConnecting: true })

        try {
          const wallet = await connectWallet(label)
          set({ wallet, isConnecting: false })
        } catch (error) {
          set({ isConnecting: false })
          throw error
        }
      },
      disconnect: () => {
        set({
          wallet: null,
          pendingTxs: [],
        })
      },
      addPendingTx: (tx) =>
        set((state) => ({
          pendingTxs: [...state.pendingTxs, tx],
        })),
      confirmTx: (id, signature) =>
        set((state) => ({
          pendingTxs: state.pendingTxs.filter((tx) => tx.id !== id),
          txHistory: state.txHistory.map((record) =>
            record.signature === id
              ? {
                  ...record,
                  signature,
                  status: 'confirmed',
                }
              : record
          ),
        })),
      failTx: (id) =>
        set((state) => ({
          pendingTxs: state.pendingTxs.map((tx) =>
            tx.id === id
              ? {
                  ...tx,
                  status: 'failed',
                }
              : tx
          ),
          txHistory: state.txHistory.map((record) =>
            record.signature === id
              ? {
                  ...record,
                  status: 'failed',
                }
              : record
          ),
        })),
      setWallet: (wallet) => set({ wallet }),
      setConnecting: (isConnecting) => set({ isConnecting }),
      pushTxRecord: (record) =>
        set((state) => ({
          txHistory: [record, ...state.txHistory].slice(0, 50),
        })),
      updateWalletBalance: (balance) =>
        set((state) => ({
          wallet: state.wallet
            ? {
                ...state.wallet,
                balance,
              }
            : null,
        })),
      resetRuntimeState: () => set({ pendingTxs: [], isConnecting: false }),
    }),
    {
      name: 'veritas-wallet-store',
      storage,
      partialize: (state) => ({
        wallet: state.wallet,
        txHistory: state.txHistory,
      }),
    }
  )
)
