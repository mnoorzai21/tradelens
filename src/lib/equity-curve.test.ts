import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { calculateEquityCurve } from "./equity-curve";

const d = (value: string) => new Prisma.Decimal(value);

// Entry $10, 100 shares → P/L = (exit − 10) × 100
function makeTrade(exitPrice: string, exitAt: string) {
  return {
    side: "LONG" as const,
    entryPrice: d("10"),
    exitPrice: d(exitPrice),
    shares: 100,
    fees: d("0"),
    exitAt: new Date(exitAt),
  };
}

describe("calculateEquityCurve", () => {
  it("returns an empty curve when there are no trades", () => {
    expect(calculateEquityCurve([])).toEqual([]);
  });

  it("adds a point with the running total after each trade", () => {
    // P/L: +100, -50, +200 → equity: 100, 50, 250
    const trades = [
      makeTrade("11", "2026-11-02T15:00:00Z"),
      makeTrade("9.5", "2026-11-03T15:00:00Z"),
      makeTrade("12", "2026-11-04T15:00:00Z"),
    ];
    expect(calculateEquityCurve(trades)).toEqual([
      { tradeNumber: 1, exitAt: "2026-11-02T15:00:00.000Z", pnl: 100, equity: 100 },
      { tradeNumber: 2, exitAt: "2026-11-03T15:00:00.000Z", pnl: -50, equity: 50 },
      { tradeNumber: 3, exitAt: "2026-11-04T15:00:00.000Z", pnl: 200, equity: 250 },
    ]);
  });

  it("sorts trades by exit time before calculating", () => {
    const trades = [
      makeTrade("12", "2026-11-04T15:00:00Z"),
      makeTrade("11", "2026-11-02T15:00:00Z"),
      makeTrade("9.5", "2026-11-03T15:00:00Z"),
    ];
    const equity = calculateEquityCurve(trades).map((point) => point.equity);
    expect(equity).toEqual([100, 50, 250]);
  });

  it("keeps the running total exact with small decimals", () => {
    // Each trade makes $0.10. With floating point, 0.1 + 0.1 + 0.1 = 0.30000000000000004
    const trades = [
      makeTrade("10.001", "2026-11-02T15:00:00Z"),
      makeTrade("10.001", "2026-11-03T15:00:00Z"),
      makeTrade("10.001", "2026-11-04T15:00:00Z"),
    ];
    const curve = calculateEquityCurve(trades);
    expect(curve.at(-1)?.equity).toBe(0.3);
  });
});