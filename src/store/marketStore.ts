import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Market, Position } from '@/lib/types'
import {
  seededMarkets,
  seededPositions,
  seededResolutionLogs,
} from '@/lib/mock/seed'

export interface MarketState {
  markets: Market[]
  positions: Position[]
  resolutionLog: Record<string, string[]>
  isLoading: boolean
  addMarket: (market: Market) => void
  updateMarket: (id: string, updates: Partial<Market>) => void
  addPosition: (position: Position) => void
  updatePosition: (id: string, updates: Partial<Position>) => void
  setPositions: (positions: Position[]) => void
  appendResolutionLog: (marketId: string, line: string) => void
  clearResolutionLog: (marketId: string) => void
  loadFromStorage: () => void
  persistToStorage: () => void
  setLoading: (isLoading: boolean) => void
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

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      markets: [],
      positions: [],
      resolutionLog: {},
      isLoading: false,
      addMarket: (market) =>
        set((state) => ({
          markets: [market, ...state.markets],
        })),
      updateMarket: (id, updates) =>
        set((state) => ({
          markets: state.markets.map((market) =>
            market.id === id
              ? {
                  ...market,
                  ...updates,
                }
              : market
          ),
        })),
      addPosition: (position) =>
        set((state) => {
          const existingIndex = state.positions.findIndex(
            (candidate) =>
              candidate.owner === position.owner &&
              candidate.market_id === position.market_id &&
              candidate.outcome_index === position.outcome_index &&
              candidate.claimed === position.claimed
          )

          if (existingIndex === -1) {
            return {
              positions: [position, ...state.positions],
            }
          }

          const nextPositions = [...state.positions]
          nextPositions[existingIndex] = position

          return {
            positions: nextPositions,
          }
        }),
      updatePosition: (id, updates) =>
        set((state) => ({
          positions: state.positions.map((position) =>
            position.id === id
              ? {
                  ...position,
                  ...updates,
                }
              : position
          ),
        })),
      setPositions: (positions) => set({ positions }),
      appendResolutionLog: (marketId, line) =>
        set((state) => ({
          resolutionLog: {
            ...state.resolutionLog,
            [marketId]: [...(state.resolutionLog[marketId] ?? []), line],
          },
        })),
      clearResolutionLog: (marketId) =>
        set((state) => ({
          resolutionLog: {
            ...state.resolutionLog,
            [marketId]: [],
          },
        })),
      loadFromStorage: () =>
        set((state) => {
          if (state.markets.length > 0) {
            return state
          }

          return {
            markets: seededMarkets,
            positions: seededPositions,
            resolutionLog: seededResolutionLogs,
            isLoading: false,
          }
        }),
      persistToStorage: () =>
        set((state) => ({
          markets: state.markets,
        })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'veritas-market-store',
      storage,
      partialize: (state) => ({
        markets: state.markets,
        positions: state.positions,
        resolutionLog: state.resolutionLog,
      }),
    }
  )
)
