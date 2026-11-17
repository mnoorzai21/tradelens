"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPnl } from "@/lib/daily-pnl";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// The dates are already Eastern market dates, so format them in UTC
// to keep the browser's time zone from shifting them by a day
const shortDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});

function formatDate(date: string) {
  return shortDate.format(new Date(`${date}T00:00:00Z`));
}

export function DailyPnlChart({ days }: { days: DailyPnl[] }) {
  if (days.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 flex flex-col gap-3">
      <h2 className="text-lg font-semibold">P/L by day</h2>
      <div className="h-72 overflow-hidden rounded-xl border border-neutral-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#737373"
              tick={{ fontSize: 12 }}
              tickLine={false}
              minTickGap={24}
              tickFormatter={(value) => formatDate(String(value))}
            />
            <YAxis
              stroke="#737373"
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => money.format(Number(value))}
              width={72}
              domain={[
                (dataMin: number) => Math.min(0, Math.floor(dataMin / 50) * 50),
                (dataMax: number) => Math.max(0, Math.ceil(dataMax / 50) * 50),
              ]}
            />
            <ReferenceLine y={0} stroke="#525252" />
            <Tooltip
              cursor={{ fill: "#171717" }}
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid #262626",
                borderRadius: 8,
              }}
              itemStyle={{ color: "#e5e5e5" }}
              labelFormatter={(label) => formatDate(String(label))}
              formatter={(value, _name, item) => {
                const trades = item.payload.trades;
                return [
                  `${money.format(Number(value))} (${trades} ${trades === 1 ? "trade" : "trades"})`,
                  "P/L",
                ];
              }}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {days.map((day) => (
                <Cell key={day.date} fill={day.pnl >= 0 ? "#4ade80" : "#f87171"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}