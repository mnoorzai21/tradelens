import type { TagStats } from "@/lib/tag-stats";
import { formatSymbols } from "@/lib/symbols";
import { formatPercent, formatSignedMoney, toneFor } from "@/lib/format";

export function MistakeStatsTable({ groups }: { groups: TagStats[] }) {
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-800 p-6 text-zinc-400">
        No trades yet. Tag your mistakes when you log trades to see what they cost you.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <caption className="sr-only">Performance by mistake, most costly first</caption>
        <thead className="border-b border-zinc-800 text-zinc-400">
          <tr>
            <th scope="col" className="px-4 py-3">Mistake</th>
            <th scope="col" className="px-4 py-3">Symbols</th>
            <th scope="col" className="px-4 py-3 text-right">Trades</th>
            <th scope="col" className="px-4 py-3 text-right">Win rate</th>
            <th scope="col" className="px-4 py-3 text-right">Total P/L</th>
            <th scope="col" className="px-4 py-3 text-right">Expectancy</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ tag, symbols, stats }) => (
            <tr key={tag ?? "no-mistakes"} className="border-b border-zinc-900 last:border-0">
              <th scope="row" className="px-4 py-3 font-medium">
                {tag ?? <span className="text-green-400">No mistakes</span>}
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
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-zinc-900 px-4 py-2 text-xs text-zinc-500">
        A trade with several mistakes counts in each of them, so rows don&apos;t add up to your total.
      </p>
    </div>
  );
}