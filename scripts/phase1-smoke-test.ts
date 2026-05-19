import { createMarket, claimPayout, placeBet } from '../src/lib/mock/contract'
import { connectWallet } from '../src/lib/mock/wallet'
import {
  seededMarkets,
  seededPositions,
  seededResolutionLogs,
} from '../src/lib/mock/seed'
import type { CreateMarketParams } from '../src/lib/types'
import { useMarketStore } from '../src/store/marketStore'
import { useWalletStore } from '../src/store/walletStore'

async function main(): Promise<void> {
  useMarketStore.setState({
    markets: structuredClone(seededMarkets),
    positions: structuredClone(seededPositions),
    resolutionLog: structuredClone(seededResolutionLogs),
    isLoading: false,
  })
  useWalletStore.setState({
    wallet: null,
    isConnecting: false,
    pendingTxs: [],
    txHistory: [],
  })

  const wallet = await connectWallet('Veritas Builder')
  console.log('connected wallet', wallet.address, wallet.balance)

  const params: CreateMarketParams = {
    question: 'Will Veritas Phase 1 complete successfully?',
    outcome_labels: ['Yes', 'No'],
    resolution_sources: [
      {
        label: 'OpenMeteo Mirror',
        url: 'https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.37&daily=rain_sum&timezone=Africa%2FLagos',
        json_path: '$.daily.rain_sum.0',
        outcome_mappings: ['1', '0'],
      },
      {
        label: 'Consensus Mirror',
        url: 'https://mock.veritas/weather/veritas-phase-1',
        json_path: '$.forecast',
        outcome_mappings: ['1', '0'],
      },
      {
        label: 'Weather Mirror 2',
        url: 'https://mock.veritas/weather/veritas-phase-1-b',
        json_path: '$.forecast',
        outcome_mappings: ['1', '0'],
      },
    ],
    deadline: Date.now() + 10 * 60 * 1_000,
    category: 'Other',
  }

  const { market, signature: createSignature } = await createMarket(wallet, params)
  console.log('created market', market.id, createSignature)

  const { position, signature: betSignature } = await placeBet(
    useWalletStore.getState().wallet!,
    market.id,
    0,
    250
  )
  console.log('placed bet', position.id, position.amount, betSignature)

  const beforeClaim = useWalletStore.getState().wallet?.balance ?? 0
  const { payout, signature: payoutSignature } = await claimPayout(
    useWalletStore.getState().wallet!,
    'pos_6'
  )
  const afterClaim = useWalletStore.getState().wallet?.balance ?? 0

  console.log('claim payout', {
    payout,
    payoutSignature,
    beforeClaim,
    afterClaim,
    delta: afterClaim - beforeClaim,
  })
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
