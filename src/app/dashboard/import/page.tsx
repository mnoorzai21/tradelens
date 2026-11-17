import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MAX_IMPORT_ROWS } from "@/lib/csv-import";
import { ImportForm } from "./import-form";

export const metadata: Metadata = {
  title: "Import trades",
};

export default async function ImportPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  if (session.user.isDemo) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
        ← Back to the dashboard
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Import trades</h1>
        <p className="text-neutral-400">
          Upload a CSV file with one row per trade. Times are in Eastern Time,
          like <code className="text-neutral-200">2026-11-02 09:35</code>.
          Separate several mistakes with a semicolon.
        </p>
        <p className="text-sm text-neutral-500">
          Up to {MAX_IMPORT_ROWS.toLocaleString("en-US")} trades per file. Trades
          that are already in your journal are skipped, so it&apos;s safe to
          upload the same file twice.
        </p>
        <a
          href="/samples/sample-trades.csv"
          download
          className="self-start text-sm underline hover:text-neutral-200"
        >
          Download the sample CSV
        </a>
      </div>

      <ImportForm />
    </main>
  );
}