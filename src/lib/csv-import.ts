import Papa from "papaparse";
import { tradeSchema, type TradeInput } from "./validations/trade";
import { easternOffset } from "./trade-filters";

export const MAX_IMPORT_ROWS = 1000;

const REQUIRED_COLUMNS = [
  "symbol",
  "side",
  "entryPrice",
  "exitPrice",
  "shares",
  "entryAt",
  "exitAt",
] as const;

export type CsvRowError = { row: number; message: string };

export type CsvParseResult = {
  trades: TradeInput[];
  errors: CsvRowError[];
};

// "2026-11-02 09:35" in Eastern Time → a UTC Date.
// Anything else becomes "", which the schema reports as an invalid time.
function easternToUtc(value: string | undefined): Date | "" {
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    (value ?? "").trim()
  );
  if (!match) {
    return "";
  }
  const [, date, hours, minutes, seconds = "00"] = match;

  // Reject dates that don't exist, like 2026-02-30
  const day = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(day.getTime()) || !day.toISOString().startsWith(date)) {
    return "";
  }

  // Check the offset about 5 hours after this time in UTC,
  // which is close to the same moment in New York
  const approx = new Date(`${date}T${hours}:${minutes}:${seconds}Z`);
  const offset = easternOffset(new Date(approx.getTime() + 5 * 60 * 60 * 1000));
  return new Date(`${date}T${hours}:${minutes}:${seconds}${offset}`);
}

function splitMistakes(value: string | undefined): string[] {
  return (value ?? "")
    .split(";")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseTradesCsv(text: string): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });

  const columns = parsed.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter((column) => !columns.includes(column));
  if (missing.length > 0) {
    return {
      trades: [],
      errors: [{ row: 1, message: `Missing columns: ${missing.join(", ")}` }],
    };
  }

  if (parsed.data.length > MAX_IMPORT_ROWS) {
    return {
      trades: [],
      errors: [
        { row: 1, message: `Too many rows. The limit is ${MAX_IMPORT_ROWS} per file.` },
      ],
    };
  }

  const trades: TradeInput[] = [];
  const errors: CsvRowError[] = [];

  parsed.data.forEach((cells, index) => {
    // Row 1 is the header, so the first trade is row 2, like in a spreadsheet
    const row = index + 2;

    const result = tradeSchema.safeParse({
      ...cells,
      side: (cells.side ?? "").trim().toUpperCase(),
      entryAt: easternToUtc(cells.entryAt),
      exitAt: easternToUtc(cells.exitAt),
      tags: splitMistakes(cells.mistakes),
    });

    if (result.success) {
      trades.push(result.data);
    } else {
      const messages = [...new Set(result.error.issues.map((issue) => issue.message))];
      errors.push({ row, message: messages.join("; ") });
    }
  });

  return { trades, errors };
}