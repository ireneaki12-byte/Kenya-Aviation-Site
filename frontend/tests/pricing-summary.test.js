import { describe, expect, it } from "vitest";

function calculateQuote({
  baseFare,
  adults = 0,
  children = 0,
  infants = 0,
  taxPerPassenger = 2000,
  addonTotal = 0,
}) {
  const fullFarePassengers = adults + children;
  const fullPassengerFare = fullFarePassengers * baseFare;
  const infantFare = infants * baseFare * 0.1;
  const taxes = (fullFarePassengers + infants) * taxPerPassenger;

  return {
    fullPassengerFare,
    infantFare,
    taxes,
    addonTotal,
    total: fullPassengerFare + infantFare + taxes + addonTotal,
  };
}

describe("pricing summary calculation", () => {
  it("calculates fare for one adult", () => {
    const quote = calculateQuote({
      baseFare: 10000,
      adults: 1,
    });

    expect(quote.fullPassengerFare).toBe(10000);
    expect(quote.taxes).toBe(2000);
    expect(quote.total).toBe(12000);
  });

  it("adds fare for additional adult passenger", () => {
    const quote = calculateQuote({
      baseFare: 10000,
      adults: 2,
    });

    expect(quote.fullPassengerFare).toBe(20000);
    expect(quote.taxes).toBe(4000);
    expect(quote.total).toBe(24000);
  });

  it("charges infant fare at 10 percent of adult fare", () => {
    const quote = calculateQuote({
      baseFare: 10000,
      adults: 1,
      infants: 1,
    });

    expect(quote.infantFare).toBe(1000);
    expect(quote.taxes).toBe(4000);
    expect(quote.total).toBe(15000);
  });

  it("adds ancillary/add-on fees to total", () => {
    const quote = calculateQuote({
      baseFare: 10000,
      adults: 1,
      addonTotal: 3500,
    });

    expect(quote.total).toBe(15500);
  });
});