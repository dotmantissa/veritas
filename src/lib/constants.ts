import type { MarketCategory, ProtocolConfig } from '@/lib/types'

export const FEE_BPS = 200
export const MIN_BET = 100
export const MAX_QUESTION_LENGTH = 280
export const MIN_SOURCES = 3
export const MAX_SOURCES = 5
export const MIN_OUTCOMES = 2
export const MAX_OUTCOMES = 5
export const BLOCK_TIME_MS = 50
export const RIALO_EXPLORER = 'https://explorer.rialo.io'
export const STARTING_BALANCE = 10_000
export const CONSENSUS_THRESHOLD_DEFAULT = 3
export const TX_MIN_DELAY_MS = 800
export const TX_MAX_DELAY_MS = 1_800
export const RESOLUTION_STAGGER_MIN_MS = 300
export const RESOLUTION_STAGGER_MAX_MS = 700
export const DEADLINE_MIN_FUTURE_MS = 5 * 60 * 1_000
export const NETWORK_STATUS_ONLINE = 'online'
export const LOCAL_STORAGE_MARKETS_KEY = 'veritas:markets'
export const LOCAL_STORAGE_WALLET_KEY = 'veritas:wallets'
export const LOCAL_STORAGE_CHAIN_KEY = 'veritas:chain'
export const LOCAL_STORAGE_POSITIONS_KEY = 'veritas:positions'
export const WALLET_IDENTITY_LABELS = [
  'Rialo Explorer',
  'Alpha Tester',
  'Veritas Builder',
] as const

export const MARKET_CATEGORIES: MarketCategory[] = [
  'Sports',
  'Finance',
  'Politics',
  'Weather',
  'Crypto',
  'Entertainment',
  'Other',
]

export const MOCK_PROTOCOL_CONFIG: ProtocolConfig = {
  authority: 'RiaLoAuthority1111111111111111111111',
  treasury: 'RiaLoTreasury11111111111111111111111',
  fee_bps: FEE_BPS,
  min_bet_lamports: MIN_BET,
}
