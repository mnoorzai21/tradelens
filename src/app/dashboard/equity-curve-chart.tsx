"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EquityPoint } from "@/lib/equity-curve";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function EquityCurveChart({ points }: { points: EquityPoint[] }) {
  if (points.length === 0) {
    return null;
  }

  const finalEquity = points[points.length - 1].equity;
  const lineColor = finalEquity >= 0 ? "#4ade80" : "#f87171";

  return (
    <section className="mt-8 flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Equity curve</h2>
      <div className="h-72 overflow-hidden rounded-xl border border-neutral-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis
              dataKey="tradeNumber"
              stroke="#737373"
              tick={{ fontSize: 12 }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              stroke="#737373"
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => money.format(Number(value))}
              width={72}
            />
            <ReferenceLine y={0} stroke="#525252" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid #262626",
                borderRadius: 8,
              }}
              labelFormatter={(label) => `Trade #${label}`}
              formatter={(value) => [money.format(Number(value)), "Equity"]}
            />
            <Line
              type="linear"
              dataKey="equity"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}