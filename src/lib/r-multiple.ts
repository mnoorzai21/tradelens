import { Prisma } from "@/generated/prisma/client";
import { calculatePnl } from "./pnl";

type TradeForR = Parameters<typeof calculatePnl>[0] & {
  stopPrice: Prisma.Decimal | null;
};

export function calculateRMultiple(trade: TradeForR): Prisma.Decimal | null {
  if (!trade.stopPrice) return null;

  const riskPerShare = trade.entryPrice.minus(trade.stopPrice).abs();
  if (riskPerShare.isZero()) return null;

  const initialRisk = riskPerShare.times(trade.shares);
  return calculatePnl(trade).dividedBy(initialRisk);
}
