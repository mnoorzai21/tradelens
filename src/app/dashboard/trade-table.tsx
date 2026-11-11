import { calculatePnl } from "@/lib/pnl";
import { calculateRMultiple } from "@/lib/r-multiple";
import type { Trade } from "@/generated/prisma/client";
import { DeleteTradeButton } from "./delete-trade-button";
import Link from "next/link";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const pnlCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "exceptZero",
});

const rFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const marketTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function TradeTable({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-800 p-6 text-zinc-400">
        No trades yet. Add your first trade above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Your trades, newest first</caption>
        <thead className="border-b border-zinc-800 text-zinc-400">
          <tr>
            <th scope="col" className="px-4 py-3">Closed (ET)</th>
            <th scope="col" className="px-4 py-3">Symbol</th>
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
            const isWin = pnl.greaterThan(0);
            const isLoss = pnl.lessThan(0);
            const rMultiple = calculateRMultiple(trade);

            return (
              <tr key={trade.id} className="border-b border-zinc-900 last:border-0">
                <td className="px-4 py-3">{marketTime.format(trade.exitAt)}</td>
                <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                <td className="px-4 py-3">{trade.side === "LONG" ? "Long" : "Short"}</td>
                <td className="px-4 py-3 text-right">{trade.shares}</td>
                <td className="px-4 py-3 text-right">{currency.format(trade.entryPrice.toNumber())}</td>
                <td className="px-4 py-3 text-right">{currency.format(trade.exitPrice.toNumber())}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${isWin ? "text-green-400" : isLoss ? "text-red-400" : ""
                    }`}
                >
                  {pnlCurrency.format(pnl.toNumber())}
                </td>
                <td className="px-4 py-3 text-right">
                  {rMultiple ? (
                    `${rFormat.format(rMultiple.toNumber())}R`
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