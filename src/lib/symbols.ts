export function uniqueSymbols(trades: { symbol: string }[]): string[] {
  return [...new Set(trades.map((trade) => trade.symbol))].sort();
}

export function formatSymbols(symbols: string[]): string {
  if (symbols.length <= 3) return symbols.join(", ");
  return `${symbols.slice(0, 3).join(", ")} +${symbols.length - 3} more`;
}