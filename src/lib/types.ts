// ─── Enums ───────────────────────────────────────────────────────────────────

export type MarketStatus =
  | 'Open'
  | 'Resolving'
  | 'Resolved'
  | 'Disputed'
  | 'Cancelled'

export type TxStatus = 'pending' | 'confirmed' | 'failed'

// ─── On-chain account shapes ──────────────────────────────────────────────────

export interface ProtocolConfig {
  authority: string
  treasury: string
  fee_bps: number
  min_bet_lamports: number
}

export interface SourceConfig {
  url: string
  json_path: string
  outcome_mappings: string[]
  label: string
}

export type MarketCategory =
  | 'Sports'
  | 'Finance'
  | 'Politics'
  | 'Weather'
  | 'Crypto'
  | 'Entertainment'
  | 'Other'

export interface SourceResult {
  source: SourceConfig
  raw_value: string
  parsed_outcome: number | null
  latency_ms: number
  status: 'success' | 'timeout' | 'error'
}

export interface ResolutionDetail {
  source_results: SourceResult[]
  consensus_outcome: number | null
  resolved_at: number
  method: 'consensus' | 'disputed'
}

export interface Market {
  id: string
  creator: string
  question: string
  outcome_labels: string[]
  resolution_sources: SourceConfig[]
  consensus_threshold: number
  deadline: number
  total_pool: number
  outcome_pools: number[]
  status: MarketStatus
  resolved_outcome: number | null
  created_at: number
  category: MarketCategory
  resolution_detail?: ResolutionDetail
}

export interface Position {
  id: string
  owner: string
  market_id: string
  outcome_index: number
  amount: number
  claimed: boolean
  created_at: number
}

// ─── Wallet ────────────────────────────────────────────────────────────────────

export interface MockWallet {
  address: string
  balance: number
  connected: boolean
  label: string
}

export type TxType =
  | 'create_market'
  | 'place_bet'
  | 'claim_payout'
  | 'refund'
  | 'resolve_market'

export interface TxRecord {
  signature: string
  type: TxType
  status: TxStatus
  timestamp: number
  description: string
  amount?: number
  market_id?: string
}

// ─── UI state ──────────────────────────────────────────────────────────────────

export interface PendingTx {
  id: string
  type: TxType
  description: string
  status: TxStatus
}

// ─── Mock/runtime helpers ─────────────────────────────────────────────────────

export interface CreateMarketParams {
  question: string
  outcome_labels: string[]
  resolution_sources: SourceConfig[]
  consensus_threshold?: number
  deadline: number
  category: MarketCategory
}

export interface SubmitTransactionResult {
  signature: string
  block: number
}

export interface ResolutionProgressEvent {
  marketId: string
  line: string
}

export interface SourceAdapter {
  name: string
  url_pattern: string
  fetch: (
    url: string,
    jsonPath: string,
    mappings: string[],
    marketId?: string
  ) => Promise<SourceResult>
  example_markets: string[]
}
