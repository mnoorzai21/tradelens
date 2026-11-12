import type { Prisma } from "@/generated/prisma/client";
import type { TagStats } from "@/lib/tag-stats";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "exceptZero",
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

function toneFor(value: Prisma.Decimal) {
  if (value.greaterThan(0)) return "text-green-400";
  if (value.lessThan(0)) return "text-red-400";
  return "";
}

function formatSymbols(symbols: string[]) {
  if (symbols.length <= 3) return symbols.join(", ");
  return `${symbols.slice(0, 3).join(", ")} +${symbols.length - 3} more`;
}

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
              <td className="px-4 py-3 text-right">{percent.format(stats.winRate)}</td>
              <td className={`px-4 py-3 text-right font-medium ${toneFor(stats.totalPnl)}`}>
                {money.format(stats.totalPnl.toNumber())}
              </td>
              <td className={`px-4 py-3 text-right ${toneFor(stats.expectancy)}`}>
                {money.format(stats.expectancy.toNumber())}
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