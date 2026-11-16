import { Prisma } from "@/generated/prisma/client";
import { calculatePnl } from "./pnl";

type TradeForEquityCurve = Parameters<typeof calculatePnl>[0] & {
  exitAt: Date;
};

export type EquityPoint = {
  tradeNumber: number;
  exitAt: string;
  pnl: number;
  equity: number;
};

export function calculateEquityCurve(
  trades: TradeForEquityCurve[]
): EquityPoint[] {
  const chronological = [...trades].sort(
    (a, b) => a.exitAt.getTime() - b.exitAt.getTime()
  );

  let equity = new Prisma.Decimal(0);

  return chronological.map((trade, index) => {
    const pnl = calculatePnl(trade);
    equity = equity.plus(pnl);
    return {
      tradeNumber: index + 1,
      exitAt: trade.exitAt.toISOString(),
      pnl: pnl.toNumber(),
      equity: equity.toNumber(),
    };
  });
}