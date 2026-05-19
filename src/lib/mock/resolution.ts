import {
  RESOLUTION_STAGGER_MAX_MS,
  RESOLUTION_STAGGER_MIN_MS,
} from '@/lib/constants'
import { getCurrentBlock } from '@/lib/mock/chain'
import { resolveFromSourceRegistry } from '@/lib/mock/sources'
import type { Market, ResolutionDetail, SourceConfig, SourceResult } from '@/lib/types'
import { useMarketStore } from '@/store/marketStore'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function logResolution(marketId: string, message: string): void {
  const line = `[Block #${getCurrentBlock()}] ${message}`
  useMarketStore.getState().appendResolutionLog(marketId, line)
}

export async function resolveSource(
  source: SourceConfig,
  market: Market
): Promise<SourceResult> {
  return resolveFromSourceRegistry(source, market)
}

export async function runResolution(marketId: string): Promise<ResolutionDetail> {
  const store = useMarketStore.getState()
  const market = store.markets.find((candidate) => candidate.id === marketId)

  if (!market) {
    throw new Error('Market not found')
  }

  if (market.status === 'Resolved' && market.resolution_detail) {
    return market.resolution_detail
  }

  store.updateMarket(marketId, { status: 'Resolving' })
  store.clearResolutionLog(marketId)
  logResolution(marketId, `Resolution triggered for market ${marketId}`)

  const results: SourceResult[] = []

  for (const [index, source] of market.resolution_sources.entries()) {
    logResolution(
      marketId,
      `Fetching source ${index + 1}/${market.resolution_sources.length}: ${source.label}...`
    )

    await sleep(randomBetween(RESOLUTION_STAGGER_MIN_MS, RESOLUTION_STAGGER_MAX_MS))

    const result = await resolveSource(source, market)
    results.push(result)

    const parsedLabel =
      result.parsed_outcome === null
        ? 'unmapped'
        : `"${market.outcome_labels[result.parsed_outcome] ?? 'Unknown'}"`

    logResolution(
      marketId,
      `✓ Source ${index + 1} returned: "${result.raw_value}" → maps to outcome: ${parsedLabel} (${result.latency_ms}ms)`
    )
  }

  const counts = new Map<number, number>()

  for (const result of results) {
    if (result.parsed_outcome === null) {
      continue
    }

    counts.set(
      result.parsed_outcome,
      (counts.get(result.parsed_outcome) ?? 0) + 1
    )
  }

  let consensusOutcome: number | null = null
  let highestCount = 0
  let tieForHighest = false

  for (const [outcomeIndex, count] of counts.entries()) {
    if (count > highestCount) {
      highestCount = count
      consensusOutcome = outcomeIndex
      tieForHighest = false
      continue
    }

    if (count === highestCount) {
      tieForHighest = true
    }
  }

  const thresholdMet =
    consensusOutcome !== null &&
    highestCount >= market.consensus_threshold &&
    !tieForHighest

  const detail: ResolutionDetail = {
    source_results: results,
    consensus_outcome: thresholdMet ? consensusOutcome : null,
    resolved_at: Date.now(),
    method: thresholdMet ? 'consensus' : 'disputed',
  }

  if (thresholdMet && consensusOutcome !== null) {
    store.updateMarket(marketId, {
      status: 'Resolved',
      resolved_outcome: consensusOutcome,
      resolution_detail: detail,
    })
    logResolution(
      marketId,
      `Consensus reached: ${highestCount}/${market.resolution_sources.length} sources agree → "${market.outcome_labels[consensusOutcome]}"`
    )
    logResolution(marketId, '✓ Market resolved. Payouts available.')
  } else {
    store.updateMarket(marketId, {
      status: 'Disputed',
      resolved_outcome: null,
      resolution_detail: detail,
    })
    logResolution(
      marketId,
      `Consensus failed: ${highestCount > 0 ? `only ${highestCount}/${market.resolution_sources.length} sources agree` : 'no outcome reached threshold'}`
    )
    logResolution(marketId, 'Market moved to disputed state. Refunds available.')
  }

  return detail
}

export async function autoResolveExpiredMarkets(): Promise<void> {
  const markets = useMarketStore.getState().markets
  const now = Date.now()

  for (const market of markets) {
    if (market.status === 'Open' && market.deadline < now) {
      await runResolution(market.id)
    }
  }
}
