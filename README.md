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

**Bank of America** — Log in > Select account > Click "Download" > Set date range > Select CSV > Download

**Charles Schwab** — Log in > Accounts > History > Select account & range > Click "Export" > CSV

**Kraken** — Log in > Profile > Documents > Create Export > Ledgers > CSV > Generate > Download

## Tech Stack

React 18 + Vite 5 + PapaParse + Recharts + localStorage + pure inline CSS (Win95 design system)

## Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for the full technical reference — architecture, data model, classification engine, all tab details, and development guide.
