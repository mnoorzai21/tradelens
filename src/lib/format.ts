import type { Prisma } from "@/generated/prisma/client";

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const signedMoneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "exceptZero",
});

const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

const rMultipleFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export function formatPrice(value: Prisma.Decimal): string {
  return priceFormat.format(value.toNumber());
}

export function formatSignedMoney(value: Prisma.Decimal): string {
  return signedMoneyFormat.format(value.toNumber());
}

export function formatPercent(value: number): string {
  return percentFormat.format(value);
}

export function formatR(value: Prisma.Decimal): string {
  return `${rMultipleFormat.format(value.toNumber())}R`;
}

export function toneFor(value: Prisma.Decimal): string {
  if (value.greaterThan(0)) return "text-green-400";
  if (value.lessThan(0)) return "text-red-400";
  return "";
}