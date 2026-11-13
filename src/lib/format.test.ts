import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { formatPercent, formatPrice, formatR, formatSignedMoney, toneFor } from "./format";

const d = (value: string) => new Prisma.Decimal(value);

describe("format helpers", () => {
  it("formats prices with 2 to 4 decimals", () => {
    expect(formatPrice(d("358"))).toBe("$358.00");
    expect(formatPrice(d("1.2345"))).toBe("$1.2345");
  });

  it("formats signed money to cents", () => {
    expect(formatSignedMoney(d("1999.964"))).toBe("+$1,999.96");
    expect(formatSignedMoney(d("-1200.05"))).toBe("-$1,200.05");
    expect(formatSignedMoney(d("0"))).toBe("$0.00");
  });

  it("formats percentages with up to one decimal", () => {
    expect(formatPercent(2 / 3)).toBe("66.7%");
    expect(formatPercent(1)).toBe("100%");
  });

  it("formats R-multiples with a sign and an R", () => {
    expect(formatR(d("3"))).toBe("+3R");
    expect(formatR(d("-1"))).toBe("-1R");
    expect(formatR(d("43.9958"))).toBe("+44R");
  });

  it("picks a color for positive, negative and zero values", () => {
    expect(toneFor(d("5"))).toBe("text-green-400");
    expect(toneFor(d("-5"))).toBe("text-red-400");
    expect(toneFor(d("0"))).toBe("");
  });
});