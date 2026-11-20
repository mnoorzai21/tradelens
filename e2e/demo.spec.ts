import { expect, test } from "@playwright/test";

test.describe("demo account", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Try the demo" }).click();
    // The first visit can be slow while the dev server compiles the page
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  });

  test("shows the read-only demo dashboard", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Welcome, Demo Trader" })).toBeVisible();
    await expect(page.getByText("read-only demo")).toBeVisible();
    await expect(page.getByText("60 trades", { exact: true })).toBeVisible();
  });

  test("hides the add, import, edit and delete controls", async ({ page }) => {
    await expect(page.getByText("Add a trade")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Import CSV" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
  });

  test("redirects away from the import page", async ({ page }) => {
    await page.goto("/dashboard/import");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("filters by setup", async ({ page }) => {
    await page.getByLabel("Setup").selectOption("Breakout");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page).toHaveURL(/setup=Breakout/);
    await expect(page.getByText("17 trades", { exact: true })).toBeVisible();
  });

  test("explains when filters match no trades", async ({ page }) => {
    await page.getByLabel("Symbol").fill("ZZZZ");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText("No trades match these filters.")).toBeVisible();
  });

  test("fits the screen without scrolling sideways", async ({ page }) => {
    const width = await page.evaluate(() => ({
      screen: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    expect(width.page).toBeLessThanOrEqual(width.screen);
  });

    test("can't change the demo account through the auth API", async ({ page, baseURL }) => {
    // A wrong current password, so even if the guard ever failed,
    // the shared demo password would not actually change
    const response = await page.request.post("/api/auth/change-password", {
      headers: { origin: baseURL! },
      data: { currentPassword: "not-the-password", newPassword: "new-password-123" },
    });

    expect(response.status()).toBe(403);
    expect(await response.text()).toContain("The demo account is read-only.");
  });
});