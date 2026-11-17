"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTradesCsv, type CsvRowError } from "@/lib/csv-import";
import { tradeDedupeHash } from "@/lib/trade-hash";

export type ImportState =
  | { status: "idle" }
  | { status: "error"; message: string; rowErrors: CsvRowError[] }
  | { status: "success"; imported: number; skipped: number };

const MAX_FILE_BYTES = 1024 * 1024; // 1 MB

function fail(message: string, rowErrors: CsvRowError[] = []): ImportState {
  return { status: "error", message, rowErrors };
}

export async function importTrades(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return fail("Please sign in again.");
  }
  if (session.user.isDemo) {
    return fail(
      "The demo account is read-only. Create a free account to import your own trades."
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Choose a CSV file to import.");
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return fail("The file must be a .csv file.");
  }
  if (file.size > MAX_FILE_BYTES) {
    return fail("The file is too large. The limit is 1 MB.");
  }

  const { trades, errors } = parseTradesCsv(await file.text());
  if (errors.length > 0) {
    const rows = errors.length === 1 ? "1 row" : `${errors.length} rows`;
    return fail(`Nothing was imported. Fix ${rows} and upload the file again.`, errors);
  }
  if (trades.length === 0) {
    return fail("The file has no trades.");
  }

  const userId = session.user.id;

  // Skip duplicates inside the file, then trades that already exist
  const byHash = new Map(trades.map((trade) => [tradeDedupeHash(trade), trade]));
  const existing = await prisma.trade.findMany({
    where: { userId, dedupeHash: { in: [...byHash.keys()] } },
    select: { dedupeHash: true },
  });
  for (const { dedupeHash } of existing) {
    if (dedupeHash) {
      byHash.delete(dedupeHash);
    }
  }

  const newTrades = [...byHash.entries()];
  const skipped = trades.length - newTrades.length;
  if (newTrades.length === 0) {
    return { status: "success", imported: 0, skipped };
  }

  // All or nothing: if any insert fails, the whole import is rolled back
  await prisma.$transaction(
    async (tx) => {
      const record = await tx.import.create({
        data: {
          userId,
          broker: "tradelens",
          filename: file.name.slice(0, 255),
          rowCount: trades.length,
        },
        select: { id: true },
      });

      const setupIds = new Map<string, string>();
      for (const [, trade] of newTrades) {
        if (trade.setup && !setupIds.has(trade.setup)) {
          const setup = await tx.setup.upsert({
            where: { userId_name: { userId, name: trade.setup } },
            update: {},
            create: { userId, name: trade.setup },
            select: { id: true },
          });
          setupIds.set(trade.setup, setup.id);
        }
      }

      for (const [dedupeHash, trade] of newTrades) {
        await tx.trade.create({
          data: {
            userId,
            importId: record.id,
            dedupeHash,
            symbol: trade.symbol,
            side: trade.side,
            entryPrice: trade.entryPrice,
            exitPrice: trade.exitPrice,
            stopPrice: trade.stopPrice,
            shares: trade.shares,
            fees: trade.fees,
            entryAt: trade.entryAt,
            exitAt: trade.exitAt,
            notes: trade.notes,
            setupId: trade.setup ? setupIds.get(trade.setup) : undefined,
            tags: {
              connectOrCreate: [...new Set(trade.tags)].map((name) => ({
                where: { userId_name: { userId, name } },
                create: { userId, name },
              })),
            },
          },
        });
      }
    },
    { timeout: 60_000 }
  );

  revalidatePath("/dashboard");
  return { status: "success", imported: newTrades.length, skipped };
}