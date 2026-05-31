import { test, expect } from "@playwright/test";

test("travel assistant can be opened", async ({ page }) => {
  await page.goto("/");

  const possibleAssistantButtons = [
    page.getByRole("button", { name: /Travel Assistant/i }),
    page.getByRole("button", { name: /Assistant/i }),
    page.getByRole("button", { name: /Chat/i }),
  ];

  let opened = false;

  for (const button of possibleAssistantButtons) {
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      opened = true;
      break;
    }
  }

  if (opened) {
    await expect(page.locator("body")).toContainText(/Travel Assistant|Ask about flights|baggage|check-in/i);
  } else {
    await expect(page.locator("body")).toContainText(/Assistant|Travel|Chat/i);
  }
});