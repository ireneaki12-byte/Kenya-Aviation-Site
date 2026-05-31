import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../apiClient", () => ({ getBookingQuote: vi.fn() }));
import { getBookingQuote } from "../apiClient";
import { fetchQuote } from "../pricingService.js";

describe("pricingService.fetchQuote", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps passenger details into category counts for the backend", async () => {
    getBookingQuote.mockResolvedValue({ total: 9800 });
    await fetchQuote({
      selectedFlight: { id: "FL-101" },
      selectedFare: { id: "fare-plus" },
      passengerDetails: [{ category: "adult" }, { category: "adult" }, { category: "infant" }],
      addons: { seat: "4A" },
    });
    expect(getBookingQuote).toHaveBeenCalledWith({
      flight_id: "FL-101",
      fare_type: "fare-plus",
      passengers: { adult: 2, child: 0, infant: 1, unmr: 0 },
      addons: { seat: "4A" },
    });
  });
});
