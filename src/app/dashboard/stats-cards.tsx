import type { Prisma } from "@/generated/prisma/client";
import type { PerformanceStats } from "@/lib/stats";
import { formatPercent, formatR, formatSignedMoney, toneFor } from "@/lib/format";

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function StatCard({
  label,
  value,
  detail,
  tone = "",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 p-4">
      <dt className="text-sm text-zinc-400">{label}</dt>
      <dd className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</dd>
      {detail && <dd className="mt-1 text-xs text-zinc-500">{detail}</dd>}
    </div>
  );
}

export function StatsCards({
  stats,
  maxDrawdown,
}: {
  stats: PerformanceStats;
  maxDrawdown: Prisma.Decimal;
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Total P/L"
        value={formatSignedMoney(stats.totalPnl)}
        detail={plural(stats.totalTrades, "trade", "trades")}
        tone={toneFor(stats.totalPnl)}
      />
      <StatCard
        label="Win rate"
        value={formatPercent(stats.winRate)}
        detail={`${plural(stats.wins, "win", "wins")} · ${plural(stats.losses, "loss", "losses")}`}
        
      />
      <StatCard
        label="Avg win / avg loss"
        value={formatSignedMoney(stats.averageWin)}
        detail={`Avg loss ${formatSignedMoney(stats.averageLoss)}`}
      />
      <StatCard
        label="Expectancy"
        value={formatSignedMoney(stats.expectancy)}
        detail="Average P/L per trade"
        tone={toneFor(stats.expectancy)}
      />
      <StatCard
        label="Average R"
        value={stats.averageR ? formatR(stats.averageR) : "—"}
        detail={
          stats.averageR
            ? plural(stats.tradesWithR, "trade with a stop", "trades with a stop")
            : "Add stop prices to see R"
        }
        tone={stats.averageR ? toneFor(stats.averageR) : ""}
      />
      <StatCard
        label="Max drawdown"
        value={formatSignedMoney(maxDrawdown.negated())}
        detail="Largest drop from a peak"
        tone={maxDrawdown.greaterThan(0) ? "text-red-400" : ""}
      />
    </dl>
  );
}