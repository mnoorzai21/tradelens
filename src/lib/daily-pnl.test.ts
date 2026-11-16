import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { calculateDailyPnl } from "./daily-pnl";

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

describe("calculateDailyPnl", () => {
  it("returns an empty list when there are no trades", () => {
    expect(calculateDailyPnl([])).toEqual([]);
  });

  it("adds up the P/L and counts trades for each day", () => {
    const trades = [
      makeTrade("11", "2026-11-02T15:00:00Z"), // +100
      makeTrade("9.5", "2026-11-02T18:00:00Z"), // -50
      makeTrade("12", "2026-11-03T15:00:00Z"), // +200
    ];
    expect(calculateDailyPnl(trades)).toEqual([
      { date: "2026-11-02", pnl: 50, trades: 2 },
      { date: "2026-11-03", pnl: 200, trades: 1 },
    ]);
  });

  it("sorts days from oldest to newest", () => {
    const trades = [
      makeTrade("12", "2026-11-10T15:00:00Z"),
      makeTrade("11", "2026-11-09T15:00:00Z"),
    ];
    const dates = calculateDailyPnl(trades).map((day) => day.date);
    expect(dates).toEqual(["2026-11-09", "2026-11-10"]);
  });

  it("groups trades by the Eastern Time date, not the UTC date", () => {
    // 02:00 UTC on Nov 3 is 9:00 PM Eastern on Nov 2
    const trades = [makeTrade("11", "2026-11-03T02:00:00Z")];
    expect(calculateDailyPnl(trades)[0].date).toBe("2026-11-02");
  });

  it("keeps each day's total exact with small decimals", () => {
    // Each trade makes $0.10. With floating point, 0.1 + 0.1 + 0.1 = 0.30000000000000004
    const trades = [
      makeTrade("10.001", "2026-11-02T15:00:00Z"),
      makeTrade("10.001", "2026-11-02T16:00:00Z"),
      makeTrade("10.001", "2026-11-02T17:00:00Z"),
    ];
    expect(calculateDailyPnl(trades)[0].pnl).toBe(0.3);
  });
});