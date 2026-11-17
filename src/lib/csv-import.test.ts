import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MAX_IMPORT_ROWS, parseTradesCsv } from "./csv-import";

const HEADER =
  "symbol,side,entryPrice,exitPrice,stopPrice,shares,fees,entryAt,exitAt,setup,mistakes,notes";

function csv(...rows: string[]) {
  return [HEADER, ...rows].join("\n");
}

describe("parseTradesCsv with the sample file", () => {
  const sample = readFileSync(
    path.join(process.cwd(), "public/samples/sample-trades.csv"),
    "utf8"
  );
  const result = parseTradesCsv(sample);

  it("imports every row without errors", () => {
    expect(result.errors).toEqual([]);
    expect(result.trades).toHaveLength(10);
  });

  it("reads the first trade correctly", () => {
    const trade = result.trades[0];
    expect(trade.symbol).toBe("AAPL");
    expect(trade.side).toBe("LONG");
    expect(trade.entryPrice).toBe(190.5);
    expect(trade.shares).toBe(100);
    expect(trade.setup).toBe("Breakout");
    expect(trade.tags).toEqual([]);
  });

  it("reads short trades", () => {
    expect(result.trades[1].side).toBe("SHORT");
  });

  it("splits several mistakes and keeps commas inside quoted notes", () => {
    const mara = result.trades[2];
    expect(mara.tags).toEqual(["Chased entry", "Moved stop"]);
    expect(mara.notes).toBe(
      "Entered late after the first push, then moved my stop down"
    );
  });

  it("leaves the stop empty when the cell is empty", () => {
    expect(result.trades[4].stopPrice).toBeUndefined();
  });
});

describe("parseTradesCsv times", () => {
  it("reads times as Eastern Standard Time in winter (UTC-5)", () => {
    const { trades } = parseTradesCsv(
      csv("AAPL,long,10,11,,100,0,2026-11-02 09:35,2026-11-02 10:12,,,")
    );
    expect(trades[0].entryAt.toISOString()).toBe("2026-11-02T14:35:00.000Z");
  });

  it("reads times as Eastern Daylight Time in summer (UTC-4)", () => {
    const { trades } = parseTradesCsv(
      csv("AAPL,long,10,11,,100,0,2026-07-01 09:35,2026-07-01 10:12,,,")
    );
    expect(trades[0].entryAt.toISOString()).toBe("2026-07-01T13:35:00.000Z");
  });

  it("rejects times in another format", () => {
    const { errors } = parseTradesCsv(
      csv("AAPL,long,10,11,,100,0,11/02/2026 9:35,2026-11-02 10:12,,,")
    );
    expect(errors[0].message).toContain("Enter a valid entry time");
  });

  it("rejects dates that don't exist", () => {
    const { errors } = parseTradesCsv(
      csv("AAPL,long,10,11,,100,0,2026-02-30 09:35,2026-02-30 10:12,,,")
    );
    expect(errors).toHaveLength(1);
  });
});

describe("parseTradesCsv errors", () => {
  it("imports good rows and reports bad rows with spreadsheet row numbers", () => {
    const result = parseTradesCsv(
      csv(
        "AAPL,long,10,11,,100,0,2026-11-02 09:35,2026-11-02 10:12,,,",
        "TSLA,long,10,-5,,100,0,2026-11-02 09:35,2026-11-02 10:12,,,"
      )
    );
    expect(result.trades).toHaveLength(1);
    expect(result.errors).toEqual([
      { row: 3, message: "Exit price must be greater than 0" },
    ]);
  });

  it("reports missing columns once instead of an error per row", () => {
    const result = parseTradesCsv("symbol,side\nAAPL,long");
    expect(result.trades).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("entryPrice");
  });

  it("rejects files with too many rows", () => {
    const row = "AAPL,long,10,11,,100,0,2026-11-02 09:35,2026-11-02 10:12,,,";
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, () => row);
    const result = parseTradesCsv(csv(...rows));
    expect(result.trades).toEqual([]);
    expect(result.errors[0].message).toContain("Too many rows");
  });
});