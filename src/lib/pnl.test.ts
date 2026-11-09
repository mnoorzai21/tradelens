import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { calculatePnl } from "./pnl";

const d = (value: string) => new Prisma.Decimal(value);

function makeTrade(overrides: Partial<Parameters<typeof calculatePnl>[0]> = {}) {
  return {
    side: "LONG" as const,
    entryPrice: d("10"),
    exitPrice: d("12"),
    shares: 100,
    fees: d("0"),
    ...overrides,
  };
}

describe("calculatePnl", () => {
  it("returns a profit for a long trade when the price rises", () => {
    expect(calculatePnl(makeTrade()).toString()).toBe("200");
  });

  it("returns a loss for a long trade when the price falls", () => {
    expect(calculatePnl(makeTrade({ exitPrice: d("9") })).toString()).toBe("-100");
  });

  it("returns a profit for a short trade when the price falls", () => {
    const trade = makeTrade({ side: "SHORT", entryPrice: d("20"), exitPrice: d("19") });
    expect(calculatePnl(trade).toString()).toBe("100");
  });

  it("returns a loss for a short trade when the price rises", () => {
    const trade = makeTrade({ side: "SHORT", entryPrice: d("20"), exitPrice: d("21") });
    expect(calculatePnl(trade).toString()).toBe("-100");
  });

  it("subtracts fees, including fractions of a cent", () => {
    const trade = makeTrade({ entryPrice: d("358"), exitPrice: d("378"), fees: d("0.036") });
    expect(calculatePnl(trade).toString()).toBe("1999.964");
  });

  it("loses only the fees when the trade breaks even", () => {
    const trade = makeTrade({ entryPrice: d("10"), exitPrice: d("10"), fees: d("1.5") });
    expect(calculatePnl(trade).toString()).toBe("-1.5");
  });

  it("avoids floating-point errors", () => {
    // In plain JavaScript, 0.3 - 0.1 = 0.19999999999999998
    const trade = makeTrade({ entryPrice: d("0.1"), exitPrice: d("0.3"), shares: 1 });
    expect(calculatePnl(trade).toString()).toBe("0.2");
  });
});