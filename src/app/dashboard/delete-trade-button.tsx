"use client";

import { useState, useTransition } from "react";
import { deleteTrade } from "./actions";

export function DeleteTradeButton({ tradeId, symbol }: { tradeId: string; symbol: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-zinc-400 hover:text-red-400"
        aria-label={`Delete ${symbol} trade`}
      >
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => { await deleteTrade(tradeId); })}
        className="text-sm font-medium text-red-400 disabled:opacity-50"
      >
        {pending ? "Deleting..." : "Confirm"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(false)}
        className="text-sm text-zinc-400"
      >
        Cancel
      </button>
    </span>
  );
}
