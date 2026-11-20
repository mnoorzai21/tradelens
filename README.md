# TradeLens: Full-Stack Trading Journal

[![CI](https://github.com/mnoorzai21/tradelens/actions/workflows/ci.yml/badge.svg)](https://github.com/mnoorzai21/tradelens/actions/workflows/ci.yml)

A full-stack trading journal for day traders built with **Next.js, TypeScript, PostgreSQL and Prisma**. Traders log their trades and see what actually makes money: P/L, win rate, expectancy, R-multiples and max drawdown, all calculated with exact decimal math.

**[Live Demo](https://tradelens-mnoorzai.vercel.app)**

Click **Try the demo** on the sign-in page to explore a read-only account with 60 sample trades.

![TradeLens dashboard with filters, performance stats, an equity curve, P/L by day and results by setup](docs/tradelens-dashboard.png)

## Features

- **Secure accounts** with Better Auth: email and password sign-up, hashed passwords, and sessions stored in PostgreSQL.
- **Change password:** signed-in users can change their password from the Account page, and their other devices are signed out.
- **Protected dashboard:** the server checks the session before rendering, so signed-out visitors never receive the page.
- **Trade logging:** add, edit and delete trades, with server-side validation (Zod) and an error under each field. Stops are checked too: below the entry for a long, above it for a short.
- **Exact P/L:** all money math uses decimals instead of floating point, so `0.3 - 0.1` is exactly `0.2`, and fees can include fractions of a cent.
- **R-multiples:** each trade's result in units of planned risk, for longs and shorts. Trades without a stop show "—" instead of a misleading 0.
- **Performance stats:** total P/L, win rate, average win vs. average loss, expectancy, average R and max drawdown.
- **Charts:** an equity curve of the running P/L, and P/L by day with green and red bars.
- **Setups and mistakes:** label each trade with a setup and the mistakes made, then see stats by setup and what each mistake costs, with the symbols involved.
- **Filters:** by symbol, setup, mistake and date range. Filters live in the URL, so a filtered view can be bookmarked, and they update the stats, charts and tables together.
- **CSV import:** upload a file of trades, with every row validated by the same rules as the form. If any row has an error, nothing is imported, and each error shows its row number. Uploading the same file twice skips trades that already exist.
- **One-click demo:** a read-only demo account with 60 realistic trades. Changes are blocked on the server, not just hidden in the interface, including Better Auth's own account endpoints, so nobody can change the demo's password.
- **Data isolation:** every query is scoped to the signed-in user. Editing or deleting another user's trade is impossible (IDOR-safe), and their trade pages return 404.
- **Market time:** trades are stored in UTC and shown in Eastern Time. Dates for filters, daily P/L and CSV import are Eastern market dates, including on daylight saving days.
- **Works on phones:** the dashboard fits small screens, and wide tables scroll inside their own box.
- **Two-step delete** (Delete → Confirm) to prevent accidental deletes.

## Trading Metrics

| Metric | What it measures | How it's calculated |
| --- | --- | --- |
| P/L | Profit or loss of a trade | (exit − entry) × shares × direction − fees |
| Win rate | Share of trades that made money | wins ÷ total trades (break-even trades are neither) |
| Avg win / avg loss | Typical size of wins vs. losses | average P/L of winners, and of losers |
| Expectancy | Average dollars made per trade | total P/L ÷ total trades |
| R-multiple | Result in units of planned risk | P/L ÷ (\|entry − stop\| × shares) |
| Average R | Average result per unit of risk | average R of trades that have a stop |
| Max drawdown | Largest drop from a peak | biggest peak-to-trough fall of the running P/L, in time order |

Every metric is covered by unit tests, including longs, shorts, fees, break-even trades and empty trade lists.

## Tech Stack

- **Frontend:** Next.js 16 (App Router, Server Components), React 19, TypeScript, Tailwind CSS, Recharts
- **Backend:** Next.js Server Actions and Route Handlers, Papa Parse for CSV files
- **Database:** PostgreSQL on Neon, Prisma 7 with the `pg` driver adapter
- **Auth:** Better Auth (email and password)
- **Validation:** Zod
- **Testing & CI:** Vitest (92 unit tests), Playwright (7 end-to-end tests on desktop and mobile), ESLint, TypeScript, GitHub Actions on every pull request
- **Hosting:** Vercel (a preview deployment for every pull request, production on every merge to `main`)

## How It Works

```
Browser ──▶ Next.js on Vercel (iad1) ──▶ Prisma ──▶ PostgreSQL on Neon (us-east-1)
                 │
                 ├─ Server Components  →  check the session, read and filter the user's trades
                 ├─ Server Actions     →  validate with Zod, add / edit / delete / import trades
                 └─ /api/auth/*        →  Better Auth sign-up, sign-in, sign-out
```

All database access runs on the server, and every query includes the signed-in user's ID. The app server and the database run in the same region, so each query avoids a cross-country round trip.

## Getting Started

### Prerequisites

- Node.js 24
- A PostgreSQL database (for example a free [Neon](https://neon.com) project)

### Installation

```bash
git clone https://github.com/mnoorzai21/tradelens.git
cd tradelens
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full"
BETTER_AUTH_SECRET="a long random string"
BETTER_AUTH_URL="http://localhost:3000"
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Never commit your `.env` file.

### Run Locally

Create the database tables, then start the app:

```bash
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000/sign-up to create an account.

### Run Tests

## Run Tests

Unit tests:

```
npm test
```

They cover P/L for longs and shorts, fees, R-multiples (including trades without a stop), performance stats, max drawdown, the equity curve, daily P/L, filters, CSV parsing (including Eastern Time and daylight saving), duplicate detection and trade validation.

End-to-end tests (the first run downloads Chromium with `npx playwright install chromium`):

```
npm run test:e2e
```

They open a real browser on desktop and phone screens, sign in to the demo, use the filters, and check that the demo is read-only and the page fits small screens. CI runs lint, typecheck, unit tests and a production build on every pull request.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Checks the database connection |
| GET, POST | `/api/auth/*` | Better Auth routes (sign-up, sign-in, sign-out, session) |

Trades are created, updated and deleted through Next.js Server Actions rather than public REST endpoints.

## Deployment

**App:** https://tradelens-mnoorzai.vercel.app (deployed by Vercel on every merge to `main`)

**Environment variables on Vercel:** `DATABASE_URL` (Production and Preview), `BETTER_AUTH_SECRET` (Production and Preview, different from the local one) and `BETTER_AUTH_URL` (Production), plus `DEMO_EMAIL` and `DEMO_PASSWORD` (Production and Preview) for the demo account. Functions are pinned to `iad1` in `vercel.json`, next to the database.

## What I Learned

- **CI catches what my laptop hides.** My first CI run failed with `Cannot find name 'LayoutProps'`: the type existed in my local `.next` folder but not on a clean machine. I added `next typegen` before the typecheck, and later ran `prisma generate` on install for the same reason.
- **Environment variables belong to each environment.** Sign-in worked locally but failed on the preview deployment. The logs showed a "default secret" error and then a connection to `127.0.0.1`, which told me the secret and the database URL were only set for Production. Since then, I check the preview deployment before every merge.
- **Money needs exact math.** In JavaScript, `0.3 − 0.1` is `0.19999999999999998`, so prices are stored as `Decimal` in PostgreSQL and all P/L math uses `Prisma.Decimal`. A unit test makes sure it stays that way.
- **Measure instead of guessing.** On phones, the dashboard scrolled sideways, and fixing the obvious causes didn't help. I measured the page width in Chrome DevTools, then hid each section one at a time until the page fit. The last cause was a screen-reader-only label: it used `position: absolute` and escaped the table's scroll box, because absolute elements are only clipped by a box that is `relative`.

## Future Improvements

- Forgot password and email verification, with email sending through Resend
- Import broker exports, which list individual fills instead of whole trades
- Undo an import
- Run the end-to-end tests in CI, with a separate Neon database branch
- P/L by week and by month
- Custom mistake tags and a page to manage setups
- Quick date presets like "This week" and "This month"

## Disclaimer

This project is for educational and informational purposes only. It is not financial advice or a recommendation to buy or sell securities. Trading stocks involves substantial financial risk.

## Author

**Mohammad Nabi Noorzai**

- GitHub: [@mnoorzai21](https://github.com/mnoorzai21)
- LinkedIn: [Mohammad Nabi Noorzai](https://linkedin.com/in/mnoorzai21)
- Portfolio: [mnoorzai.vercel.app](https://mnoorzai.vercel.app)