import { formatDistanceStrict } from 'date-fns'

export function formatAddress(address: string): string {
  if (address.length <= 9) {
    return address
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function formatRIALO(lamports: number): string {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: lamports % 1 === 0 ? 0 : 2,
  }).format(lamports)} RIALO`
}

export function formatDeadline(timestamp: number): string {
  const now = Date.now()

  if (timestamp <= now) {
    return 'Expired'
  }

  const distance = formatDistanceStrict(timestamp, now, {
    unit: 'minute',
  })

  const totalMinutes = Math.max(1, Math.floor((timestamp - now) / 60_000))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return distance.replace(' minutes', 'm').replace(' minute', 'm')
}

export function calcImpliedProbability(
  outcomePool: number,
  totalPool: number
): string {
  if (totalPool <= 0) {
    return '0.0%'
  }

  return `${((outcomePool / totalPool) * 100).toFixed(1)}%`
}

export function calcPotentialPayout(
  amount: number,
  outcomePool: number,
  totalPool: number,
  feeBps: number
): number {
  const adjustedOutcomePool = outcomePool + amount
  const adjustedTotalPool = totalPool + amount

  if (adjustedOutcomePool <= 0) {
    return 0
  }

  const grossPayout =
    (amount / adjustedOutcomePool) * adjustedTotalPool

  return grossPayout * (1 - feeBps / 10_000)
}
