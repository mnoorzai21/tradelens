import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { calculateRMultiple } from "./r-multiple";

const d = (value: string) => new Prisma.Decimal(value);

function makeTrade(overrides: Partial<Parameters<typeof calculateRMultiple>[0]> = {}) {
  return {
    side: "LONG" as const,
    entryPrice: d("10"),
    exitPrice: d("13"),
    stopPrice: d("9") as Prisma.Decimal | null,
    shares: 100,
    fees: d("0"),
    ...overrides,
  };
}

describe("calculateRMultiple", () => {
  it("returns +3R when a long trade makes three times its risk", () => {
    expect(calculateRMultiple(makeTrade())?.toString()).toBe("3");
  });

  it("returns -1R when a long trade is stopped out", () => {
    expect(calculateRMultiple(makeTrade({ exitPrice: d("9") }))?.toString()).toBe("-1");
  });

  it("works for short trades, with the stop above entry", () => {
    const trade = makeTrade({
      side: "SHORT",
      entryPrice: d("20"),
      stopPrice: d("21"),
      exitPrice: d("18"),
    });
    expect(calculateRMultiple(trade)?.toString()).toBe("2");
  });

  it("includes fees in the result", () => {
    const trade = makeTrade({ exitPrice: d("12"), fees: d("10") });
    expect(calculateRMultiple(trade)?.toString()).toBe("1.9");
  });

  it("returns null when there is no stop price", () => {
    expect(calculateRMultiple(makeTrade({ stopPrice: null }))).toBeNull();
  });

  it("returns null when the stop equals the entry (zero risk)", () => {
    expect(calculateRMultiple(makeTrade({ stopPrice: d("10") }))).toBeNull();
  });
});