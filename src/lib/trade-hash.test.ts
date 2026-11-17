import { describe, expect, it } from "vitest";
import { tradeDedupeHash } from "./trade-hash";

const trade = {
  symbol: "AAPL",
  side: "LONG" as const,
  entryPrice: 190.5,
  exitPrice: 192.1,
  shares: 100,
  entryAt: new Date("2026-11-02T14:35:00Z"),
  exitAt: new Date("2026-11-02T15:12:00Z"),
};

describe("tradeDedupeHash", () => {
  it("returns a 64-character SHA-256 hex string", () => {
    expect(tradeDedupeHash(trade)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("gives the same hash for the same trade", () => {
    expect(tradeDedupeHash({ ...trade })).toBe(tradeDedupeHash(trade));
  });

  it("gives a different hash when any identifying field changes", () => {
    const original = tradeDedupeHash(trade);
    expect(tradeDedupeHash({ ...trade, shares: 101 })).not.toBe(original);
    expect(tradeDedupeHash({ ...trade, side: "SHORT" })).not.toBe(original);
    expect(tradeDedupeHash({ ...trade, exitPrice: 192.11 })).not.toBe(original);
    expect(
      tradeDedupeHash({ ...trade, exitAt: new Date("2026-11-02T15:13:00Z") })
    ).not.toBe(original);
  });
});