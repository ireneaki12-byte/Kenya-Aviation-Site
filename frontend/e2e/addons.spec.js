import { test, expect } from "@playwright/test";

test("add-ons page displays seat, baggage, meals and summary sections", async ({ page }) => {
  await page.goto("/addons");

  await expect(page.locator("body")).toContainText(/Seat selection/i);
  await expect(page.locator("body")).toContainText(/Baggage|baggage/i);
  await expect(page.locator("body")).toContainText(/Meal|meals|Assistance/i);
  await expect(page.locator("body")).toContainText(/Selected add-ons/i);
});

test("add-ons page has review booking action", async ({ page }) => {
  await page.goto("/addons");

  await expect(page.getByRole("button", { name: /Review booking/i })).toBeVisible();
});