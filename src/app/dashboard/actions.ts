"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tradeSchema } from "@/lib/validations/trade";
import { redirect } from "next/navigation";

export type TradeFormState = {
  success?: boolean;
  message?: string;
  errors?: Partial<Record<string, string[]>>;
};

export async function addTrade(
  _prevState: TradeFormState,
  formData: FormData
): Promise<TradeFormState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { message: "You must be signed in to add a trade." };
  }

  const parsed = tradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const trade = parsed.data;

  try {
    await prisma.trade.create({
      data: {
        userId: session.user.id,
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
      },
    });
  } catch (error) {
    console.error("Failed to save trade:", error);
    return { message: "Could not save the trade. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Trade saved." };
}

export async function deleteTrade(tradeId: string): Promise<{ ok: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false };
  }

  const result = await prisma.trade.deleteMany({
    where: { id: tradeId, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  return { ok: result.count === 1 };
}

export async function updateTrade(
  tradeId: string,
  _prevState: TradeFormState,
  formData: FormData
): Promise<TradeFormState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { message: "You must be signed in to edit a trade." };
  }

  const parsed = tradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const trade = parsed.data;

  try {
    const result = await prisma.trade.updateMany({
      where: { id: tradeId, userId: session.user.id },
      data: {
        symbol: trade.symbol,
        side: trade.side,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        stopPrice: trade.stopPrice ?? null,
        shares: trade.shares,
        fees: trade.fees,
        entryAt: trade.entryAt,
        exitAt: trade.exitAt,
        notes: trade.notes ?? null,
      },
    });

    if (result.count === 0) {
      return { message: "Trade not found." };
    }
  } catch (error) {
    console.error("Failed to update trade:", error);
    return { message: "Could not update the trade. Please try again." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
