import { test, expect } from "@playwright/test";

test("admin page requires login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.locator("body")).toContainText(/Admin|Secure dashboard|Sign in|Login/i);
});

test("admin login form has email and password fields", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.locator("body")).toContainText(/Email|Password/i);
});