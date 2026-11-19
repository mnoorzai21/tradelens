import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signInAsDemo } from "./sign-in/actions";

const FEATURES = [
  "P/L, win rate, expectancy, R-multiples and max drawdown, with exact decimal math",
  "Stats by setup, and what each trading mistake costs you",
  "An equity curve and P/L by day",
  "Filters by symbol, setup, mistake and date",
  "Import your trades from a CSV file",
];

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight">TradeLens</h1>
        <p className="text-lg text-neutral-400">
          A trading journal for day traders. Log your trades and see what
          actually makes you money.
        </p>
      </div>

      <ul className="flex flex-col gap-2 text-neutral-300">
        {FEATURES.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="text-green-500">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <form action={signInAsDemo}>
          <button
            type="submit"
            className="rounded-lg bg-white px-5 py-2.5 font-medium text-black hover:bg-neutral-200"
          >
            Try the demo
          </button>
        </form>
        <Link
          href="/sign-in"
          className="rounded-lg border border-neutral-700 px-5 py-2.5 font-medium hover:bg-neutral-900"
        >
          Sign in
        </Link>
      </div>

      <p className="text-sm text-neutral-500">
        New here?{" "}
        <Link href="/sign-up" className="underline hover:text-neutral-300">
          Create a free account
        </Link>
      </p>
    </main>
  );
}