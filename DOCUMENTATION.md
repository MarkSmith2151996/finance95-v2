# finance95 — Master Documentation

> A Windows 95-styled personal finance hub built in React. Parses bank CSVs, classifies transactions, detects transfers, and gives you real spending/income numbers.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [Design System](#design-system)
- [Data Model](#data-model)
- [Classification Engine](#classification-engine)
- [CSV Parsers](#csv-parsers)
- [Transfer Detection](#transfer-detection)
- [Application Tabs](#application-tabs)
  - [Import](#import-tab)
  - [Review](#review-tab)
  - [Dashboard](#dashboard-tab)
  - [Budget](#budget-tab)
  - [Net Worth](#net-worth-tab)
  - [Protected Money](#protected-money-tab)
  - [Optimize](#optimize-tab)
- [Storage](#storage)
- [Deployment](#deployment)
- [Development](#development)

---

## Problem Statement

Bank of America (and other banks) inflate your reported income by counting inter-account transfers as income. If you move $1,000 from savings to checking, BofA counts that as $1,000 of income. This app strips out transfers and gives you real numbers.

The app also consolidates data from multiple financial platforms (BofA, Charles Schwab, Kraken) into a single dashboard with budgeting, net worth tracking, and spending optimization.

---

## Architecture Overview

```
                     ┌─────────────────────────┐
                     │       index.html         │
                     │  (Vite entry point)      │
                     └───────────┬─────────────┘
                                 │
                     ┌───────────▼─────────────┐
                     │      src/main.jsx        │
                     │  (React root mount)      │
                     └───────────┬─────────────┘
                                 │
                     ┌───────────▼─────────────┐
                     │      src/App.jsx         │
                     │  (Single-file app)       │
                     │                          │
                     │  ┌─ Design System (W)    │
                     │  ┌─ Win95 Primitives     │
                     │  ┌─ Classification Engine │
                     │  ┌─ CSV Parsers          │
                     │  ┌─ 7 Tab Components     │
                     │  └─ App Shell            │
                     └───────────┬─────────────┘
                                 │
                     ┌───────────▼─────────────┐
                     │     localStorage         │
                     │  (all data persists      │
                     │   client-side only)      │
                     └─────────────────────────┘
```

The entire application lives in a single file: `src/App.jsx` (~890 lines). There are no external state managers, routers, or component libraries — just React hooks, inline styles, and the Win95 design system.

---

## Tech Stack

| Technology  | Purpose                           |
|-------------|-----------------------------------|
| React 18    | UI framework                      |
| Vite 5      | Build tool / dev server           |
| PapaParse   | CSV parsing (BofA, Schwab, Kraken)|
| Recharts    | Charts (bar, pie)                 |
| localStorage| Client-side data persistence      |
| Inline CSS  | All styling (Win95 design system) |

**No backend. No database. No API calls.** All data stays in the browser.

---

## File Structure

```
finance95/
├── index.html          # HTML shell, mounts #root
├── package.json        # Dependencies: react, papaparse, recharts
├── vite.config.js      # Vite config (react plugin only)
├── README.md           # Quick-start guide
├── DOCUMENTATION.md    # This file — full technical reference
├── .gitignore          # node_modules, dist, .env, etc.
└── src/
    ├── main.jsx        # ReactDOM.createRoot → <App />
    └── App.jsx         # Entire application (890 lines)
```

---

## Design System

The Win95 design system is defined as a constant object `W` with color tokens:

| Token       | Value     | Usage                    |
|-------------|-----------|--------------------------|
| `bg`        | `#008080` | Teal desktop background  |
| `surface`   | `#c0c0c0` | Window/button face       |
| `titleBar`  | `#000080` | Navy blue title bar      |
| `titleText` | `#ffffff` | Title bar text           |
| `text`      | `#000000` | Default text             |
| `disabled`  | `#808080` | Grayed-out text          |
| `btnHi`     | `#ffffff` | Button highlight (top/left border) |
| `btnShad`   | `#808080` | Button shadow            |
| `btnDk`     | `#000000` | Button dark (bottom/right border)  |
| `red`       | `#ff0000` | Negative amounts, alerts |
| `green`     | `#008000` | Positive amounts, success|
| `amber`     | `#808000` | Warnings, mid-range      |
| `navy`      | `#000080` | Highlighted values       |

### Border Helpers

Three reusable border style objects simulate Win95's 3D beveled look:

- **`raised`** — White top/left, black bottom/right (buttons, windows)
- **`sunken`** — Gray top/left, white bottom/right (input fields, content areas)
- **`field`** — Thin sunken border with white background (text inputs)

### Primitive Components

| Component        | Description                                           |
|------------------|-------------------------------------------------------|
| `Win95Window`    | Full window chrome with title bar, min/max/close buttons, status bar |
| `Btn95`          | Button with pressed/active states and 3D borders      |
| `Input95`        | Text/number input with sunken field styling           |
| `Select95`       | Dropdown select with field styling                    |
| `Check95`        | Checkbox with "x" marker in a sunken field box        |
| `GroupBox`       | Fieldset with groove border and legend label          |
| `ProgressBar95`  | Block-style progress bar (fills in 5% increments)     |

### Utility

- **`fmt(value, compact)`** — Currency formatter. `fmt(1234.50)` → `$1,234.50`. `fmt(1234.50, true)` → `$1.2k`.

---

## Data Model

### Transaction Object

Every imported transaction follows this shape:

```js
{
  id: string,           // Unique ID: "b{timestamp}-{index}" (boa), "s..." (schwab), "k..." (kraken)
  date: string,         // ISO date: "YYYY-MM-DD"
  description: string,  // Raw transaction description
  amount: number,       // Positive = income/credit, negative = expense/debit
  category: string,     // One of CATEGORIES (19 options)
  confidence: number,   // 0.0 – 1.0, how sure the classifier is
  isTransfer: boolean,  // True = inter-account transfer (excluded from real numbers)
  source: string,       // "boa" | "schwab" | "kraken"
  account: string,      // User-provided or auto-detected account name
  type: string,         // "income" | "expense" | "transfer" | "buy" | "sell" | "dividend" | etc.
  reviewed: boolean,    // User has seen/approved this transaction
  status: string,       // "approved" | "pending" | "flagged"
  // Schwab/Kraken specific:
  symbol?: string,      // Ticker symbol (e.g., "AAPL", "BTC")
  quantity?: number,    // Number of shares/units
  fees?: number,        // Transaction fees
  balance?: number,     // Running balance (BofA, Kraken)
}
```

### Categories (19 total)

```
Housing, Utilities, Groceries, Dining, Transportation, Auto,
Shopping, Entertainment, Health, Subscriptions, Insurance, Education,
Personal Care, Fees & Charges, Investments, Crypto, Income, Transfer, Uncategorized
```

### Net Worth Entry

```js
{
  id: string,         // "n{timestamp}"
  name: string,       // "BofA Checking", "Student Loan", etc.
  type: string,       // "asset" | "liability"
  category: string,   // Asset: Cash, Checking, Savings, Investments, Brokerage, Crypto, Real Estate, Vehicle, Other
                      // Liability: Credit Card, Student Loan, Mortgage, Auto Loan, Personal Loan, Medical Debt, Other
  value: number,      // Current dollar value
  date: string,       // Date added (YYYY-MM-DD)
}
```

### Protected Fund

```js
{
  id: string,         // "p{timestamp}"
  name: string,       // Fund name
  type: string,       // "emergency" | "sinking" | "goal" | "investment"
  target: number,     // Goal amount
  current: number,    // Current amount saved
  deadline?: string,  // Optional target date
}
```

### Budget

A simple object mapping category names to monthly budget amounts:

```js
{ "Groceries": 400, "Dining": 150, "Shopping": 200, ... }
```

---

## Classification Engine

The `classify(description, amount)` function categorizes transactions using keyword matching with a priority-ordered pipeline:

### Pipeline Order

1. **Transfer keywords** — Checked first. If description contains any of `["transfer", "xfer", "trnsfr", "zelle", "venmo", "paypal", "wire", ...]` → `Transfer` (confidence: 0.85)

2. **Income keywords** — `["payroll", "direct dep", "salary", "wage", "employer", "ach credit", "tax refund", ...]` → `Income` (confidence: 0.90)

3. **Category keywords** — 13 expense categories, each with a keyword list. First match wins. (confidence: 0.80)

4. **Heuristic: Round deposits** — Positive amount, >= $100, exact round number → `Transfer` (confidence: 0.50, flagged for review)

5. **Heuristic: Other positive** — Any remaining positive amount → `Income` (confidence: 0.30, flagged for review)

6. **Fallback** — `Uncategorized` (confidence: 0.10)

### Confidence Threshold

- Transactions with confidence >= 0.80 are auto-approved
- Below 0.80 → status: `"pending"` (shown in Review tab)
- The round-deposit heuristic (0.50) and unknown-positive heuristic (0.30) intentionally flag for manual review

---

## CSV Parsers

Three platform-specific parsers, each using PapaParse for the raw CSV → JSON step:

### Bank of America (`parseBofA`)

- Detects by headers: `"running bal"`, or `date + description + amount` without `action`/`symbol`
- Extracts: date, description, amount (single column or debit/credit split), running balance
- Applies classification engine to every row

### Charles Schwab (`parseSchwab`)

- Detects by headers: `"action"`, `"symbol"`, `"fees"`
- Extracts: date, action, description, amount (or price × quantity), symbol, quantity, fees
- Maps action types: buy, sell, dividend, interest, transfer/journal
- Dividends and interest → `Income` category
- All Schwab transactions auto-approved (confidence: 0.85)

### Kraken (`parseKraken`)

- Detects by headers: `"txid"`, `"refid"`, `"asset"`
- Extracts: date (from `time` column), type, asset, amount, fee, balance
- Translates Kraken's internal asset codes (XXBT → BTC, XETH → ETH, ZUSD → USD, etc.)
- Staking rewards → `Income`
- Deposits/withdrawals → `Transfer`
- All Kraken transactions auto-approved (confidence: 0.85)

### Auto-Detection

When source is set to "Auto-Detect", the app examines CSV headers to determine which parser to use:
1. Headers contain `"running bal"` → BofA
2. Headers contain `"action"` or `"symbol"` or `"fees"` → Schwab
3. Headers contain `"txid"` or `"refid"` or `"asset"` → Kraken
4. Default fallback → BofA

---

## Transfer Detection

Beyond keyword-based detection, the app has a **pair detection** system (`detectPairs`):

1. Sort all transactions by date
2. For each transaction, look for another transaction within 5 days
3. If two transactions have amounts that sum to ~$0 (within $0.01) AND are from different accounts → mark as transfer pair
4. Paired transactions get flagged with `status: "flagged"` for user confirmation

This catches transfers that don't have obvious keywords, like moving money between BofA Checking and Schwab Brokerage.

---

## Application Tabs

### Import Tab

- **Drag-and-drop** CSV upload zone (or click to browse)
- Source selector: Auto-Detect, Bank of America, Charles Schwab, Kraken
- Custom account name input
- **Deduplication**: Re-importing the same file skips already-present transactions (matched by date + description + amount)
- Import log showing file name, source, account, imported count, flagged count
- Inline "How to Export CSVs" guide for each platform

### Review Tab

- Filterable transaction table: Pending, Transfers, Approved, All
- Source filter (BofA, Schwab, Kraken)
- Text search on descriptions
- Per-transaction controls:
  - Category dropdown (19 options)
  - Transfer checkbox
  - Approve button
- **Bulk approve** for all visible transactions
- Flagged rows highlighted in yellow, transfers in light blue
- Capped at 100 visible rows for performance

### Dashboard Tab

- **Summary cards**: Total Income, Total Expenses, Net Savings, Savings Rate
- Only uses approved, non-transfer transactions for calculations
- **Income vs Expenses** bar chart (monthly)
- **Spending by Category** pie chart (top 8 categories)
- **Top Spending** list (top 10 merchants by total spend)
- **Monthly Savings Rate** bar chart (color-coded: green >=20%, amber >=0%, red <0%)

### Budget Tab

- Per-category budget setting (click "[Set]" to enter amount, uses historical average as default)
- Current month spending vs budget for each category
- Color-coded progress bars: navy (<80%), amber (80-100%), red (>100%)
- Summary cards: Total Budget, Spent This Month, Remaining/Over Budget
- Shows historical average spend per category for reference

### Net Worth Tab

- Add assets and liabilities with categories
- **Asset categories**: Cash, Checking, Savings, Investments, Brokerage, Crypto, Real Estate, Vehicle, Other
- **Liability categories**: Credit Card, Student Loan, Mortgage, Auto Loan, Personal Loan, Medical Debt, Other
- Editable values inline
- Summary: Total Assets, Total Liabilities, Net Worth
- Side-by-side asset/liability panels

### Protected Money Tab

- Create savings funds with types: Emergency, Sinking Fund, Savings Goal, Investment Target
- Each fund has: name, target amount, current amount, optional deadline
- **Emergency Fund Health**: Visual 1-6 month indicator based on average monthly expenses
  - Calculates average monthly spending from approved transactions
  - Shows how many months of expenses are covered
  - Target: 6 months of expenses
- Quick "+Add" button on each fund card to add money
- Progress bar showing completion percentage

### Optimize Tab

- **Recurring charge detection**: Groups similar transactions, identifies charges that appear multiple times with consistent amounts (low variance)
- Shows count, monthly average, and annual cost per recurring charge
- **Category savings analysis**: Compares average vs median spending per category
  - "Savings potential" = average - median (if you reduced to your median month, you'd save this much)
- Summary: number of recurring charges, total annual recurring cost, monthly savings potential

---

## Storage

All data persists in the browser via `localStorage` under the key `"finance95"`.

### Stored Object Shape

```js
{
  txns: Transaction[],    // All imported transactions
  nw: NetWorthEntry[],    // Net worth assets & liabilities
  pf: ProtectedFund[],    // Protected money / savings funds
  bud: { [category]: number }  // Monthly budget amounts
}
```

### Save Behavior

- **Debounced** — saves 600ms after the last state change
- **Auto-save** — triggers on any change to transactions, net worth, protected funds, or budgets
- **Data never leaves the browser** — no external API calls, no telemetry

### Reset

Click `File` in the menu bar → confirms via `window.confirm()` → clears all data.

---

## Deployment

### Vercel (Recommended)

The app is configured for zero-config Vercel deployment:

```bash
npm run build    # Vite builds to dist/
```

Vercel auto-detects Vite and handles the rest. Just connect the GitHub repo.

### Local Development

```bash
npm install      # Install dependencies
npm run dev      # Start Vite dev server (http://localhost:5173)
```

### Production Preview

```bash
npm run build
npm run preview  # Preview production build locally
```

---

## Development

### Adding a New CSV Source

1. Add a new parser function (e.g., `parseChase`) following the pattern of `parseBofA`/`parseSchwab`/`parseKraken`
2. Use `findCol()` for flexible column matching, `parseAmt()` for amount parsing, `parseDt()` for date parsing
3. Add header detection logic in the `handle` function inside `ImportTab`
4. Add the source to the `src` dropdown options and the `srcF` filter in `ReviewTab`

### Adding a New Category

1. Add the category name to the `CATEGORIES` array
2. Add keyword entries to `CAT_KW` (optional — new categories can also be assigned manually in Review)

### Adding a New Tab

1. Add entry to the `TABS` array: `{ id: "mytab", label: "My Tab" }`
2. Create the tab component function
3. Add the render conditional in the App shell content area

---

*Last updated: February 2026*
