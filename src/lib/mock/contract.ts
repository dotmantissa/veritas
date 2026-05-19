import { nanoid } from 'nanoid'

import {
  CONSENSUS_THRESHOLD_DEFAULT,
  DEADLINE_MIN_FUTURE_MS,
  MAX_OUTCOMES,
  MAX_QUESTION_LENGTH,
  MAX_SOURCES,
  MIN_BET,
  MIN_OUTCOMES,
  MIN_SOURCES,
  MOCK_PROTOCOL_CONFIG,
} from '@/lib/constants'
import { submitTransaction } from '@/lib/mock/chain'
import { runResolution } from '@/lib/mock/resolution'
import { addBalance, deductBalance } from '@/lib/mock/wallet'
import type { CreateMarketParams, Market, MockWallet, Position, TxType } from '@/lib/types'
import { useMarketStore } from '@/store/marketStore'
import { useWalletStore } from '@/store/walletStore'

function requireConnectedWallet(wallet: MockWallet): void {
  if (!wallet.connected) {
    throw new Error('Wallet not connected')
  }
}

function createPendingTx(type: TxType, description: string): string {
  const id = nanoid(12)
  useWalletStore.getState().addPendingTx({
    id,
    type,
    description,
    status: 'pending',
  })
  useWalletStore.getState().pushTxRecord({
    signature: id,
    type,
    status: 'pending',
    timestamp: Date.now(),
    description,
  })
  return id
}

async function finalizeTransaction(
  pendingId: string,
  type: TxType,
  description: string,
  amount?: number,
  marketId?: string
): Promise<string> {
  const { signature } = await submitTransaction(type, description)

  useWalletStore.getState().pushTxRecord({
    signature,
    type,
    status: 'confirmed',
    timestamp: Date.now(),
    description,
    amount,
    market_id: marketId,
  })
  useWalletStore.getState().confirmTx(pendingId, signature)

  return signature
}

function failPendingTransaction(pendingId: string): void {
  useWalletStore.getState().failTx(pendingId)
}

function validateCreateMarketParams(params: CreateMarketParams): void {
  if (params.question.trim().length === 0) {
    throw new Error('Question is required')
  }

  if (params.question.length > MAX_QUESTION_LENGTH) {
    throw new Error(`Question must be ${MAX_QUESTION_LENGTH} characters or less`)
  }

  if (
    params.outcome_labels.length < MIN_OUTCOMES ||
    params.outcome_labels.length > MAX_OUTCOMES
  ) {
    throw new Error(`Markets must have between ${MIN_OUTCOMES} and ${MAX_OUTCOMES} outcomes`)
  }

  if (
    params.resolution_sources.length < MIN_SOURCES ||
    params.resolution_sources.length > MAX_SOURCES
  ) {
    throw new Error(`Markets must have between ${MIN_SOURCES} and ${MAX_SOURCES} sources`)
  }

  if (params.deadline <= Date.now() + DEADLINE_MIN_FUTURE_MS) {
    throw new Error('Deadline must be at least 5 minutes in the future')
  }

  for (const source of params.resolution_sources) {
    if (!source.url.startsWith('https://')) {
      throw new Error('Source URLs must start with https://')
    }
  }
}

function getMarketOrThrow(marketId: string): Market {
  const market = useMarketStore
    .getState()
    .markets.find((candidate) => candidate.id === marketId)

  if (!market) {
    throw new Error('Market not found')
  }

  return market
}

function getPositionOrThrow(positionId: string): Position {
  const position = useMarketStore
    .getState()
    .positions.find((candidate) => candidate.id === positionId)

  if (!position) {
    throw new Error('Position not found')
  }

  return position
}

export async function createMarket(
  wallet: MockWallet,
  params: CreateMarketParams
): Promise<{ market: Market; signature: string }> {
  requireConnectedWallet(wallet)
  validateCreateMarketParams(params)

  const market: Market = {
    id: nanoid(16),
    creator: wallet.address,
    question: params.question.trim(),
    outcome_labels: params.outcome_labels.map((label) => label.trim()),
    resolution_sources: params.resolution_sources,
    consensus_threshold:
      params.consensus_threshold ?? CONSENSUS_THRESHOLD_DEFAULT,
    deadline: params.deadline,
    total_pool: 0,
    outcome_pools: params.outcome_labels.map(() => 0),
    status: 'Open',
    resolved_outcome: null,
    created_at: Date.now(),
    category: params.category,
  }

  const pendingId = createPendingTx('create_market', `Create market: ${market.question}`)

  try {
    const signature = await finalizeTransaction(
      pendingId,
      'create_market',
      `Create market: ${market.question}`,
      undefined,
      market.id
    )

    useMarketStore.getState().addMarket(market)

    return { market, signature }
  } catch (error) {
    failPendingTransaction(pendingId)
    throw error
  }
}

export async function placeBet(
  wallet: MockWallet,
  marketId: string,
  outcomeIndex: number,
  amount: number
): Promise<{ position: Position; signature: string }> {
  requireConnectedWallet(wallet)

  const market = getMarketOrThrow(marketId)

  if (market.status !== 'Open') {
    throw new Error('Market is not open for betting')
  }

  if (market.deadline <= Date.now()) {
    throw new Error('Market deadline has already passed')
  }

  if (outcomeIndex < 0 || outcomeIndex >= market.outcome_labels.length) {
    throw new Error('Invalid outcome selected')
  }

  if (amount < MOCK_PROTOCOL_CONFIG.min_bet_lamports || amount < MIN_BET) {
    throw new Error('Amount is below the minimum bet')
  }

  const pendingId = createPendingTx(
    'place_bet',
    `Place ${amount} RIALO on ${market.outcome_labels[outcomeIndex]}`
  )

  try {
    await deductBalance(amount)

    const existingPosition = useMarketStore
      .getState()
      .positions.find(
        (candidate) =>
          candidate.owner === wallet.address &&
          candidate.market_id === marketId &&
          candidate.outcome_index === outcomeIndex &&
          !candidate.claimed
      )

    const position: Position = existingPosition
      ? {
          ...existingPosition,
          amount: existingPosition.amount + amount,
        }
      : {
          id: nanoid(16),
          owner: wallet.address,
          market_id: marketId,
          outcome_index: outcomeIndex,
          amount,
          claimed: false,
          created_at: Date.now(),
        }

    const signature = await finalizeTransaction(
      pendingId,
      'place_bet',
      `Place ${amount} RIALO on ${market.outcome_labels[outcomeIndex]}`,
      amount,
      marketId
    )

    const nextOutcomePools = [...market.outcome_pools]
    nextOutcomePools[outcomeIndex] = (nextOutcomePools[outcomeIndex] ?? 0) + amount

    useMarketStore.getState().updateMarket(marketId, {
      total_pool: market.total_pool + amount,
      outcome_pools: nextOutcomePools,
    })

    if (existingPosition) {
      useMarketStore.getState().updatePosition(existingPosition.id, {
        amount: position.amount,
      })
    } else {
      useMarketStore.getState().addPosition(position)
    }

    return { position, signature }
  } catch (error) {
    failPendingTransaction(pendingId)
    throw error
  }
}

export async function claimPayout(
  wallet: MockWallet,
  positionId: string
): Promise<{ payout: number; signature: string }> {
  requireConnectedWallet(wallet)

  const position = getPositionOrThrow(positionId)
  const market = getMarketOrThrow(position.market_id)

  if (position.owner !== wallet.address) {
    throw new Error('Position does not belong to the connected wallet')
  }

  if (position.claimed) {
    throw new Error('Payout already claimed')
  }

  if (market.status !== 'Resolved' || market.resolved_outcome === null) {
    throw new Error('Market is not resolved')
  }

  if (position.outcome_index !== market.resolved_outcome) {
    throw new Error('Position is not on the winning outcome')
  }

  const winnerPool = market.outcome_pools[market.resolved_outcome] ?? 0

  if (winnerPool <= 0) {
    throw new Error('Winning pool is empty')
  }

  const fee = market.total_pool * (MOCK_PROTOCOL_CONFIG.fee_bps / 10_000)
  const prizePool = market.total_pool - fee
  const payout = (position.amount / winnerPool) * prizePool

  const pendingId = createPendingTx(
    'claim_payout',
    `Claim payout from ${market.question}`
  )

  try {
    await addBalance(payout)

    const signature = await finalizeTransaction(
      pendingId,
      'claim_payout',
      `Claim payout from ${market.question}`,
      payout,
      market.id
    )

    useMarketStore.getState().updatePosition(position.id, {
      claimed: true,
    })

    return { payout, signature }
  } catch (error) {
    failPendingTransaction(pendingId)
    throw error
  }
}

export async function claimRefund(
  wallet: MockWallet,
  positionId: string
): Promise<{ amount: number; signature: string }> {
  requireConnectedWallet(wallet)

  const position = getPositionOrThrow(positionId)
  const market = getMarketOrThrow(position.market_id)

  if (position.owner !== wallet.address) {
    throw new Error('Position does not belong to the connected wallet')
  }

  if (position.claimed) {
    throw new Error('Refund already claimed')
  }

  if (!['Disputed', 'Cancelled'].includes(market.status)) {
    throw new Error('Refunds are only available for disputed or cancelled markets')
  }

  const pendingId = createPendingTx('refund', `Claim refund from ${market.question}`)

  try {
    await addBalance(position.amount)

    const signature = await finalizeTransaction(
      pendingId,
      'refund',
      `Claim refund from ${market.question}`,
      position.amount,
      market.id
    )

    useMarketStore.getState().updatePosition(position.id, {
      claimed: true,
    })

    return { amount: position.amount, signature }
  } catch (error) {
    failPendingTransaction(pendingId)
    throw error
  }
}

export async function triggerResolution(
  wallet: MockWallet,
  marketId: string
): Promise<{ signature: string }> {
  requireConnectedWallet(wallet)

  const market = getMarketOrThrow(marketId)

  if (market.deadline > Date.now()) {
    throw new Error('Market deadline has not passed yet')
  }

  if (market.status === 'Resolved' || market.status === 'Disputed') {
    throw new Error('Market has already been settled')
  }

  const pendingId = createPendingTx(
    'resolve_market',
    `Trigger resolution for ${market.question}`
  )

  try {
    const signature = await finalizeTransaction(
      pendingId,
      'resolve_market',
      `Trigger resolution for ${market.question}`,
      undefined,
      market.id
    )

    useMarketStore.getState().updateMarket(market.id, {
      status: 'Resolving',
    })

    await runResolution(market.id)

    return { signature }
  } catch (error) {
    failPendingTransaction(pendingId)
    throw error
  }
}
