"use client";

import { useActionState, useEffect, useRef, startTransition } from "react";
import { addTrade, type AddTradeState } from "./actions";

const initialState: AddTradeState = {};

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2";

function toISOString(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value === "") return "";
  return new Date(value).toISOString();
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-sm text-red-400">{messages[0]}</p>;
}

export function AddTradeForm() {
  const [state, formAction, pending] = useActionState(addTrade, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
      <h2 className="text-lg font-semibold">Add a trade</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm">Symbol</span>
          <input name="symbol" type="text" placeholder="AAPL" className={inputClass} />
          <FieldError messages={state.errors?.symbol} />
        </label>

        <label className="block">
          <span className="text-sm">Side</span>
          <select name="side" defaultValue="LONG" className={inputClass}>
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
          <FieldError messages={state.errors?.side} />
        </label>

        <label className="block">
          <span className="text-sm">Entry price ($)</span>
          <input name="entryPrice" type="number" step="0.0001" min="0" className={inputClass} />
          <FieldError messages={state.errors?.entryPrice} />
        </label>

        <label className="block">
          <span className="text-sm">Exit price ($)</span>
          <input name="exitPrice" type="number" step="0.0001" min="0" className={inputClass} />
          <FieldError messages={state.errors?.exitPrice} />
        </label>

        <label className="block">
          <span className="text-sm">Stop price ($, optional)</span>
          <input name="stopPrice" type="number" step="0.0001" min="0" className={inputClass} />
          <FieldError messages={state.errors?.stopPrice} />
        </label>

        <label className="block">
          <span className="text-sm">Shares</span>
          <input name="shares" type="number" step="1" min="1" className={inputClass} />
          <FieldError messages={state.errors?.shares} />
        </label>

        <label className="block">
          <span className="text-sm">Fees ($, optional)</span>
          <input name="fees" type="number" step="0.0001" min="0" className={inputClass} />
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
        <textarea name="notes" rows={3} className={inputClass} />
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
        {pending ? "Saving..." : "Save trade"}
      </button>
    </form>
  );
}