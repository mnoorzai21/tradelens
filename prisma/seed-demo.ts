import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { MISTAKE_TAGS } from "../src/lib/mistake-tags";

const DEMO_EMAIL = process.env.DEMO_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;
if (!DEMO_EMAIL || !DEMO_PASSWORD) {
  throw new Error("DEMO_EMAIL and DEMO_PASSWORD must be set in .env");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// A seeded random generator: the same "random" trades on every run
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const random = createRandom(42);
const between = (min: number, max: number) => min + random() * (max - min);
const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
const round = (value: number, decimals: number) => Number(value.toFixed(decimals));

const SYMBOLS = ["AAPL", "TSLA", "NVDA", "AMD", "PLTR", "SOFI", "MARA", "RIVN", "HOOD", "NIO"];

const SETUPS = [
  { name: "VWAP reclaim", winRate: 0.62, maxR: 3 },
  { name: "Gap and go", winRate: 0.48, maxR: 4 },
  { name: "Bull flag", winRate: 0.55, maxR: 2.5 },
  { name: "First pullback", winRate: 0.58, maxR: 2.2 },
  { name: "Breakout", winRate: 0.4, maxR: 4 },
];

const TRADE_COUNT = 60;
const RISK_PER_TRADE = 100; // dollars risked on a normal trade

async function main() {
  // Start fresh: deleting the user also deletes its trades, setups, tags and sessions
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: { name: "Demo Trader", email: DEMO_EMAIL!, emailVerified: true, isDemo: true },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: await hashPassword(DEMO_PASSWORD!),
    },
  });

  const setupIds = new Map<string, string>();
  for (const setup of SETUPS) {
    const created = await prisma.setup.create({ data: { userId: user.id, name: setup.name } });
    setupIds.set(setup.name, created.id);
  }

  for (let i = 0; i < TRADE_COUNT; i++) {
    // Spread trades over roughly the last 90 days, at times during the trading session
    const daysAgo = Math.floor(((TRADE_COUNT - i) / TRADE_COUNT) * 90);
    const entryAt = new Date();
    entryAt.setUTCDate(entryAt.getUTCDate() - daysAgo);
    entryAt.setUTCHours(14, 35 + Math.floor(between(0, 90)), 0, 0);
    const exitAt = new Date(entryAt.getTime() + Math.floor(between(3, 60)) * 60_000);

    const setup = pick(SETUPS);
    const side = random() < 0.8 ? "LONG" : "SHORT";
    const entryPrice = round(between(5, 300), 2);
    const riskPerShare = entryPrice * between(0.01, 0.03);

    // About 30% of trades get one or two mistakes
    const tags = new Set<string>();
    if (random() < 0.3) {
      tags.add(pick(MISTAKE_TAGS));
      if (random() < 0.3) tags.add(pick(MISTAKE_TAGS));
    }

    const oversized = tags.has("Oversized");
    const noStop = tags.has("No stop");
    const shares = Math.max(1, Math.round((RISK_PER_TRADE / riskPerShare) * (oversized ? 2.5 : 1)));

    // Mistakes make a win less likely, and losses without a stop are bigger
    const winChance = tags.size > 0 ? setup.winRate * 0.6 : setup.winRate;
    const won = random() < winChance;
    const rMultiple = won ? between(0.5, setup.maxR) : -between(0.4, noStop ? 2.5 : 1.1);

    const direction = side === "LONG" ? 1 : -1;
    const exitPrice = Math.max(0.01, round(entryPrice + direction * rMultiple * riskPerShare, 2));
    const stopPrice = noStop ? null : round(entryPrice - direction * riskPerShare, 2);
    const fees = round(Math.max(1, shares * 0.005), 4);

    await prisma.trade.create({
      data: {
        userId: user.id,
        symbol: pick(SYMBOLS),
        side,
        entryPrice,
        exitPrice,
        stopPrice,
        shares,
        fees,
        entryAt,
        exitAt,
        setupId: random() < 0.85 ? setupIds.get(setup.name) : null,
        tags: {
          connectOrCreate: [...tags].map((name) => ({
            where: { userId_name: { userId: user.id, name } },
            create: { userId: user.id, name },
          })),
        },
      },
    });
  }

  console.log(`Seeded ${TRADE_COUNT} demo trades for ${DEMO_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());