import { Prisma } from "@/generated/prisma/client";

type TradeForPnl = {
  side: "LONG" | "SHORT";
  entryPrice: Prisma.Decimal;
  exitPrice: Prisma.Decimal;
  shares: number;
  fees: Prisma.Decimal;
};

export function calculatePnl(trade: TradeForPnl): Prisma.Decimal {
  const direction = trade.side === "LONG" ? 1 : -1;
  return trade.exitPrice
    .minus(trade.entryPrice)
    .times(trade.shares)
    .times(direction)
    .minus(trade.fees);
}