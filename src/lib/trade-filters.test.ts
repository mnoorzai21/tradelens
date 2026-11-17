import { describe, expect, it } from "vitest";
import {
  buildTradeWhere,
  parseTradeFilters,
  startOfEasternDay,
} from "./trade-filters";

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

describe("date filters", () => {
  it("keeps valid dates", () => {
    const filters = parseTradeFilters({ from: "2026-11-02", to: "2026-11-13" });
    expect(filters.from).toBe("2026-11-02");
    expect(filters.to).toBe("2026-11-13");
  });

  it("ignores dates in the wrong format", () => {
    expect(parseTradeFilters({ from: "11/02/2026" }).from).toBeUndefined();
  });

  it("ignores dates that don't exist", () => {
    expect(parseTradeFilters({ to: "2026-02-30" }).to).toBeUndefined();
  });
});

describe("startOfEasternDay", () => {
  it("uses UTC-5 in winter (Eastern Standard Time)", () => {
    expect(startOfEasternDay("2026-11-02").toISOString()).toBe(
      "2026-11-02T05:00:00.000Z"
    );
  });

  it("uses UTC-4 in summer (Eastern Daylight Time)", () => {
    expect(startOfEasternDay("2026-07-01").toISOString()).toBe(
      "2026-07-01T04:00:00.000Z"
    );
  });

  it("handles the day daylight saving time ends", () => {
    // Clocks go back at 2 AM on Nov 1, 2026, so midnight is still UTC-4
    expect(startOfEasternDay("2026-11-01").toISOString()).toBe(
      "2026-11-01T04:00:00.000Z"
    );
  });

  it("handles the day daylight saving time starts", () => {
    // Clocks go forward at 2 AM on Mar 8, 2026, so midnight is still UTC-5
    expect(startOfEasternDay("2026-03-08").toISOString()).toBe(
      "2026-03-08T05:00:00.000Z"
    );
  });
});

describe("buildTradeWhere with dates", () => {
  it("includes the whole 'to' day by stopping at the next midnight", () => {
    const where = buildTradeWhere("user-1", { from: "2026-11-02", to: "2026-11-13" });
    expect(where).toEqual({
      userId: "user-1",
      exitAt: {
        gte: new Date("2026-11-02T05:00:00.000Z"),
        lt: new Date("2026-11-14T05:00:00.000Z"),
      },
    });
  });

  it("supports only a start date", () => {
    const where = buildTradeWhere("user-1", { from: "2026-11-02" });
    expect(where).toEqual({
      userId: "user-1",
      exitAt: { gte: new Date("2026-11-02T05:00:00.000Z") },
    });
  });
});