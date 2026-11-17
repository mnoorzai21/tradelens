import { Prisma } from "@/generated/prisma/client";
import { calculatePnl } from "./pnl";

type TradeForDailyPnl = Parameters<typeof calculatePnl>[0] & {
  exitAt: Date;
};

export type DailyPnl = {
  date: string;
  pnl: number;
  trades: number;
};

// "en-CA" formats dates as YYYY-MM-DD, which also sorts correctly as text
const marketDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function calculateDailyPnl(trades: TradeForDailyPnl[]): DailyPnl[] {
  const days = new Map<string, { pnl: Prisma.Decimal; trades: number }>();

  for (const trade of trades) {
    const date = marketDate.format(trade.exitAt);
    const day = days.get(date) ?? { pnl: new Prisma.Decimal(0), trades: 0 };
    day.pnl = day.pnl.plus(calculatePnl(trade));
    day.trades += 1;
    days.set(date, day);
  }

  return [...days.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, day]) => ({
      date,
      pnl: day.pnl.toNumber(),
      trades: day.trades,
    }));
}