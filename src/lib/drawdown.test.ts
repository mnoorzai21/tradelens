import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { calculateMaxDrawdown } from "./drawdown";

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

describe("calculateMaxDrawdown", () => {
  it("returns 0 when there are no trades", () => {
    expect(calculateMaxDrawdown([]).toString()).toBe("0");
  });

  it("returns 0 when equity only goes up", () => {
    const trades = [
      makeTrade("11", "2026-11-02T15:00:00Z"), // +100
      makeTrade("12", "2026-11-03T15:00:00Z"), // +200
    ];
    expect(calculateMaxDrawdown(trades).toString()).toBe("0");
  });

  it("measures the largest drop from a peak", () => {
    // P/L: +100, -50, -100, +200 → equity: 100, 50, -50, 150
    // Peak 100 → low -50 = drawdown 150
    const trades = [
      makeTrade("11", "2026-11-02T15:00:00Z"),
      makeTrade("9.5", "2026-11-03T15:00:00Z"),
      makeTrade("9", "2026-11-04T15:00:00Z"),
      makeTrade("12", "2026-11-05T15:00:00Z"),
    ];
    expect(calculateMaxDrawdown(trades).toString()).toBe("150");
  });

  it("sorts trades by exit time before calculating", () => {
    // Same trades as above, given out of order
    const trades = [
      makeTrade("12", "2026-11-05T15:00:00Z"),
      makeTrade("9", "2026-11-04T15:00:00Z"),
      makeTrade("11", "2026-11-02T15:00:00Z"),
      makeTrade("9.5", "2026-11-03T15:00:00Z"),
    ];
    expect(calculateMaxDrawdown(trades).toString()).toBe("150");
  });

  it("counts losses from the very first trade", () => {
    // P/L: -100, -50 → equity: -100, -150 → drawdown 150 from the starting point
    const trades = [
      makeTrade("9", "2026-11-02T15:00:00Z"),
      makeTrade("9.5", "2026-11-03T15:00:00Z"),
    ];
    expect(calculateMaxDrawdown(trades).toString()).toBe("150");
  });
});