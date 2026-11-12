import type { Prisma } from "@/generated/prisma/client";
import type { SetupStats } from "@/lib/setup-stats";

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

function toneFor(value: Prisma.Decimal) {
  if (value.greaterThan(0)) return "text-green-400";
  if (value.lessThan(0)) return "text-red-400";
  return "";
}

export function SetupStatsTable({ groups }: { groups: SetupStats[] }) {
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-800 p-6 text-zinc-400">
        No trades yet. Add trades with a setup to compare your setups.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <caption className="sr-only">Performance by setup, most profitable first</caption>
        <thead className="border-b border-zinc-800 text-zinc-400">
          <tr>
            <th scope="col" className="px-4 py-3">Setup</th>
            <th scope="col" className="px-4 py-3 text-right">Trades</th>
            <th scope="col" className="px-4 py-3 text-right">Win rate</th>
            <th scope="col" className="px-4 py-3 text-right">Total P/L</th>
            <th scope="col" className="px-4 py-3 text-right">Expectancy</th>
            <th scope="col" className="px-4 py-3 text-right">Average R</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ setup, stats }) => (
            <tr key={setup ?? "no-setup"} className="border-b border-zinc-900 last:border-0">
              <th scope="row" className="px-4 py-3 font-medium">
                {setup ?? <span className="text-zinc-500">No setup</span>}
              </th>
              <td className="px-4 py-3 text-right">{stats.totalTrades}</td>
              <td className="px-4 py-3 text-right">{percent.format(stats.winRate)}</td>
              <td className={`px-4 py-3 text-right font-medium ${toneFor(stats.totalPnl)}`}>
                {money.format(stats.totalPnl.toNumber())}
              </td>
              <td className={`px-4 py-3 text-right ${toneFor(stats.expectancy)}`}>
                {money.format(stats.expectancy.toNumber())}
              </td>
              <td className="px-4 py-3 text-right">
                {stats.averageR ? (
                  `${rFormat.format(stats.averageR.toNumber())}R`
                ) : (
                  <span className="text-zinc-500">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
