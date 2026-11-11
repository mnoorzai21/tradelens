import { Prisma } from "@/generated/prisma/client";
import { calculatePnl } from "./pnl";

type TradeForStats = Parameters<typeof calculatePnl>[0];

export type PerformanceStats = {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: Prisma.Decimal;
  averageWin: Prisma.Decimal;
  averageLoss: Prisma.Decimal;
  expectancy: Prisma.Decimal;
};

const ZERO = new Prisma.Decimal(0);

function sum(values: Prisma.Decimal[]): Prisma.Decimal {
  return values.reduce((total, value) => total.plus(value), ZERO);
}

function average(values: Prisma.Decimal[]): Prisma.Decimal {
  return values.length === 0 ? ZERO : sum(values).dividedBy(values.length);
}

export function calculateStats(trades: TradeForStats[]): PerformanceStats {
  const pnls = trades.map(calculatePnl);
  const winners = pnls.filter((pnl) => pnl.greaterThan(0));
  const losers = pnls.filter((pnl) => pnl.lessThan(0));

  return {
    totalTrades: trades.length,
    wins: winners.length,
    losses: losers.length,
    winRate: trades.length === 0 ? 0 : winners.length / trades.length,
    totalPnl: sum(pnls),
    averageWin: average(winners),
    averageLoss: average(losers),
    expectancy: average(pnls),
  };
}