import { test, expect } from "@playwright/test";

test("check-in page loads and shows check-in form", async ({ page }) => {
  await page.goto("/checkin");

  await expect(page.locator("body")).toContainText(
    /Prepare for your journey|Check-in details/i
  );

  await expect(page.locator("body")).toContainText(/Booking reference/i);
  await expect(page.locator("body")).toContainText(/Last name/i);
});

test("check-in validates required fields", async ({ page }) => {
  await page.goto("/checkin");

  await expect(page.locator("body")).toContainText(/Check-in details/i);

  const lastName = page.getByLabel(/Last name/i);

  if (await lastName.isEnabled()) {
    await lastName.fill("");
  }

  await page.getByRole("button", { name: /Check in/i }).click();

  await expect(page.locator("body")).toContainText(
    /Please enter your booking reference|Please enter your last name|Booking reference is required|Last name is required/i
  );
});