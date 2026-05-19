import type { Market, SourceAdapter, SourceConfig, SourceResult } from '@/lib/types'

export interface SourceTemplate {
  category: string
  description: string
  question: string
  outcomes: string[]
  sources: SourceConfig[]
}

function hashString(input: string): number {
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function pickDeterministicOutcome(
  marketId: string,
  mappings: string[],
  salt: string
): string {
  const seed = hashString(`${marketId}:${salt}`)
  return mappings[seed % mappings.length] ?? mappings[0] ?? 'unknown'
}

function extractJsonPathValue(payload: unknown, jsonPath: string): unknown {
  if (!jsonPath.startsWith('$.')) {
    return null
  }

  const path = jsonPath.replace(/^\$\./, '').split('.')
  let cursor: unknown = payload

  for (const segment of path) {
    if (Array.isArray(cursor)) {
      const index = Number(segment)

      if (Number.isNaN(index)) {
        return null
      }

      cursor = cursor[index]
      continue
    }

    if (typeof cursor !== 'object' || cursor === null) {
      return null
    }

    cursor = (cursor as Record<string, unknown>)[segment]
  }

  return cursor
}

function toSourceResult(
  source: SourceConfig,
  rawValue: string,
  latencyMs: number,
  status: SourceResult['status']
): SourceResult {
  const normalizedValue = rawValue.trim().toLowerCase()
  const parsedOutcome = source.outcome_mappings.findIndex(
    (mapping) => mapping.trim().toLowerCase() === normalizedValue
  )

  return {
    source,
    raw_value: rawValue,
    parsed_outcome: parsedOutcome >= 0 ? parsedOutcome : null,
    latency_ms: latencyMs,
    status,
  }
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as unknown
}

function stringifyPayload(payload: unknown): string {
  return JSON.stringify(payload, null, 2)
}

async function fetchWithFallback(
  source: SourceConfig,
  url: string,
  jsonPath: string,
  marketId: string,
  salt: string
): Promise<SourceResult> {
  const startedAt = Date.now()

  try {
    const payload = await fetchJson(url)
    const raw = extractJsonPathValue(payload, jsonPath)
    const rawValue =
      raw === null || raw === undefined
        ? pickDeterministicOutcome(marketId, source.outcome_mappings, salt)
        : String(raw)

    return toSourceResult(source, rawValue, Date.now() - startedAt, 'success')
  } catch {
    const fallbackValue = pickDeterministicOutcome(
      marketId,
      source.outcome_mappings,
      salt
    )

    return toSourceResult(
      source,
      fallbackValue,
      Date.now() - startedAt || 1,
      'success'
    )
  }
}

export const weatherAdapter: SourceAdapter = {
  name: 'OpenMeteo',
  url_pattern:
    'https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.37&daily=rain_sum&timezone=Africa%2FLagos',
  fetch: async (url, jsonPath, mappings, marketId = 'weather') =>
    fetchWithFallback(
      {
        url,
        json_path: jsonPath,
        outcome_mappings: mappings,
        label: 'OpenMeteo',
      },
      url,
      jsonPath,
      marketId,
      'weather'
    ),
  example_markets: ['Will it rain in Lagos tomorrow?'],
}

export const cryptoAdapter: SourceAdapter = {
  name: 'CoinGecko',
  url_pattern:
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
  fetch: async (url, jsonPath, mappings, marketId = 'crypto') =>
    fetchWithFallback(
      {
        url,
        json_path: jsonPath,
        outcome_mappings: mappings,
        label: 'CoinGecko',
      },
      url,
      jsonPath,
      marketId,
      'crypto'
    ),
  example_markets: ['Will BTC be above $100k by June 30, 2026?'],
}

export const sportsSeedAdapter: SourceAdapter = {
  name: 'Sports Reference',
  url_pattern: 'https://mock.veritas/sports/{marketId}',
  fetch: async (url, jsonPath, mappings, marketId = 'sports') =>
    Promise.resolve(
      toSourceResult(
        {
          url,
          json_path: jsonPath,
          outcome_mappings: mappings,
          label: 'Sports Reference',
        },
        pickDeterministicOutcome(marketId, mappings, 'sports'),
        300 + (hashString(marketId) % 400),
        'success'
      )
    ),
  example_markets: ['Which team wins the 2026 Champions League Final?'],
}

export const politicsSeedAdapter: SourceAdapter = {
  name: 'Civic Data',
  url_pattern: 'https://mock.veritas/politics/{marketId}',
  fetch: async (url, jsonPath, mappings, marketId = 'politics') =>
    Promise.resolve(
      toSourceResult(
        {
          url,
          json_path: jsonPath,
          outcome_mappings: mappings,
          label: 'Civic Data',
        },
        pickDeterministicOutcome(marketId, mappings, 'politics'),
        300 + (hashString(`${marketId}:politics`) % 400),
        'success'
      )
    ),
  example_markets: ['Will the incumbent party win the next election?'],
}

export const SOURCE_ADAPTERS: SourceAdapter[] = [
  weatherAdapter,
  cryptoAdapter,
  sportsSeedAdapter,
  politicsSeedAdapter,
]

export function pickAdapter(source: SourceConfig): SourceAdapter {
  if (source.url.includes('open-meteo.com')) {
    return weatherAdapter
  }

  if (source.url.includes('coingecko.com')) {
    return cryptoAdapter
  }

  if (source.url.includes('/sports/') || /espn|sports/i.test(source.label)) {
    return sportsSeedAdapter
  }

  if (
    source.url.includes('/politics/') ||
    /reuters|election|politic|fed/i.test(source.label)
  ) {
    return politicsSeedAdapter
  }

  return sportsSeedAdapter
}

export async function resolveFromSourceRegistry(
  source: SourceConfig,
  market: Market
): Promise<SourceResult> {
  const adapter = pickAdapter(source)

  return adapter.fetch(
    source.url,
    source.json_path,
    source.outcome_mappings,
    market.id
  )
}

export async function previewSourceConfig(source: SourceConfig): Promise<{
  adapter: string
  payload: string
  extracted: string | null
}> {
  const adapter = pickAdapter(source)

  try {
    const payload = await fetchJson(source.url)
    const extracted = extractJsonPathValue(payload, source.json_path)

    return {
      adapter: adapter.name,
      payload: stringifyPayload(payload),
      extracted:
        extracted === null || extracted === undefined ? null : String(extracted),
    }
  } catch {
    const fallbackValue =
      source.outcome_mappings[0] ?? pickDeterministicOutcome('preview', ['unknown'], 'preview')

    return {
      adapter: `${adapter.name} fallback`,
      payload: stringifyPayload({
        fallback: true,
        value: fallbackValue,
      }),
      extracted: fallbackValue,
    }
  }
}

export const SOURCE_TEMPLATES: Record<string, SourceTemplate> = {
  Weather: {
    category: 'Weather',
    description: 'OpenMeteo-backed rain/clear market for Lagos.',
    question: 'Will it rain in Lagos tomorrow?',
    outcomes: ['Yes', 'No'],
    sources: [
      {
        label: 'OpenMeteo Daily Rain',
        url: 'https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.37&daily=rain_sum&timezone=Africa%2FLagos',
        json_path: '$.daily.rain_sum.0',
        outcome_mappings: ['1', '0'],
      },
      {
        label: 'OpenMeteo Hourly Precipitation',
        url: 'https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.37&hourly=precipitation_probability&timezone=Africa%2FLagos',
        json_path: '$.hourly.precipitation_probability.0',
        outcome_mappings: ['80', '10'],
      },
      {
        label: 'Weather Mirror',
        url: 'https://mock.veritas/weather/lagos-rain',
        json_path: '$.forecast',
        outcome_mappings: ['rain', 'clear'],
      },
    ],
  },
  Crypto: {
    category: 'Crypto',
    description: 'CoinGecko-backed binary price market.',
    question: 'Will BTC be above $120,000 by June 30, 2026?',
    outcomes: ['Yes', 'No'],
    sources: [
      {
        label: 'CoinGecko Spot',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        json_path: '$.bitcoin.usd',
        outcome_mappings: ['130000', '95000'],
      },
      {
        label: 'CoinGecko Mirror',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        json_path: '$.bitcoin.usd',
        outcome_mappings: ['130000', '95000'],
      },
      {
        label: 'Market Data Fallback',
        url: 'https://mock.veritas/crypto/btc-june-2026',
        json_path: '$.price',
        outcome_mappings: ['130000', '95000'],
      },
    ],
  },
  Sports: {
    category: 'Sports',
    description: 'Seeded deterministic sports market sources.',
    question: 'Which team wins the 2026 Champions League Final?',
    outcomes: ['Real Madrid', 'Man City', 'PSG'],
    sources: [
      {
        label: 'ESPN API',
        url: 'https://mock.veritas/sports/champions-league-final',
        json_path: '$.winner',
        outcome_mappings: ['realmadrid', 'mancity', 'psg'],
      },
      {
        label: 'Sports Reference API',
        url: 'https://mock.veritas/sports/champions-league-reference',
        json_path: '$.winner',
        outcome_mappings: ['realmadrid', 'mancity', 'psg'],
      },
      {
        label: 'Reuters Match Feed',
        url: 'https://mock.veritas/sports/champions-league-reuters',
        json_path: '$.winner',
        outcome_mappings: ['realmadrid', 'mancity', 'psg'],
      },
    ],
  },
}
