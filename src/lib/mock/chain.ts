import { customAlphabet } from 'nanoid'

import {
  BLOCK_TIME_MS,
  TX_MAX_DELAY_MS,
  TX_MIN_DELAY_MS,
} from '@/lib/constants'
import type { SubmitTransactionResult, TxType } from '@/lib/types'
import { useChainStore } from '@/store/chainStore'

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

const addressBodyGenerator = customAlphabet(BASE58_ALPHABET, 28)
const hashGenerator = customAlphabet(BASE58_ALPHABET, 64)

let intervalStarted = false

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function startBlockProduction(): void {
  if (intervalStarted || typeof window === 'undefined') {
    return
  }

  intervalStarted = true

  window.setInterval(() => {
    useChainStore.getState().incrementBlock()
  }, BLOCK_TIME_MS)
}

export function getCurrentBlock(): number {
  return useChainStore.getState().currentBlock
}

export async function submitTransaction(
  _type: TxType,
  _description: string,
  simulatedWorkMs?: number
): Promise<SubmitTransactionResult> {
  const delay =
    simulatedWorkMs ?? randomBetween(TX_MIN_DELAY_MS, TX_MAX_DELAY_MS)

  await sleep(delay)

  return {
    signature: generateTxHash(),
    block: getCurrentBlock(),
  }
}

export function generateAddress(): string {
  return `RiaL${addressBodyGenerator()}`
}

export function generateTxHash(): string {
  return hashGenerator()
}
