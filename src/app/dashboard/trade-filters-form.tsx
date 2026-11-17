import Form from "next/form";
import Link from "next/link";
import { NO_MISTAKES, type TradeFilters } from "@/lib/trade-filters";
import { MISTAKE_TAGS } from "@/lib/mistake-tags";

type Props = {
  filters: TradeFilters;
  setupOptions: string[];
};

export function TradeFiltersForm({ filters, setupOptions }: Props) {
  const isFiltered = Boolean(
    filters.symbol || filters.setup || filters.mistake || filters.from || filters.to
  );

  return (
    <Form
      // A new key resets the inputs when the filters change, for example after "Clear"
      key={JSON.stringify(filters)}
      action="/dashboard"
      className="mt-6 flex flex-wrap items-end gap-3"
      aria-label="Filter trades"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-400">Symbol</span>
        <input
          name="symbol"
          defaultValue={filters.symbol ?? ""}
          placeholder="All symbols"
          className="w-36 rounded-lg border border-neutral-700 bg-transparent px-3 py-2 uppercase placeholder:normal-case"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-400">Setup</span>
        <select
          name="setup"
          defaultValue={filters.setup ?? ""}
          className="w-44 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
        >
          <option value="">All setups</option>
          {setupOptions.map((setup) => (
            <option key={setup} value={setup}>
              {setup}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-400">Mistake</span>
        <select
          name="mistake"
          defaultValue={filters.mistake ?? ""}
          className="w-44 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
        >
          <option value="">All trades</option>
          <option value={NO_MISTAKES}>No mistakes</option>
          {MISTAKE_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-400">From</span>
        <input
          type="date"
          name="from"
          defaultValue={filters.from ?? ""}
          className="rounded-lg border border-neutral-700 bg-transparent px-3 py-2 [color-scheme:dark]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-400">To</span>
        <input
          type="date"
          name="to"
          defaultValue={filters.to ?? ""}
          className="rounded-lg border border-neutral-700 bg-transparent px-3 py-2 [color-scheme:dark]"
        />
      </label>

      <button
        type="submit"
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
      >
        Apply
      </button>

      {isFiltered && (
        <Link
          href="/dashboard"
          className="px-2 py-2 text-sm text-neutral-400 underline hover:text-neutral-200"
        >
          Clear filters
        </Link>
      )}
    </Form>
  );
}