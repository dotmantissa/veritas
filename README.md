# Veritas

Veritas is a prediction market demo built on top of the Rialo protocol. It lets you create markets, place bets, and watch them resolve without a real blockchain, real tokens, or real oracles. The point is to show what Rialo actually feels like to use before the mainnet exists.


## What is Rialo?

Most prediction markets today rely on oracles, trusted third parties that report real-world outcomes on-chain. Rialo removes that dependency entirely. Instead of asking a reporter whether something happened, a Rialo market fetches the answer directly from the internet at resolution time. You specify which URLs to read and how to interpret them when you create the market. When the deadline passes, the contract hits all those sources simultaneously, runs a consensus check, and settles with no human in the loop.

Veritas is the testnet demo of that idea. Everything runs in your browser. The "chain" is localStorage. The tokens are fake. But the mechanics, market creation, betting, multi-source resolution, consensus, payouts, and disputes, are real and fully wired up.


## How it works for users

### Connecting a wallet

Click **Connect Wallet** in the top right. You will get a choice of three pre-loaded mock wallets, each starting with 10,000 RIALO. Pick one and you are in. Your address, balance, and transaction history persist across page reloads.

### Browsing markets

The **Markets** page shows every open, resolving, resolved, and disputed market. You can filter by category (Sports, Finance, Crypto, Weather, Politics, Entertainment) or by status. Each card shows the question, the current outcome probabilities based on pool sizes, the resolution deadline, and how many sources will be consulted at resolution time.

### Placing a bet

Open any market that is still accepting bets. Pick the outcome you believe in, enter an amount (minimum 100 RIALO), and confirm. Your bet goes into that outcome's pool. Probabilities update in real time as the pools shift. A 2% protocol fee is deducted at resolution, not at bet time.

### Creating a market

Hit **Create Market** and fill in:

- **Question:** what you are asking, up to 280 characters
- **Outcomes:** between 2 and 5 possible answers
- **Resolution sources:** between 3 and 5 URLs, each with a JSON path to extract the value and a mapping that translates that value to one of your outcomes
- **Deadline:** at least 5 minutes in the future
- **Category:** for filtering

Once submitted, the market is live immediately and anyone can bet on it.

### Triggering resolution

After the deadline passes, a **Trigger Resolution** button appears on the market page. Click it and the contract fetches all your configured sources in parallel. You can watch each source respond in real time in the Resolution Console, green for a successful read and red for a failure or disagreement. Once all sources respond, the contract tallies the votes.

If a majority of sources agree (the default threshold is 3 out of however many you configured), the market resolves to that outcome. If sources disagree or too many fail, the market enters a **Disputed** state and all bettors get refunds.

### Claiming payouts

If your outcome won, a **Claim** button appears on your position. Your payout is proportional to your share of the winning pool, drawn from the entire pot minus the protocol fee. Disputed markets show a **Refund** button instead and you get your original stake back in full.

### Portfolio

The **Portfolio** page shows all your open positions, any claimable payouts or refunds, and your full transaction history with block numbers and confirmation times.


## The Rialo technical stack

### Resolution without oracles

The core idea in Rialo is that a market's resolution sources are baked in at creation time. When you create a market you are not just asking a question; you are also specifying the exact API endpoints, JSON paths, and value mappings that will determine the answer. The contract does not trust any single source and requires consensus across all of them.

In Veritas, this is implemented in `src/lib/mock/resolution.ts`. When resolution is triggered, `runResolution()` fetches every source with a staggered delay to simulate real network conditions, extracts the value at the configured JSON path, maps it to one of the market's outcomes, and counts the votes. The winning outcome needs to clear the consensus threshold and if it does not, the market disputes automatically.

Two of the source adapters (`CoinGecko` and `OpenMeteo`) make real HTTP requests to live APIs. The sports and politics sources use deterministic mock responses seeded from the market ID, so they behave consistently across reloads without hitting real endpoints.

### The simulated chain layer

Veritas has no backend. The entire blockchain lives in your browser:

- **`src/lib/mock/chain.ts`** produces a new block every 50ms, generates transaction hashes and wallet addresses using Base58 encoding, and simulates confirmation delays between 800ms and 1.8 seconds.
- **`src/lib/mock/contract.ts`** holds the core contract functions: `createMarket`, `placeBet`, `triggerResolution`, `claimPayout`, and `claimRefund`. Each function validates state, mutates the Zustand store, and submits a mock transaction.
- **`src/lib/mock/wallet.ts`** handles deterministic address generation from a label string, balance management, and wallet registry persistence.
- **`src/lib/mock/sources.ts`** contains the source adapters with JSON path extraction and outcome mapping.

All persistent state (markets, positions, resolution logs, wallet balances, and transaction history) is written to `localStorage` under the keys `veritas-market-store` and `veritas-wallet-store`.

### State management

State is managed with Zustand across three stores:

| Store | What it holds | Persisted |
|---|---|---|
| `marketStore` | Markets, positions, resolution logs | localStorage |
| `walletStore` | Connected wallet, transaction history | localStorage |
| `chainStore` | Current block number, network status | In-memory only |

### Market mechanics

**Pool-based pricing.** There are no order books. Each outcome has a pool. When you bet on an outcome, your tokens go into that pool. Your implied probability is `outcomePool / totalPool`, the same constant-product style used by most on-chain prediction markets.

**Fee model.** A 2% protocol fee (`FEE_BPS = 200`) is taken from the total pool at resolution time before payouts are calculated. Bettors on the winning outcome split `totalPool * 0.98` proportionally to their share of the winning pool.

**Payout formula:**
```
payout = (yourBet / winningOutcomePool) * (totalPool * (1 - fee))
```

**Consensus threshold.** Each market has a `consensus_threshold` (default: 3). Resolution succeeds only if at least that many sources agree on the same outcome. If the threshold is not met because sources disagree, return errors, or produce a tie, the market disputes and all positions become refundable.

### Frontend

- **Next.js 14** with the App Router
- **TypeScript** throughout
- **Tailwind CSS** for styling, dark theme, glassmorphism cards, animated gradients
- **Zustand** for state
- **Sonner** for toast notifications
- **date-fns** for deadline formatting
- **Lucide React** for icons
- **Bebas Neue** for display headings, **DM Sans** for body text, **DM Mono** for addresses and hashes


## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. No environment variables are required as everything runs client-side.

```bash
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```


## Project structure

```
src/
  app/                  # Next.js pages (App Router)
    page.tsx            # Landing page
    markets/            # Market list, create, and detail pages
    portfolio/          # Portfolio page
  components/
    markets/            # MarketCard, BetPanel, ResolutionConsole, etc.
    wallet/             # WalletButton, WalletModal, TxToast
    portfolio/          # PortfolioSummary, PositionCard
    layout/             # Navbar, Footer
    brand/              # Logo variants
  lib/
    mock/               # Simulated chain layer
      chain.ts          # Block production, tx simulation
      contract.ts       # Core contract functions
      resolution.ts     # Multi-source resolution engine
      sources.ts        # Source adapters and JSON path extraction
      wallet.ts         # Wallet management
      seed.ts           # Pre-loaded demo markets
    types.ts            # All TypeScript interfaces
    constants.ts        # Protocol constants
    utils.ts            # Formatting and calculation helpers
  store/
    marketStore.ts      # Markets and positions
    walletStore.ts      # Wallet and transactions
    chainStore.ts       # Chain state
```


## Seeded demo markets

Veritas ships with six pre-loaded markets so you can explore the full lifecycle without creating anything:

| Market | Category | Status |
|---|---|---|
| Will BTC close above $120k by June 30, 2026? | Crypto | Open |
| Will it rain in Lagos tomorrow? | Weather | Open |
| Which team wins the 2026 Champions League Final? | Sports | Open |
| Will the Fed cut rates in June 2026? | Politics | Disputed |
| Will ETH market cap exceed BTC? | Crypto | Resolved (No) |
| Which team wins the 2026 World Cup? | Sports | Disputed |

The resolved and disputed markets show what the end states look like, including the per-source resolution logs and claimable payouts or refunds.


## What this is and isn't

Veritas is a **demo**. It is not a live product. The tokens have no value, the chain is fake, and the resolution sources are a mix of real APIs and mocked responses. The purpose is to make the Rialo protocol tangible and to let you feel the UX of oracle-free prediction markets before the real contracts are deployed.

The production Rialo protocol will replace the mock chain layer with actual smart contracts, replace the mock wallet with real wallet signing, and replace the simulated source fetching with on-chain HTTP oracle calls. The user experience, creating markets, betting, and watching resolution happen in real time, is designed to stay the same.
