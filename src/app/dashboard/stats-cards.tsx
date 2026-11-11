import type { Prisma } from "@/generated/prisma/client";
import type { PerformanceStats } from "@/lib/stats";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "exceptZero",
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

const rFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function toneFor(value: Prisma.Decimal) {
  if (value.greaterThan(0)) return "text-green-400";
  if (value.lessThan(0)) return "text-red-400";
  return "";
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

export function StatsCards({ stats }: { stats: PerformanceStats }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total P/L"
        value={money.format(stats.totalPnl.toNumber())}
        detail={plural(stats.totalTrades, "trade", "trades")}
        tone={toneFor(stats.totalPnl)}
      />
      <StatCard
        label="Win rate"
        value={percent.format(stats.winRate)}
        detail={`${plural(stats.wins, "win", "wins")} · ${plural(stats.losses, "loss", "losses")}`}
        
      />
      <StatCard
        label="Avg win / avg loss"
        value={money.format(stats.averageWin.toNumber())}
        detail={`Avg loss ${money.format(stats.averageLoss.toNumber())}`}
      />
      <StatCard
        label="Expectancy"
        value={money.format(stats.expectancy.toNumber())}
        detail="Average P/L per trade"
        tone={toneFor(stats.expectancy)}
      />
      <StatCard
        label="Average R"
        value={stats.averageR ? `${rFormat.format(stats.averageR.toNumber())}R` : "—"}
        detail={
          stats.averageR
            ? plural(stats.tradesWithR, "trade with a stop", "trades with a stop")
            : "Add stop prices to see R"
        }
        tone={stats.averageR ? toneFor(stats.averageR) : ""}
      />
    </dl>
  );
}