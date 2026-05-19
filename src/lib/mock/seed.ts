import type {
  Market,
  Position,
  ResolutionDetail,
  SourceConfig,
} from '@/lib/types'

const seededAddresses = {
  explorer: 'RiaL7xKmFgQp9nBvT3cWs8Ae2Zq4YhNd',
  alpha: 'RiaL4fJmP2sHb8QxNc6Tw9ZuLk5Vr3Md',
  builder: 'RiaL9nBvT3cWs8Ae2Zq4YhNd7xKmFgQp',
  whale: 'RiaL2zQkLm8Tp4VnCx6Hs9BdWf1Rg7Ja',
  syndicate: 'RiaL8mHxQ4pTn2CvW7Ls5ZdKf3Yb9RaE',
}

function hoursFromNow(hours: number): number {
  return Date.now() + hours * 60 * 60 * 1_000
}

function daysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1_000
}

function minutesAgo(minutes: number): number {
  return Date.now() - minutes * 60 * 1_000
}

function createSource(
  label: string,
  url: string,
  jsonPath: string,
  outcomeMappings: string[]
): SourceConfig {
  return {
    label,
    url,
    json_path: jsonPath,
    outcome_mappings: outcomeMappings,
  }
}

const market1Sources = [
  createSource(
    'CoinGecko Spot',
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    '$.bitcoin.usd',
    ['130000', '95000']
  ),
  createSource(
    'CoinGecko Mirror',
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    '$.bitcoin.usd',
    ['130000', '95000']
  ),
  createSource(
    'Market Data Fallback',
    'https://mock.veritas/crypto/btc-june-2026',
    '$.price',
    ['130000', '95000']
  ),
]

const market2Sources = [
  createSource(
    'OpenMeteo Forecast',
    'https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.37&daily=rain_sum&timezone=Africa%2FLagos',
    '$.daily.rain_sum.0',
    ['1', '0']
  ),
  createSource(
    'OpenMeteo Hourly',
    'https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.37&hourly=precipitation_probability&timezone=Africa%2FLagos',
    '$.hourly.precipitation_probability.0',
    ['80', '10']
  ),
  createSource(
    'Weather Mirror',
    'https://mock.veritas/weather/lagos-rain',
    '$.forecast',
    ['rain', 'clear']
  ),
]

const market3Sources = [
  createSource(
    'ESPN API',
    'https://mock.veritas/sports/champions-league-final',
    '$.winner',
    ['realmadrid', 'mancity', 'psg']
  ),
  createSource(
    'Sports Reference API',
    'https://mock.veritas/sports/champions-league-reference',
    '$.winner',
    ['realmadrid', 'mancity', 'psg']
  ),
  createSource(
    'Reuters Match Feed',
    'https://mock.veritas/sports/champions-league-reuters',
    '$.winner',
    ['realmadrid', 'mancity', 'psg']
  ),
]

const market4Sources = [
  createSource(
    'Reuters Macro',
    'https://mock.veritas/politics/fed-reuters',
    '$.decision',
    ['yes', 'no']
  ),
  createSource(
    'Bloomberg Rates',
    'https://mock.veritas/politics/fed-bloomberg',
    '$.decision',
    ['yes', 'no']
  ),
  createSource(
    'FOMC Digest',
    'https://mock.veritas/politics/fed-digest',
    '$.decision',
    ['yes', 'no']
  ),
]

const market5Sources = [
  createSource(
    'CoinGecko Market Caps',
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd',
    '$.bitcoin.usd',
    ['flippening', 'no']
  ),
  createSource(
    'CryptoCompare Mirror',
    'https://mock.veritas/crypto/market-cap-mirror',
    '$.winner',
    ['flippening', 'no']
  ),
  createSource(
    'Narrative Check',
    'https://mock.veritas/crypto/narrative',
    '$.winner',
    ['flippening', 'no']
  ),
]

const market6Sources = [
  createSource(
    'Global Sports Wire',
    'https://mock.veritas/sports/world-cup-wire',
    '$.winner',
    ['brazil', 'argentina', 'france', 'other']
  ),
  createSource(
    'Match Centre',
    'https://mock.veritas/sports/world-cup-centre',
    '$.winner',
    ['brazil', 'argentina', 'france', 'other']
  ),
  createSource(
    'Reuters Tournament Feed',
    'https://mock.veritas/sports/world-cup-reuters',
    '$.winner',
    ['brazil', 'argentina', 'france', 'other']
  ),
]

const market4Resolution: ResolutionDetail = {
  source_results: [
    {
      source: market4Sources[0],
      raw_value: 'yes',
      parsed_outcome: 0,
      latency_ms: 312,
      status: 'success',
    },
    {
      source: market4Sources[1],
      raw_value: 'yes',
      parsed_outcome: 0,
      latency_ms: 447,
      status: 'success',
    },
    {
      source: market4Sources[2],
      raw_value: 'no',
      parsed_outcome: 1,
      latency_ms: 589,
      status: 'success',
    },
  ],
  consensus_outcome: null,
  resolved_at: minutesAgo(30),
  method: 'disputed',
}

const market5Resolution: ResolutionDetail = {
  source_results: [
    {
      source: market5Sources[0],
      raw_value: 'no',
      parsed_outcome: 1,
      latency_ms: 318,
      status: 'success',
    },
    {
      source: market5Sources[1],
      raw_value: 'no',
      parsed_outcome: 1,
      latency_ms: 401,
      status: 'success',
    },
    {
      source: market5Sources[2],
      raw_value: 'no',
      parsed_outcome: 1,
      latency_ms: 516,
      status: 'success',
    },
  ],
  consensus_outcome: 1,
  resolved_at: daysAgo(1),
  method: 'consensus',
}

const market6Resolution: ResolutionDetail = {
  source_results: [
    {
      source: market6Sources[0],
      raw_value: 'brazil',
      parsed_outcome: 0,
      latency_ms: 321,
      status: 'success',
    },
    {
      source: market6Sources[1],
      raw_value: 'argentina',
      parsed_outcome: 1,
      latency_ms: 488,
      status: 'success',
    },
    {
      source: market6Sources[2],
      raw_value: 'france',
      parsed_outcome: 2,
      latency_ms: 603,
      status: 'success',
    },
  ],
  consensus_outcome: null,
  resolved_at: daysAgo(2),
  method: 'disputed',
}

export const seededMarkets: Market[] = [
  {
    id: 'mkt_btc_june_2026',
    creator: seededAddresses.builder,
    question: 'Will Bitcoin close above $120,000 on June 30, 2026?',
    outcome_labels: ['Yes', 'No'],
    resolution_sources: market1Sources,
    consensus_threshold: 3,
    deadline: hoursFromNow(96),
    total_pool: 13_800,
    outcome_pools: [8_400, 5_400],
    status: 'Open',
    resolved_outcome: null,
    created_at: daysAgo(4),
    category: 'Crypto',
  },
  {
    id: 'mkt_lagos_rain_may_2026',
    creator: seededAddresses.explorer,
    question: 'Will it rain in Lagos on May 25, 2026?',
    outcome_labels: ['Yes', 'No'],
    resolution_sources: market2Sources,
    consensus_threshold: 3,
    deadline: hoursFromNow(36),
    total_pool: 2_340,
    outcome_pools: [1_120, 1_220],
    status: 'Open',
    resolved_outcome: null,
    created_at: daysAgo(2),
    category: 'Weather',
  },
  {
    id: 'mkt_ucl_final_2026',
    creator: seededAddresses.alpha,
    question: 'Which team wins the 2026 Champions League Final?',
    outcome_labels: ['Real Madrid', 'Man City', 'PSG'],
    resolution_sources: market3Sources,
    consensus_threshold: 3,
    deadline: hoursFromNow(72),
    total_pool: 9_600,
    outcome_pools: [3_100, 4_700, 1_800],
    status: 'Open',
    resolved_outcome: null,
    created_at: daysAgo(3),
    category: 'Sports',
  },
  {
    id: 'mkt_fed_june_2026',
    creator: seededAddresses.whale,
    question: 'Will the Fed cut rates in their June 2026 meeting?',
    outcome_labels: ['Yes', 'No'],
    resolution_sources: market4Sources,
    consensus_threshold: 3,
    deadline: minutesAgo(10),
    total_pool: 7_240,
    outcome_pools: [4_900, 2_340],
    status: 'Resolving',
    resolved_outcome: null,
    created_at: daysAgo(5),
    category: 'Finance',
    resolution_detail: market4Resolution,
  },
  {
    id: 'mkt_eth_flip_btc',
    creator: seededAddresses.builder,
    question: 'Will ETH flip BTC market cap before 2027?',
    outcome_labels: ['Yes', 'No'],
    resolution_sources: market5Sources,
    consensus_threshold: 3,
    deadline: daysAgo(1),
    total_pool: 14_400,
    outcome_pools: [6_100, 8_300],
    status: 'Resolved',
    resolved_outcome: 1,
    created_at: daysAgo(12),
    category: 'Crypto',
    resolution_detail: market5Resolution,
  },
  {
    id: 'mkt_world_cup_2026',
    creator: seededAddresses.syndicate,
    question: 'Who wins the 2026 FIFA World Cup?',
    outcome_labels: ['Brazil', 'Argentina', 'France', 'Other'],
    resolution_sources: market6Sources,
    consensus_threshold: 3,
    deadline: daysAgo(2),
    total_pool: 11_350,
    outcome_pools: [3_100, 3_450, 2_900, 1_900],
    status: 'Disputed',
    resolved_outcome: null,
    created_at: daysAgo(20),
    category: 'Sports',
    resolution_detail: market6Resolution,
  },
]

export const seededPositions: Position[] = [
  {
    id: 'pos_1',
    owner: seededAddresses.explorer,
    market_id: 'mkt_btc_june_2026',
    outcome_index: 0,
    amount: 900,
    claimed: false,
    created_at: daysAgo(3),
  },
  {
    id: 'pos_2',
    owner: seededAddresses.alpha,
    market_id: 'mkt_btc_june_2026',
    outcome_index: 1,
    amount: 1_800,
    claimed: false,
    created_at: daysAgo(2),
  },
  {
    id: 'pos_3',
    owner: seededAddresses.builder,
    market_id: 'mkt_lagos_rain_may_2026',
    outcome_index: 0,
    amount: 600,
    claimed: false,
    created_at: daysAgo(1),
  },
  {
    id: 'pos_4',
    owner: seededAddresses.whale,
    market_id: 'mkt_ucl_final_2026',
    outcome_index: 1,
    amount: 2_500,
    claimed: false,
    created_at: daysAgo(1),
  },
  {
    id: 'pos_5',
    owner: seededAddresses.explorer,
    market_id: 'mkt_fed_june_2026',
    outcome_index: 0,
    amount: 1_250,
    claimed: false,
    created_at: daysAgo(4),
  },
  {
    id: 'pos_6',
    owner: seededAddresses.builder,
    market_id: 'mkt_eth_flip_btc',
    outcome_index: 1,
    amount: 2_700,
    claimed: false,
    created_at: daysAgo(10),
  },
  {
    id: 'pos_7',
    owner: seededAddresses.alpha,
    market_id: 'mkt_world_cup_2026',
    outcome_index: 2,
    amount: 800,
    claimed: false,
    created_at: daysAgo(15),
  },
]

export const seededResolutionLogs: Record<string, string[]> = {
  mkt_fed_june_2026: [
    '[Block #284710] Resolution triggered for market mkt_fed_june_2026',
    '[Block #284712] Fetching source 1/3: Reuters Macro...',
    '[Block #284714] ✓ Source 1 returned: "yes" → maps to outcome: "Yes" (312ms)',
    '[Block #284716] Fetching source 2/3: Bloomberg Rates...',
    '[Block #284718] ✓ Source 2 returned: "yes" → maps to outcome: "Yes" (447ms)',
    '[Block #284720] Fetching source 3/3: FOMC Digest...',
    '[Block #284723] ✓ Source 3 returned: "no" → maps to outcome: "No" (589ms)',
    '[Block #284724] Consensus failed: only 2/3 sources agree',
    '[Block #284724] Market moved to disputed state. Refunds available.',
  ],
  mkt_eth_flip_btc: [
    '[Block #284801] Resolution triggered for market mkt_eth_flip_btc',
    '[Block #284804] ✓ Source 1 returned: "no" → maps to outcome: "No" (318ms)',
    '[Block #284807] ✓ Source 2 returned: "no" → maps to outcome: "No" (401ms)',
    '[Block #284810] ✓ Source 3 returned: "no" → maps to outcome: "No" (516ms)',
    '[Block #284811] Consensus reached: 3/3 sources agree → "No"',
    '[Block #284811] ✓ Market resolved. Payouts available.',
  ],
  mkt_world_cup_2026: [
    '[Block #285000] Resolution triggered for market mkt_world_cup_2026',
    '[Block #285004] ✓ Source 1 returned: "brazil" → maps to outcome: "Brazil" (321ms)',
    '[Block #285008] ✓ Source 2 returned: "argentina" → maps to outcome: "Argentina" (488ms)',
    '[Block #285012] ✓ Source 3 returned: "france" → maps to outcome: "France" (603ms)',
    '[Block #285013] Consensus failed: no outcome reached threshold',
    '[Block #285013] Market moved to disputed state. Refunds available.',
  ],
}
