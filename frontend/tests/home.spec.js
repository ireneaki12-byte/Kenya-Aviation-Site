import { test, expect } from "@playwright/test";

test("home page loads successfully", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/127\.0\.0\.1:5173|localhost:5173/);
  await expect(page.locator("body")).toContainText(
    /Kenya|Aviation|Book|Travel|Flight/i
  );
});

test("home page shows booking and travel assistant options", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toContainText(/Book/i);
  await expect(page.locator("body")).toContainText(
    /Travel Assistant|Assistant|Chat/i
  );
});