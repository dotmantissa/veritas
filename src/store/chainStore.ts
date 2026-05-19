import { create } from 'zustand'

import { BLOCK_TIME_MS, NETWORK_STATUS_ONLINE } from '@/lib/constants'

export interface ChainState {
  currentBlock: number
  blockTime: number
  networkStatus: 'online' | 'offline'
  incrementBlock: () => void
  setCurrentBlock: (block: number) => void
}

const initialBlock = Math.floor(Date.now() / BLOCK_TIME_MS)

export const useChainStore = create<ChainState>((set) => ({
  currentBlock: initialBlock,
  blockTime: BLOCK_TIME_MS,
  networkStatus: NETWORK_STATUS_ONLINE,
  incrementBlock: () =>
    set((state) => ({
      currentBlock: state.currentBlock + 1,
    })),
  setCurrentBlock: (block) => set({ currentBlock: block }),
}))
