import { test, expect } from "@playwright/test";

test("booking flow pages are reachable", async ({ page }) => {
  const pages = [
    { url: "/search", text: /Book a flight|Where would you like to go/i },
    { url: "/results", text: /Choose your flight|Flight selection|available flights/i },
    { url: "/passengers", text: /Passenger details|Tell us who is travelling/i },
    { url: "/addons", text: /Add-on services|Seat selection|Baggage/i },
    { url: "/summary", text: /Booking summary|Review before payment|Price summary/i },
    { url: "/payment", text: /Payment|Complete your payment/i },
    { url: "/confirmation", text: /Booking confirmed|Your journey is confirmed/i },
  ];

  for (const item of pages) {
    await page.goto(item.url);
    await expect(page.locator("body")).toContainText(item.text);
  }
});