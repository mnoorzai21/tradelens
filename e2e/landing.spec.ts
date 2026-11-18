import { expect, test } from "@playwright/test";

test("the landing page explains the app and offers the demo", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/TradeLens/);
  await expect(page.getByRole("heading", { level: 1, name: "TradeLens" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try the demo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});