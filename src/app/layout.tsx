import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tradelens-mnoorzai.vercel.app"),
  title: {
    default: "TradeLens: Trading Journal for Day Traders",
    template: "%s | TradeLens",
  },
  description:
    "Log your trades and see what actually makes you money: P/L, win rate, expectancy, R-multiples, max drawdown, and what each trading mistake costs you.",
  openGraph: {
    title: "TradeLens: Trading Journal for Day Traders",
    description:
      "Log your trades and see P/L, win rate, expectancy, R-multiples, and what each trading mistake costs you. Try the one-click demo.",
    url: "/",
    siteName: "TradeLens",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
