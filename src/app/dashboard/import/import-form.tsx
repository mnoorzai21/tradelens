"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { importTrades, type ImportState } from "./actions";

const initialState: ImportState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-lg bg-white px-5 py-2.5 font-medium text-black hover:bg-neutral-200 disabled:opacity-60"
    >
      {pending ? "Importing..." : "Import trades"}
    </button>
  );
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function ImportForm() {
  const [state, formAction] = useActionState(importTrades, initialState);

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-neutral-400">CSV file</span>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="rounded-lg border border-neutral-700 p-3 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-neutral-200"
          />
        </label>
        <SubmitButton />
      </form>

      {state.status === "success" && (
        <div
          role="status"
          className="rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-200"
        >
          {state.imported > 0
            ? `Imported ${plural(state.imported, "trade")}.`
            : "No new trades to import."}
          {state.skipped > 0 &&
            ` Skipped ${plural(state.skipped, "trade")} that ${state.skipped === 1 ? "was" : "were"
            } already in your journal.`}{" "}
          <Link href="/dashboard" className="font-medium underline">
            Back to the dashboard
          </Link>
        </div>
      )}

      {state.status === "error" && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
        >
          <p>{state.message}</p>
          {state.rowErrors.length > 0 && (
            <ul className="mt-3 flex max-h-64 flex-col gap-1 overflow-y-auto">
              {state.rowErrors.map((error) => (
                <li key={error.row}>
                  <span className="font-medium">Row {error.row}:</span> {error.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}