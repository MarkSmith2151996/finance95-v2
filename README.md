# finance95.exe

A Windows 95-styled personal finance hub. Import bank CSVs, auto-classify transactions, strip out fake income from inter-account transfers, and see your real numbers.

## The Problem

Bank of America counts transfers between your own accounts as income. Move $1,000 from savings to checking? BofA says you earned $1,000. This app fixes that.

## Features

- **Multi-platform CSV import** — Bank of America, Charles Schwab, Kraken (auto-detected)
- **Smart classification** — Keyword-based categorization with confidence scoring
- **Transfer detection** — Keyword matching + amount-pair matching across accounts
- **Dashboard** — Real income, expenses, savings rate, spending breakdown (charts)
- **Budgeting** — Per-category monthly budgets with progress tracking
- **Net worth tracker** — Assets vs liabilities with category breakdowns
- **Protected money** — Emergency fund health, sinking funds, savings goals
- **Spending optimizer** — Recurring charge detection, category savings analysis
- **100% client-side** — All data stays in your browser (localStorage), never sent anywhere

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploy

```bash
npm run build      # Production build to dist/
```

Works with Vercel out of the box — connect the repo and it auto-deploys.

## How to Get Your CSVs

See [DOCUMENTATION.md — CSV Export Guide](DOCUMENTATION.md#csv-export-guide) for full step-by-step instructions with tips and gotchas for each platform.

**Quick version:**

- **Bank of America** — Log in > Select account > Click "Download" above transaction list > Set date range > Select "Microsoft Excel Format" (this is the CSV) > Download. Max 3,000 transactions per export. Desktop web only.

- **Charles Schwab** — Log in > Accounts > History > Select account & date range > Click "Export" (top-right of table) > CSV downloads automatically. Brokerage: up to 4 years. Bank: up to 2 years. Desktop web only.

- **Kraken** — Log in > Profile icon > Settings > Documents > Create Export > Select "Ledger" + date range + CSV > Generate > Wait for processing (minutes to days) > Download ZIP > Extract `ledgers.csv`. No email notification — check back manually.

## Tech Stack

React 18 + Vite 5 + PapaParse + Recharts + localStorage + pure inline CSS (Win95 design system)

## Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for the full technical reference — architecture, data model, classification engine, all tab details, and development guide.
