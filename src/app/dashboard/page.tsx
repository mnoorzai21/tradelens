import { AddTradeForm } from "./add-trade-form";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";
import { prisma } from "@/lib/prisma";
import { TradeTable } from "./trade-table";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { exitAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Welcome, {session.user.name}
        </h1>
        <SignOutButton />
      </header>

      <div className="mt-6">
        <AddTradeForm />
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Your trades</h2>
        <TradeTable trades={trades} />
      </section>
    </main>
  );
}