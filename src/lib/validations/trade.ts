import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

export const tradeSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(1, "Symbol is required")
      .max(10, "Symbol is too long")
      .transform((value) => value.toUpperCase()),
    side: z.enum(["LONG", "SHORT"], { message: "Choose long or short" }),
    entryPrice: z.coerce.number().positive("Entry price must be greater than 0"),
    exitPrice: z.coerce.number().positive("Exit price must be greater than 0"),
    stopPrice: z.preprocess(
      emptyToUndefined,
      z.coerce.number().positive("Stop price must be greater than 0").optional()
    ),
    shares: z.coerce
      .number()
      .int("Shares must be a whole number")
      .positive("Shares must be greater than 0"),
    fees: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(0, "Fees can't be negative").default(0)
    ),
    entryAt: z.coerce.date({ message: "Enter a valid entry time" }),
    exitAt: z.coerce.date({ message: "Enter a valid exit time" }),
    notes: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(2000, "Notes are too long").optional()
    ),
    setup: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(50, "Setup name is too long").optional()
    ),
  })
  .refine((trade) => trade.exitAt >= trade.entryAt, {
    message: "Exit time must be after entry time",
    path: ["exitAt"],
  });

export type TradeInput = z.infer<typeof tradeSchema>;