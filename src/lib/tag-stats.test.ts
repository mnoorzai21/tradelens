import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { calculateStatsByTag } from "./tag-stats";

const d = (value: string) => new Prisma.Decimal(value);

// Entry $10, 100 shares → P/L = (exit − 10) × 100
function makeTrade(exitPrice: string, tags: string[], symbol = "TEST") {
  return {
    symbol,
    side: "LONG" as const,
    entryPrice: d("10"),
    exitPrice: d(exitPrice),
    stopPrice: null,
    shares: 100,
    fees: d("0"),
    tags: tags.map((name) => ({ name })),
  };
}

describe("calculateStatsByTag", () => {
  it("returns an empty list when there are no trades", () => {
    expect(calculateStatsByTag([])).toEqual([]);
  });

  it("counts a trade in every mistake it is tagged with", () => {
    const result = calculateStatsByTag([
      makeTrade("9", ["Chased entry", "No stop"]), // -100, two mistakes
      makeTrade("8", ["No stop"]), // -200
      makeTrade("12", []), // +200, no mistakes
    ]);

    expect(result.map((group) => group.tag)).toEqual(["No stop", "Chased entry", null]);

    expect(result[0].stats.totalTrades).toBe(2);
    expect(result[0].stats.totalPnl.toString()).toBe("-300");

    expect(result[1].stats.totalTrades).toBe(1);
    expect(result[1].stats.totalPnl.toString()).toBe("-100");

    expect(result[2].stats.totalPnl.toString()).toBe("200");
  });

  it("leaves out the no-mistakes group when every trade has a mistake", () => {
    const result = calculateStatsByTag([makeTrade("9", ["FOMO"])]);
    expect(result.map((group) => group.tag)).toEqual(["FOMO"]);
  });

    it("lists each mistake's symbols once, in alphabetical order", () => {
    const result = calculateStatsByTag([
      makeTrade("9", ["FOMO"], "TSLA"),
      makeTrade("8", ["FOMO"], "AAPL"),
      makeTrade("11", ["FOMO"], "TSLA"),
    ]);

    expect(result[0].symbols).toEqual(["AAPL", "TSLA"]);
  });
});
