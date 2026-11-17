import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

type SearchParams = Record<string, string | string[] | undefined>;

// A URL can repeat a param (?symbol=A&symbol=B), so take the first value.
// Empty values (?symbol=) mean "no filter".
function firstNonEmpty(value: unknown) {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && first.trim() !== "" ? first : undefined;
}

const tradeFiltersSchema = z.object({
  symbol: z.preprocess(
    firstNonEmpty,
    z.string().trim().toUpperCase().max(10).optional().catch(undefined)
  ),
  setup: z.preprocess(
    firstNonEmpty,
    z.string().trim().max(50).optional().catch(undefined)
  ),
});

export type TradeFilters = z.infer<typeof tradeFiltersSchema>;

export function parseTradeFilters(searchParams: SearchParams): TradeFilters {
  return tradeFiltersSchema.parse(searchParams);
}

export function buildTradeWhere(
  userId: string,
  filters: TradeFilters
): Prisma.TradeWhereInput {
  return {
    userId,
    ...(filters.symbol ? { symbol: filters.symbol } : {}),
    ...(filters.setup ? { setup: { name: filters.setup } } : {}),
  };
}