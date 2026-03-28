# RealFi Payroll dApp (Pharos + CCTP)

A starter implementation of a **RealFi payroll dApp** designed for **Pharos chain settlement**, with:

- Employer-funded USDC payroll from any supported chain
- CCTP route simulation to worker preferred chain
- Instant payout in USDC
- Per-second streaming salary support
- Worker invoice generation and NFT conversion
- Credit scoring from payroll history

## UI Modes

### Employer UI

- Input worker address
- Input USDC amount
- Select source chain and destination chain
- Trigger **Pay via CCTP**
- Toggle per-second streaming mode

### Worker UI

- View payment history
- View transaction status
- Generate invoice
- Convert invoice to NFT (demo token ID)
- Track payroll-driven credit score

## Contracts Included

- `contracts/RealFiPayroll.sol`
  - Instant payroll settlement
  - Per-second stream opening + claiming
- `contracts/InvoiceNFT.sol`
  - Mint invoice NFTs
  - Mark invoices paid
- `contracts/CreditScoring.sol`
  - Record payment history
  - Compute worker credit score

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## If the site appears blank

Most blank-screen issues come from serving source files directly (`index.html` + `src/*`) instead of serving the built `dist/` bundle.

Use:

```bash
npm install
npm run build
npm run preview
```

If deploying to static hosting (Netlify, Vercel, Nginx, GitHub Pages), publish the `dist/` directory after `npm run build`.

## Notes for Pharos integration

The frontend includes chain metadata constants for Pharos and a CCTP-oriented flow model. For production:

1. Replace simulated payment actions with wallet + contract calls.
2. Integrate Circle CCTP contracts/attestations and finality checks.
3. Configure deployed contract addresses per chain.
4. Add indexed event listeners for cross-chain state updates.
5. Harden invoice NFT with full ERC-721 implementation and metadata URIs.
