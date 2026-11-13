import { calculatePnl } from "@/lib/pnl";
import { calculateRMultiple } from "@/lib/r-multiple";
import { formatPrice, formatR, formatSignedMoney, toneFor } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import { DeleteTradeButton } from "./delete-trade-button";
import Link from "next/link";

type TradeWithSetup = Prisma.TradeGetPayload<{
  include: { setup: { select: { name: true } } };
}>;

const marketTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function TradeTable({ trades }: { trades: TradeWithSetup[] }) {
  if (trades.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-800 p-6 text-zinc-400">
        No trades yet. Add your first trade above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <caption className="sr-only">Your trades, newest first</caption>
        <thead className="border-b border-zinc-800 text-zinc-400">
          <tr>
            <th scope="col" className="px-4 py-3">Closed (ET)</th>
            <th scope="col" className="px-4 py-3">Symbol</th>
            <th scope="col" className="px-4 py-3">Setup</th>
            <th scope="col" className="px-4 py-3">Side</th>
            <th scope="col" className="px-4 py-3 text-right">Shares</th>
            <th scope="col" className="px-4 py-3 text-right">Entry</th>
            <th scope="col" className="px-4 py-3 text-right">Exit</th>
            <th scope="col" className="px-4 py-3 text-right">P/L</th>
            <th scope="col" className="px-4 py-3 text-right">R</th>
            <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const pnl = calculatePnl(trade);
            const rMultiple = calculateRMultiple(trade);

            return (
              <tr key={trade.id} className="border-b border-zinc-900 last:border-0">
                <td className="px-4 py-3">{marketTime.format(trade.exitAt)}</td>
                <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                <td className="px-4 py-3 text-zinc-300">
                  {trade.setup?.name ?? <span className="text-zinc-500">—</span>}
                </td>
                <td className="px-4 py-3">{trade.side === "LONG" ? "Long" : "Short"}</td>
                <td className="px-4 py-3 text-right">{trade.shares}</td>
                <td className="px-4 py-3 text-right">{formatPrice(trade.entryPrice)}</td>
                <td className="px-4 py-3 text-right">{formatPrice(trade.exitPrice)}</td>
                <td className={`px-4 py-3 text-right font-medium ${toneFor(pnl)}`}>
                  {formatSignedMoney(pnl)}
                </td>
                <td className="px-4 py-3 text-right">
                  {rMultiple ? (
                    formatR(rMultiple)
                  ) : (
                    <span className="text-zinc-500" title="No stop price">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex gap-3">
                    <Link
                      href={`/dashboard/trades/${trade.id}/edit`}
                      className="text-sm text-zinc-400 hover:text-white"
                      aria-label={`Edit ${trade.symbol} trade`}
                    >
                      Edit
                    </Link>
                    <DeleteTradeButton tradeId={trade.id} symbol={trade.symbol} />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}