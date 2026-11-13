import type { SetupStats } from "@/lib/setup-stats";
import { formatSymbols } from "@/lib/symbols";
import { formatPercent, formatR, formatSignedMoney, toneFor } from "@/lib/format";

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
            <th scope="col" className="px-4 py-3">Symbols</th>
            <th scope="col" className="px-4 py-3 text-right">Trades</th>
            <th scope="col" className="px-4 py-3 text-right">Win rate</th>
            <th scope="col" className="px-4 py-3 text-right">Total P/L</th>
            <th scope="col" className="px-4 py-3 text-right">Expectancy</th>
            <th scope="col" className="px-4 py-3 text-right">Average R</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ setup, symbols, stats }) => (
            <tr key={setup ?? "no-setup"} className="border-b border-zinc-900 last:border-0">
              <th scope="row" className="px-4 py-3 font-medium">
                {setup ?? <span className="text-zinc-500">No setup</span>}
              </th>
              <td className="px-4 py-3 text-zinc-300" title={symbols.join(", ")}>
                {formatSymbols(symbols)}
              </td>
              <td className="px-4 py-3 text-right">{stats.totalTrades}</td>
              <td className="px-4 py-3 text-right">{formatPercent(stats.winRate)}</td>
              <td className={`px-4 py-3 text-right font-medium ${toneFor(stats.totalPnl)}`}>
                {formatSignedMoney(stats.totalPnl)}
              </td>
              <td className={`px-4 py-3 text-right ${toneFor(stats.expectancy)}`}>
                {formatSignedMoney(stats.expectancy)}
              </td>
              <td className="px-4 py-3 text-right">
                {stats.averageR ? (
                  formatR(stats.averageR)
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
