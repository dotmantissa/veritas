import { customAlphabet } from 'nanoid'

import { STARTING_BALANCE } from '@/lib/constants'
import { generateTxHash } from '@/lib/mock/chain'
import type { MockWallet } from '@/lib/types'
import { useWalletStore } from '@/store/walletStore'

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const addressBodyGenerator = customAlphabet(BASE58_ALPHABET, 28)
const STORAGE_KEY = 'veritas:mock-wallet-registry'
const labelAddressMap: Record<string, string> = {
  'Rialo Explorer': 'RiaL7xKmFgQp9nBvT3cWs8Ae2Zq4YhNd',
  'Alpha Tester': 'RiaL4fJmP2sHb8QxNc6Tw9ZuLk5Vr3Md',
  'Veritas Builder': 'RiaL9nBvT3cWs8Ae2Zq4YhNd7xKmFgQp',
}

let memoryRegistry: WalletRegistry = {}

interface WalletRegistry {
  [label: string]: MockWallet
}

function getRegistry(): WalletRegistry {
  if (typeof window === 'undefined') {
    return memoryRegistry
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as WalletRegistry
  } catch {
    return {}
  }
}

function setRegistry(registry: WalletRegistry): void {
  if (typeof window === 'undefined') {
    memoryRegistry = registry
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registry))
}

function hashString(input: string): number {
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function createDeterministicAddress(label: string): string {
  if (labelAddressMap[label]) {
    return labelAddressMap[label]
  }

  const seed = hashString(label)
  const characters: string[] = []

  let cursor = seed || 1

  for (let index = 0; index < 28; index += 1) {
    cursor = (cursor * 9301 + 49297) % 233280
    characters.push(BASE58_ALPHABET[cursor % BASE58_ALPHABET.length] ?? '1')
  }

  return `RiaL${characters.join('') || addressBodyGenerator()}`
}

export async function connectWallet(label: string): Promise<MockWallet> {
  const registry = getRegistry()
  const existing = registry[label]

  const wallet: MockWallet =
    existing ??
    ({
      address: createDeterministicAddress(label),
      balance: STARTING_BALANCE,
      connected: true,
      label,
    } satisfies MockWallet)

  const connectedWallet: MockWallet = {
    ...wallet,
    connected: true,
  }

  registry[label] = connectedWallet
  setRegistry(registry)

  useWalletStore.getState().setWallet(connectedWallet)
  useWalletStore.getState().setConnecting(false)

  return connectedWallet
}

export function disconnectWallet(): void {
  const state = useWalletStore.getState()

  if (!state.wallet) {
    return
  }

  state.setWallet(null)
  state.resetRuntimeState()
}

export async function deductBalance(amount: number): Promise<void> {
  const state = useWalletStore.getState()
  const wallet = state.wallet

  if (!wallet || !wallet.connected) {
    throw new Error('Wallet not connected')
  }

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance')
  }

  const updatedWallet = {
    ...wallet,
    balance: wallet.balance - amount,
  }

  state.setWallet(updatedWallet)

  const registry = getRegistry()
  registry[wallet.label] = updatedWallet
  setRegistry(registry)
}

export async function addBalance(amount: number): Promise<void> {
  const state = useWalletStore.getState()
  const wallet = state.wallet

  if (!wallet || !wallet.connected) {
    throw new Error('Wallet not connected')
  }

  const updatedWallet = {
    ...wallet,
    balance: wallet.balance + amount,
  }

  state.setWallet(updatedWallet)

  const registry = getRegistry()
  registry[wallet.label] = updatedWallet
  setRegistry(registry)
}

export async function signTransaction(_description: string): Promise<string> {
  const wallet = useWalletStore.getState().wallet

  if (!wallet || !wallet.connected) {
    throw new Error('Wallet not connected')
  }

  return generateTxHash()
}
