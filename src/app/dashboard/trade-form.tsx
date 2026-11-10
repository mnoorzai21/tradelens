"use client";

import { useActionState, useEffect, useRef, startTransition } from "react";
import type { TradeFormState } from "./actions";

type TradeFormProps = {
  title: string;
  submitLabel: string;
  pendingLabel: string;
  action: (state: TradeFormState, formData: FormData) => Promise<TradeFormState>;
  resetOnSuccess?: boolean;
  defaults?: TradeFormDefaults;
};

export type TradeFormDefaults = {
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: string;
  exitPrice: string;
  stopPrice: string;
  shares: string;
  fees: string;
  entryAt: string;
  exitAt: string;
  notes: string;
};

const initialState: TradeFormState = {};

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2";

function toISOString(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value === "") return "";
  return new Date(value).toISOString();
}

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-sm text-red-400">{messages[0]}</p>;
}

export function TradeForm({
  title,
  submitLabel,
  pendingLabel,
  action,
  resetOnSuccess = false,
  defaults,
}: TradeFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && resetOnSuccess) {
      formRef.current?.reset();
    }
  }, [state, resetOnSuccess]);

  useEffect(() => {
    const form = formRef.current;
    if (!form || !defaults) return;
    (form.elements.namedItem("entryAt") as HTMLInputElement).value =
      toLocalInputValue(defaults.entryAt);
    (form.elements.namedItem("exitAt") as HTMLInputElement).value =
      toLocalInputValue(defaults.exitAt);
  }, [defaults]);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("entryAt", toISOString(formData.get("entryAt")));
    formData.set("exitAt", toISOString(formData.get("exitAt")));
    startTransition(() => formAction(formData));
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl border border-zinc-800 p-6"
    >
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm">Symbol</span>
          <input
            name="symbol"
            type="text"
            placeholder="AAPL"
            defaultValue={defaults?.symbol}
            className={inputClass}
          />
          <FieldError messages={state.errors?.symbol} />
        </label>

        <label className="block">
          <span className="text-sm">Side</span>
          <select name="side" defaultValue={defaults?.side ?? "LONG"} className={inputClass}>
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
          <FieldError messages={state.errors?.side} />
        </label>

        <label className="block">
          <span className="text-sm">Entry price ($)</span>
          <input
            name="entryPrice"
            type="number"
            step="0.0001"
            min="0"
            defaultValue={defaults?.entryPrice}
            className={inputClass}
          />
          <FieldError messages={state.errors?.entryPrice} />
        </label>

        <label className="block">
          <span className="text-sm">Exit price ($)</span>
          <input
            name="exitPrice"
            type="number"
            step="0.0001"
            min="0"
            defaultValue={defaults?.exitPrice}
            className={inputClass}
          />
          <FieldError messages={state.errors?.exitPrice} />
        </label>

        <label className="block">
          <span className="text-sm">Stop price ($, optional)</span>
          <input
            name="stopPrice"
            type="number"
            step="0.0001"
            min="0"
            defaultValue={defaults?.stopPrice}
            className={inputClass}
          />
          <FieldError messages={state.errors?.stopPrice} />
        </label>

        <label className="block">
          <span className="text-sm">Shares</span>
          <input
            name="shares"
            type="number"
            step="1"
            min="1"
            defaultValue={defaults?.shares}
            className={inputClass}
          />
          <FieldError messages={state.errors?.shares} />
        </label>

        <label className="block">
          <span className="text-sm">Fees ($, optional)</span>
          <input
            name="fees"
            type="number"
            step="0.0001"
            min="0"
            defaultValue={defaults?.fees}
            className={inputClass}
          />
          <FieldError messages={state.errors?.fees} />
        </label>

        <div className="hidden sm:block" />

        <label className="block">
          <span className="text-sm">Entry time</span>
          <input name="entryAt" type="datetime-local" className={inputClass} />
          <FieldError messages={state.errors?.entryAt} />
        </label>

        <label className="block">
          <span className="text-sm">Exit time</span>
          <input name="exitAt" type="datetime-local" className={inputClass} />
          <FieldError messages={state.errors?.exitAt} />
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Notes (optional)</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaults?.notes}
          className={inputClass}
        />
        <FieldError messages={state.errors?.notes} />
      </label>

      {state.message && (
        <p
          role="status"
          className={state.success ? "text-sm text-green-400" : "text-sm text-red-400"}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}