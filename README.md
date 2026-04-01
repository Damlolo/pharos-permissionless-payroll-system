# RealFi Payroll dApp (Pharos Testnet)

This app now uses **email-based onboarding only** (no wallet connection flow in UI).

## Registration and Profile

Every user (Employer or User) registers with an email address.
On registration, a profile is automatically created and can be edited with:

- Name
- Username
- Profile picture upload
- Bio
- Social binding links (Twitter, LinkedIn, GitHub)
- Sign out

Profile is available from a **top-right profile icon tab** that displays the current profile picture (or initial).

## Role-based UI

### Employer

Tabs:

- **Send**: regular Web3 outgoing transfer simulation
- **Receive**: regular Web3 incoming transfer simulation
- **Pay**: salary payment flow (`worker address`, `amount`, `confirm transaction`)

Histories:

- **Transaction History** (send/receive)
- **Payment History** (salary pay actions)

### User

Tabs:

- **Send**: regular Web3 outgoing transfer simulation
- **Receive**: regular Web3 incoming transfer simulation
- **Collect**: salary receival flow (`amount received`, `create invoice`, `mint invoice`, `send invoice NFT`)

Histories:

- **Transaction History** (send/receive)
- **Receival History** (salary collect actions)

## Run locally

```bash
npm install
npm run dev
```

## Build + preview

```bash
npm run build
npm run preview
```

## If website is blank

Do **not** host raw source files directly (`src/*`).
Always build and host the `dist/` output.

## Smart contracts included

- `contracts/RealFiPayroll.sol`
- `contracts/InvoiceNFT.sol`
- `contracts/CreditScoring.sol`
