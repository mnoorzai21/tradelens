import { ImageResponse } from "next/og";

export const alt =
  "TradeLens: a trading journal for day traders, showing P/L, win rate, expectancy and R-multiples";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATS = [
  { label: "Total P/L", value: "+$1,981.50", color: "#4ade80" },
  { label: "Win rate", value: "45%", color: "#ffffff" },
  { label: "Expectancy", value: "+$33.02", color: "#4ade80" },
  { label: "Average R", value: "+0.39R", color: "#4ade80" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>
          TradeLens
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 36,
            color: "#a3a3a3",
          }}
        >
          A trading journal for day traders
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 64 }}>
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "24px 20px",
                border: "2px solid #262626",
                borderRadius: 16,
              }}
            >
              <div style={{ display: "flex", fontSize: 24, color: "#a3a3a3" }}>
                {stat.label}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 34,
                  fontWeight: 700,
                  color: stat.color,
                  whiteSpace: "nowrap",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}