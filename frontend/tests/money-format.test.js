import { describe, expect, it } from "vitest";

function money(amount) {
  return `KES ${Number(amount || 0).toLocaleString("en-KE")}`;
}

describe("money formatter", () => {
  it("formats whole numbers as Kenya Shillings", () => {
    expect(money(10500)).toBe("KES 10,500");
  });

  it("formats zero safely", () => {
    expect(money(0)).toBe("KES 0");
  });

  it("handles missing amount safely", () => {
    expect(money()).toBe("KES 0");
  });
});