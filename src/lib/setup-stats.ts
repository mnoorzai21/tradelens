import { calculateStats, type PerformanceStats } from "./stats";

type TradeForSetupStats = Parameters<typeof calculateStats>[0][number] & {
  setup: { name: string } | null;
};

export type SetupStats = {
  setup: string | null;
  stats: PerformanceStats;
};

export function calculateStatsBySetup(trades: TradeForSetupStats[]): SetupStats[] {
  const groups = new Map<string | null, TradeForSetupStats[]>();

  for (const trade of trades) {
    const key = trade.setup?.name ?? null;
    const group = groups.get(key) ?? [];
    group.push(trade);
    groups.set(key, group);
  }

  return [...groups.entries()]
    .map(([setup, group]) => ({ setup, stats: calculateStats(group) }))
    .sort((a, b) => {
      if (a.setup === null) return 1;
      if (b.setup === null) return -1;
      return b.stats.totalPnl.comparedTo(a.stats.totalPnl);
    });
}