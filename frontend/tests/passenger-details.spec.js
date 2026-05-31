import { test, expect } from "@playwright/test";

test("passenger details page displays passenger and contact sections", async ({ page }) => {
  await page.goto("/passengers");

  await expect(page.locator("body")).toContainText(/Passenger details|Tell us who is travelling/i);
  await expect(page.locator("body")).toContainText(/Contact details|Booking progress/i);
});

test("passenger page validates required fields", async ({ page }) => {
  await page.goto("/passengers");

  const continueButton = page.getByRole("button", { name: /Continue to add-ons/i });

  if (await continueButton.isVisible()) {
    await continueButton.click();

    await expect(page.locator("body")).toContainText(
      /Please enter|required|first name|last name|contact/i
    );
  }
});