import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { calculateStats } from "./stats";

const d = (value: string) => new Prisma.Decimal(value);

function makeTrade(exitPrice: string, stopPrice: string | null = null) {
  return {
    side: "LONG" as const,
    entryPrice: d("10"),
    exitPrice: d(exitPrice),
    stopPrice: stopPrice ? d(stopPrice) : null,
    shares: 100,
    fees: d("0"),
  };
}

describe("calculateStats", () => {
  it("returns zeros when there are no trades", () => {
    const stats = calculateStats([]);
    expect(stats.totalTrades).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.totalPnl.toString()).toBe("0");
    expect(stats.averageWin.toString()).toBe("0");
    expect(stats.averageLoss.toString()).toBe("0");
    expect(stats.expectancy.toString()).toBe("0");
    expect(stats.averageR).toBeNull();
    expect(stats.tradesWithR).toBe(0);
  });

  it("calculates stats for a mix of wins, a loss and a break-even trade", () => {
    // P/L: +200, +100, -100, 0
    const stats = calculateStats([
      makeTrade("12"),
      makeTrade("11"),
      makeTrade("9"),
      makeTrade("10"),
    ]);

    expect(stats.totalTrades).toBe(4);
    expect(stats.wins).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.winRate).toBe(0.5);
    expect(stats.totalPnl.toString()).toBe("200");
    expect(stats.averageWin.toString()).toBe("150");
    expect(stats.averageLoss.toString()).toBe("-100");
    expect(stats.expectancy.toString()).toBe("50");
  });

  it("reports no average loss when every trade wins", () => {
    const stats = calculateStats([makeTrade("12"), makeTrade("11")]);
    expect(stats.winRate).toBe(1);
    expect(stats.losses).toBe(0);
    expect(stats.averageLoss.toString()).toBe("0");
  });

    it("averages R only over trades that have a stop", () => {
    // Entry 10, stop 9, 100 shares → risk $100
    // Exit 13 → +3R, exit 9 → -1R, and one trade without a stop
    const stats = calculateStats([
      makeTrade("13", "9"),
      makeTrade("9", "9"),
      makeTrade("12"),
    ]);

    expect(stats.tradesWithR).toBe(2);
    expect(stats.averageR?.toString()).toBe("1");
  });
});