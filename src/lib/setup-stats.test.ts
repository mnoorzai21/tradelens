import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { calculateStatsBySetup } from "./setup-stats";

const d = (value: string) => new Prisma.Decimal(value);

// Entry $10, 100 shares → P/L = (exit − 10) × 100
function makeTrade(exitPrice: string, setup: string | null, symbol = "TEST") {
  return {
    symbol,
    side: "LONG" as const,
    entryPrice: d("10"),
    exitPrice: d(exitPrice),
    stopPrice: null,
    shares: 100,
    fees: d("0"),
    setup: setup ? { name: setup } : null,
  };
}

describe("calculateStatsBySetup", () => {
  it("returns an empty list when there are no trades", () => {
    expect(calculateStatsBySetup([])).toEqual([]);
  });

  it("groups trades by setup and calculates stats for each", () => {
    const result = calculateStatsBySetup([
      makeTrade("12", "VWAP reclaim"), // +200
      makeTrade("9", "Gap and go"), // -100
      makeTrade("11", "VWAP reclaim"), // +100
      makeTrade("13", null), // +300, no setup
    ]);

    expect(result).toHaveLength(3);

    expect(result[0].setup).toBe("VWAP reclaim");
    expect(result[0].stats.totalTrades).toBe(2);
    expect(result[0].stats.winRate).toBe(1);
    expect(result[0].stats.totalPnl.toString()).toBe("300");

    expect(result[1].setup).toBe("Gap and go");
    expect(result[1].stats.totalPnl.toString()).toBe("-100");
  });

  it("always lists trades without a setup last", () => {
    const result = calculateStatsBySetup([
      makeTrade("13", null), // +300, the most profitable
      makeTrade("9", "Gap and go"), // -100
    ]);

    expect(result.map((group) => group.setup)).toEqual(["Gap and go", null]);
  });

    it("lists each setup's symbols once, in alphabetical order", () => {
    const result = calculateStatsBySetup([
      makeTrade("12", "VWAP reclaim", "TSLA"),
      makeTrade("11", "VWAP reclaim", "AAPL"),
      makeTrade("13", "VWAP reclaim", "TSLA"),
    ]);

    expect(result[0].symbols).toEqual(["AAPL", "TSLA"]);
    });
  
});