import { createHash } from "node:crypto";
import type { TradeInput } from "./validations/trade";

type TradeForHash = Pick<
  TradeInput,
  "symbol" | "side" | "entryPrice" | "exitPrice" | "shares" | "entryAt" | "exitAt"
>;

// A fingerprint of the fields that identify a trade. Two rows with the
// same symbol, side, prices, shares and times are the same trade.
// Notes, setup and mistakes aren't included, so editing them later
// doesn't make a re-imported row look like a new trade.
export function tradeDedupeHash(trade: TradeForHash): string {
  const key = [
    trade.symbol,
    trade.side,
    trade.entryPrice.toFixed(4),
    trade.exitPrice.toFixed(4),
    trade.shares,
    trade.entryAt.toISOString(),
    trade.exitAt.toISOString(),
  ].join("|");

  return createHash("sha256").update(key).digest("hex");
}