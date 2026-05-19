# Veritas Mock Layer

This directory contains the complete Rialo testnet simulation used by the Veritas UI.
Every exported function is designed so the UI can later swap the mock implementation
for a real chain-backed one without changing component code.

## Swap strategy

| Mock file | Responsibility in this mock | Real replacement |
|-----------|-----------------------------|------------------|
| `mock/chain.ts` | Simulated block clock, tx confirmation delay, address/hash generation | `@solana/web3.js` `Connection` plus Rialo provider wiring |
| `mock/wallet.ts` | Mock account-abstraction wallet connect/sign/balance lifecycle | Rialo wallet adapter with email/social auth |
| `mock/contract.ts` | Pure TypeScript implementation of Veritas instructions | Anchor/Rialo client generated from deployed IDL |
| `mock/resolution.ts` | Sequential async HTTP consensus state machine | Native Rialo async execution with HTTP syscall |
| `mock/sources.ts` | Source adapter registry and fetch fallbacks | On-chain `SourceConfig` execution and parsing |
| `mock/seed.ts` | First-run demo state for markets, positions, and logs | On-chain account fetch plus indexer/event hydration |
| `store/marketStore.ts` | Client-side persisted account cache | Account subscriptions and indexed query layer |

## Runtime mapping

- `connectWallet(label)` mirrors the eventual Rialo login entrypoint.
- `submitTransaction(type, description)` stands in for signed tx submission and confirmation.
- `createMarket`, `placeBet`, `claimPayout`, `claimRefund`, and `triggerResolution` use the same call signatures the real client will keep.
- `runResolution(marketId)` models Rialo's async sleep/wake HTTP flow and writes a replayable resolution log for the UI.

## Persistence model

- Wallet state persists by identity label.
- Market state, positions, and resolution logs persist through Zustand storage.
- Seed data loads only when no existing market state is present.

## Notes

- Real public APIs are attempted first for weather and crypto sources.
- If a public API fails, the adapter falls back silently to deterministic seeded output so the demo never dead-ends.
- No component should contain chain logic; all simulation belongs in this directory or the Zustand stores that cache its state.
