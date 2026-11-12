import { calculateStats, type PerformanceStats } from "./stats";
import { uniqueSymbols } from "./symbols";

type TradeForTagStats = Parameters<typeof calculateStats>[0][number] & {
  symbol: string;
  tags: { name: string }[];
};

export type TagStats = {
  tag: string | null;
  symbols: string[];
  stats: PerformanceStats;
};

export function calculateStatsByTag(trades: TradeForTagStats[]): TagStats[] {
  const groups = new Map<string, TradeForTagStats[]>();
  const clean: TradeForTagStats[] = [];

  for (const trade of trades) {
    if (trade.tags.length === 0) {
      clean.push(trade);
      continue;
    }
    for (const { name } of trade.tags) {
      const group = groups.get(name) ?? [];
      group.push(trade);
      groups.set(name, group);
    }
  }

  const result: TagStats[] = [...groups.entries()]
        .map(([tag, group]) => ({
      tag,
      symbols: uniqueSymbols(group),
      stats: calculateStats(group),
    }))
    .sort((a, b) => a.stats.totalPnl.comparedTo(b.stats.totalPnl));

  if (clean.length > 0) {
    result.push({ tag: null, symbols: uniqueSymbols(clean), stats: calculateStats(clean) });
  }

  return result;
}