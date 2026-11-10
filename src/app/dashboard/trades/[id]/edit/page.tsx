import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TradeForm } from "../../../trade-form";
import { updateTrade } from "../../../actions";

export default async function EditTradePage(
  props: PageProps<"/dashboard/trades/[id]/edit">
) {
  const { id } = await props.params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const trade = await prisma.trade.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!trade) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-400 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-6">
        <TradeForm
          title={`Edit ${trade.symbol} trade`}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          action={updateTrade.bind(null, trade.id)}
          defaults={{
            symbol: trade.symbol,
            side: trade.side,
            entryPrice: trade.entryPrice.toString(),
            exitPrice: trade.exitPrice.toString(),
            stopPrice: trade.stopPrice?.toString() ?? "",
            shares: String(trade.shares),
            fees: trade.fees.toString(),
            entryAt: trade.entryAt.toISOString(),
            exitAt: trade.exitAt.toISOString(),
            notes: trade.notes ?? "",
          }}
        />
      </div>
    </main>
  );
}