import { Prisma } from "@/generated/prisma/client";
import { calculatePnl } from "./pnl";

type TradeForDrawdown = Parameters<typeof calculatePnl>[0] & {
  exitAt: Date;
};

export function calculateMaxDrawdown(trades: TradeForDrawdown[]): Prisma.Decimal {
  const chronological = [...trades].sort(
    (a, b) => a.exitAt.getTime() - b.exitAt.getTime()
  );

  let equity = new Prisma.Decimal(0);
  let peak = new Prisma.Decimal(0);
  let maxDrawdown = new Prisma.Decimal(0);

  for (const trade of chronological) {
    equity = equity.plus(calculatePnl(trade));
    if (equity.greaterThan(peak)) {
      peak = equity;
    }
    const drawdown = peak.minus(equity);
    if (drawdown.greaterThan(maxDrawdown)) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}