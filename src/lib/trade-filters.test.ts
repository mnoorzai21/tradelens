import { describe, expect, it } from "vitest";
import { buildTradeWhere, parseTradeFilters } from "./trade-filters";

describe("parseTradeFilters", () => {
  it("returns no filters when the URL has none", () => {
    expect(parseTradeFilters({})).toEqual({});
  });

  it("uppercases and trims the symbol", () => {
    expect(parseTradeFilters({ symbol: " aapl " }).symbol).toBe("AAPL");
  });

  it("ignores empty values", () => {
    expect(parseTradeFilters({ symbol: "", setup: "   " })).toEqual({});
  });

  it("uses the first value when a param is repeated", () => {
    expect(parseTradeFilters({ setup: ["Breakout", "Bull flag"] }).setup).toBe(
      "Breakout"
    );
  });

  it("ignores values that are too long instead of failing", () => {
    const filters = parseTradeFilters({ symbol: "X".repeat(200), setup: "Breakout" });
    expect(filters.symbol).toBeUndefined();
    expect(filters.setup).toBe("Breakout");
  });
});

describe("buildTradeWhere", () => {
  it("only filters by user when there are no filters", () => {
    expect(buildTradeWhere("user-1", {})).toEqual({ userId: "user-1" });
  });

  it("adds the symbol and setup filters", () => {
    expect(
      buildTradeWhere("user-1", { symbol: "AAPL", setup: "Breakout" })
    ).toEqual({
      userId: "user-1",
      symbol: "AAPL",
      setup: { name: "Breakout" },
    });
  });

  it("always keeps the user ID, so filters can't reach other users' trades", () => {
    const where = buildTradeWhere("user-1", { symbol: "AAPL" });
    expect(where.userId).toBe("user-1");
  });
});