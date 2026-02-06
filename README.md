# finance95.exe — Personal Finance Hub

A Windows 95-styled personal finance app built in React. Solves the core problem of Bank of America inflating income by counting inter-account transfers as income.

## Deploy

```
npm install
npm run dev        # local dev
npm run build      # production build (Vercel runs this automatically)
```

## How to Get Your CSV Files

### Bank of America

1. Log in at **bankofamerica.com**
2. Click on your **checking or savings account**
3. Near the top-right of the transaction list, click **"Download"** (small link, easy to miss)
4. Set your **date range** — select the widest range you want to analyze
5. Under "File type", select **"Microsoft Excel (.csv)"**
6. Click **Download**
7. The file will be named something like `stmt.csv`

**Tip:** BofA limits exports to ~90 days at a time. For a full year, you'll need to download multiple files — the app deduplicates automatically on re-import.

### Charles Schwab

1. Log in at **schwab.com**
2. Go to **Accounts > History**
3. Select the **account** you want (brokerage, etc.)
4. Set your **date range**
5. Click the **"Export"** link (top-right corner of the transaction table)
6. Choose **CSV** format
7. Click **Export**
8. The file will be named something like `XXXX1234_Transactions_YYYYMMDD.csv`

**Tip:** Schwab exports include buys, sells, dividends, and transfers. The app categorizes each type automatically.

### Kraken (Crypto)

1. Log in at **kraken.com**
2. Click your **profile icon** (top-right) > **Documents** (or go to History > Export)
3. Click **"Create Export"**
4. Export type: select **"Ledgers"**
5. Set your **date range**
6. Format: **CSV**
7. Click **"Submit"** / **"Generate"**
8. Wait for it to process (can take a minute), then **download** the file
9. The file will be named something like `ledgers.csv`

**Tip:** Kraken exports include trades, staking rewards, deposits, and withdrawals. Staking rewards are auto-categorized as income.

## Importing Into finance95

1. Open the app and go to the **Import** tab
2. Drag and drop your CSV files onto the drop zone (or click to browse)
3. The app **auto-detects** which platform each CSV came from
4. Go to the **Review** tab to approve flagged transactions
5. View your real numbers on the **Dashboard**

You can import multiple files at once. The app deduplicates — re-importing the same file won't create duplicates.

## What Gets Flagged for Review

- Transactions the app isn't sure about (confidence below 80%)
- Potential transfers between your own accounts (keyword detection + amount matching)
- Round-number deposits >= $100
- Large deposits >= $500 without payroll keywords

## Tech Stack

- React 18 + Vite
- PapaParse (CSV parsing)
- Recharts (charts)
- localStorage (data stays in your browser, never sent anywhere)
- Pure inline CSS — Windows 95 design system
