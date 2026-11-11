# TradeLens: Full-Stack Trading Journal

[![CI](https://github.com/mnoorzai21/tradelens/actions/workflows/ci.yml/badge.svg)](https://github.com/mnoorzai21/tradelens/actions/workflows/ci.yml)

A full-stack trading journal for day traders built with **Next.js, TypeScript, PostgreSQL and Prisma**. Traders log their trades and see what actually makes money: P/L, win rate, expectancy, R-multiples and max drawdown, all calculated with exact decimal math.

**[Live Demo](https://tradelens-mnoorzai.vercel.app)**

## Features

- **Secure accounts** with Better Auth: email and password sign-up, hashed passwords, and sessions stored in PostgreSQL.
- **Protected dashboard:** the server checks the session before rendering, so signed-out visitors never receive the page.
- **Trade logging:** add, edit and delete trades, with server-side validation (Zod) and an error under each field.
- **Exact P/L:** all money math uses decimals instead of floating point, so `0.3 − 0.1` is exactly `0.2`, and fees can include fractions of a cent.
- **R-multiples:** each trade's result in units of planned risk, for longs and shorts. Trades without a stop show "—" instead of a misleading 0.
- **Performance stats:** total P/L, win rate, average win vs. average loss, expectancy, average R and max drawdown.
- **Data isolation:** every query is scoped to the signed-in user. Editing or deleting another user's trade is impossible (IDOR-safe), and their trade pages return 404.
- **Market time:** trades are stored in UTC and shown in Eastern Time, while the forms use the trader's local time.
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

- **Frontend:** Next.js 16 (App Router, Server Components), React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions and Route Handlers
- **Database:** PostgreSQL on Neon, Prisma 7 with the `pg` driver adapter
- **Auth:** Better Auth (email and password)
- **Validation:** Zod
- **Testing & CI:** Vitest (22 unit tests), ESLint, TypeScript, GitHub Actions on every pull request
- **Hosting:** Vercel (a preview deployment for every pull request, production on every merge to `main`)

## How It Works

```
Browser ──▶ Next.js on Vercel (iad1) ──▶ Prisma ──▶ PostgreSQL on Neon (us-east-1)
                │
                ├─ Server Components  →  check the session, read the user's trades
                ├─ Server Actions     →  validate with Zod, add / edit / delete trades
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

```bash
npm test
```

The tests cover P/L for longs and shorts, fees, R-multiples (including trades without a stop), performance stats, and max drawdown with out-of-order trades. CI runs them, plus lint, typecheck and a production build, on every pull request.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Checks the database connection |
| GET, POST | `/api/auth/*` | Better Auth routes (sign-up, sign-in, sign-out, session) |

Trades are created, updated and deleted through Next.js Server Actions rather than public REST endpoints.

## Deployment

**App:** https://tradelens-mnoorzai.vercel.app (deployed by Vercel on every merge to `main`)

**Environment variables on Vercel:** `DATABASE_URL` (Production and Preview), `BETTER_AUTH_SECRET` (Production and Preview, different from the local one) and `BETTER_AUTH_URL` (Production). Functions are pinned to `iad1` in `vercel.json`, next to the database.

## What I Learned

- **CI catches what my laptop hides.** My first CI run failed with `Cannot find name 'LayoutProps'`: the type existed in my local `.next` folder but not on a clean machine. I added `next typegen` before the typecheck, and later ran `prisma generate` on install for the same reason.
- **Environment variables belong to each environment.** Sign-in worked locally but failed on the preview deployment. The logs showed a "default secret" error and then a connection to `127.0.0.1`, which told me the secret and the database URL were only set for Production. Since then, I check the preview deployment before every merge.
- **Money needs exact math.** In JavaScript, `0.3 − 0.1` is `0.19999999999999998`, so prices are stored as `Decimal` in PostgreSQL and all P/L math uses `Prisma.Decimal`. A unit test makes sure it stays that way.

## Future Improvements

- Setups and mistake tags, with stats by setup and tag
- Filters by date, symbol, setup and tag
- Charts: equity curve and P/L by day or week
- Broker CSV import
- Demo account with sample trades
- End-to-end tests with Playwright

## Disclaimer

This project is for educational and informational purposes only. It is not financial advice or a recommendation to buy or sell securities. Trading stocks involves substantial financial risk.

## Author

**Mohammad Nabi Noorzai**

- GitHub: [@mnoorzai21](https://github.com/mnoorzai21)
- LinkedIn: [Mohammad Nabi Noorzai](https://linkedin.com/in/mnoorzai21)
- Portfolio: [mnoorzai.vercel.app](https://mnoorzai.vercel.app)