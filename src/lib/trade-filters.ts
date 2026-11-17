import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

type SearchParams = Record<string, string | string[] | undefined>;

// A URL can repeat a param (?symbol=A&symbol=B), so take the first value.
// Empty values (?symbol=) mean "no filter".
function firstNonEmpty(value: unknown) {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && first.trim() !== "" ? first : undefined;
}

// A real calendar date in YYYY-MM-DD format (rejects things like 2026-02-30)
const marketDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  });

const tradeFiltersSchema = z.object({
  symbol: z.preprocess(
    firstNonEmpty,
    z.string().trim().toUpperCase().max(10).optional().catch(undefined)
  ),
  setup: z.preprocess(
    firstNonEmpty,
    z.string().trim().max(50).optional().catch(undefined)
  ),
    mistake: z.preprocess(
    firstNonEmpty,
    z.string().trim().max(30).optional().catch(undefined)
  ),
  from: z.preprocess(firstNonEmpty, marketDate.optional().catch(undefined)),
  to: z.preprocess(firstNonEmpty, marketDate.optional().catch(undefined)),
});

// The "No mistakes" option, for trades without any mistake tags
export const NO_MISTAKES = "none";

export type TradeFilters = z.infer<typeof tradeFiltersSchema>;

export function parseTradeFilters(searchParams: SearchParams): TradeFilters {
  return tradeFiltersSchema.parse(searchParams);
}

// Eastern Time's offset from UTC at a given moment, like "-05:00" or "-04:00"
export function easternOffset(instant: Date): string {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "longOffset",
  })
    .formatToParts(instant)
    .find((p) => p.type === "timeZoneName");
  return part?.value.replace("GMT", "") || "+00:00";
}

// Midnight Eastern Time at the start of a market date, as a UTC Date.
// The offset is checked at 05:00 UTC, which is around midnight Eastern,
// so days when daylight saving time starts or ends are handled correctly.
export function startOfEasternDay(date: string): Date {
  const offset = easternOffset(new Date(`${date}T05:00:00Z`));
  return new Date(`${date}T00:00:00${offset}`);
}

function nextDate(date: string): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

export function buildTradeWhere(
  userId: string,
  filters: TradeFilters
): Prisma.TradeWhereInput {
  const exitAt: Prisma.DateTimeFilter = {};
  if (filters.from) {
    exitAt.gte = startOfEasternDay(filters.from);
  }
  if (filters.to) {
    // "To Nov 13" includes the whole day, so stop at midnight on Nov 14
    exitAt.lt = startOfEasternDay(nextDate(filters.to));
  }

  return {
    userId,
    ...(filters.symbol ? { symbol: filters.symbol } : {}),
    ...(filters.setup ? { setup: { name: filters.setup } } : {}),
        ...(filters.mistake === NO_MISTAKES
      ? { tags: { none: {} } }
      : filters.mistake
        ? { tags: { some: { name: filters.mistake } } }
        : {}),
    ...(filters.from || filters.to ? { exitAt } : {}),
  };
}