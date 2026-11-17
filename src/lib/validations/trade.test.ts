import { describe, expect, it } from "vitest";
import { tradeSchema } from "./trade";

// The same shape the form and the CSV import send
const base = {
  symbol: "aapl",
  side: "LONG",
  entryPrice: "10",
  exitPrice: "11",
  stopPrice: "9.5",
  shares: "100",
  fees: "1",
  entryAt: "2026-11-02T14:35:00Z",
  exitAt: "2026-11-02T15:12:00Z",
  tags: [],
};

function stopError(input: Record<string, unknown>) {
  const result = tradeSchema.safeParse(input);
  if (result.success) {
    return undefined;
  }
  return result.error.issues.find((issue) => issue.path[0] === "stopPrice")?.message;
}

describe("tradeSchema stop direction", () => {
  it("accepts a long with the stop below the entry", () => {
    expect(tradeSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a long with the stop above the entry", () => {
    expect(stopError({ ...base, stopPrice: "10.5" })).toContain("below the entry");
  });

  it("accepts a short with the stop above the entry", () => {
    const short = { ...base, side: "SHORT", exitPrice: "9", stopPrice: "10.5" };
    expect(tradeSchema.safeParse(short).success).toBe(true);
  });

  it("rejects a short with the stop below the entry", () => {
    const short = { ...base, side: "SHORT", exitPrice: "9", stopPrice: "9.5" };
    expect(stopError(short)).toContain("above it");
  });

  it("rejects a stop equal to the entry, since that's zero risk", () => {
    expect(stopError({ ...base, stopPrice: "10" })).toBeDefined();
  });

  it("accepts a trade without a stop", () => {
    expect(tradeSchema.safeParse({ ...base, stopPrice: "" }).success).toBe(true);
  });
});