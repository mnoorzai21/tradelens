import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";
import { prisma } from "@/lib/prisma";
import { TradeTable } from "./trade-table";
import { TradeForm } from "./trade-form";
import { addTrade } from "./actions";
import { calculateStats } from "@/lib/stats";
import { calculateMaxDrawdown } from "@/lib/drawdown";
import { calculateStatsBySetup } from "@/lib/setup-stats";
import { SetupStatsTable } from "./setup-stats-table";
import { calculateStatsByTag } from "@/lib/tag-stats";
import { MistakeStatsTable } from "./mistake-stats-table";
import { StatsCards } from "./stats-cards";


export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const isDemo = session.user.isDemo;

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { exitAt: "desc" },
    take: 50,
    include: { setup: { select: { name: true } } },
  });

  const statsTrades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    select: {
      side: true,
      entryPrice: true,
      exitPrice: true,
      shares: true,
      fees: true,
      stopPrice: true,
      exitAt: true,
      setup: { select: { name: true } },
      tags: { select: { name: true } },
      symbol: true,
    },
  });
  const stats = calculateStats(statsTrades);
  const maxDrawdown = calculateMaxDrawdown(statsTrades);
  const setupStats = calculateStatsBySetup(statsTrades);
  const mistakeStats = calculateStatsByTag(statsTrades);
  const setups = await prisma.setup.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Welcome, {session.user.name}
        </h1>
        <SignOutButton />
      </header>
      {isDemo && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-200"
        >
          You&apos;re viewing a read-only demo with sample trades.{" "}
          <Link href="/sign-up" className="font-medium underline">
            Create a free account
          </Link>{" "}
          to log your own trades.
        </div>
      )}
       <section className="mt-6" aria-label="Performance summary">
        <StatsCards stats={stats} maxDrawdown={maxDrawdown} />
      </section>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">By setup</h2>
        <SetupStatsTable groups={setupStats} />
      </section>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Mistakes</h2>
        <MistakeStatsTable groups={mistakeStats} />
      </section>
      {!isDemo && (
        <div className="mt-6">
          <TradeForm
            title="Add a trade"
            submitLabel="Save trade"
            pendingLabel="Saving..."
            action={addTrade}
            setupOptions={setups.map((setup) => setup.name)}
            resetOnSuccess
          />
        </div>
      )}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Your trades</h2>
        <TradeTable trades={trades} readOnly={isDemo} />
      </section>
    </main>
  );
}