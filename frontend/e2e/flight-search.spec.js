import { test, expect } from "@playwright/test";

test("user can open flight search page", async ({ page }) => {
  await page.goto("/search");

  await expect(page.locator("body")).toContainText(
    /Book a flight|Where would you like to go/i
  );

  await expect(
    page.getByRole("button", { name: /Search flights/i })
  ).toBeVisible();
});

test("flight search validates missing or invalid search details", async ({ page }) => {
  await page.goto("/search");

  await expect(page.locator("body")).toContainText(
    /Where would you like to go/i
  );

  await page.getByRole("button", { name: /Search flights/i }).click();

  await expect(page.locator("body")).toContainText(
    /Please select your origin|Please select your destination|Please select your departure date|Origin and destination cannot be the same|Unable to retrieve flights/i
  );
});