import { describe, expect, it } from "vitest";

function validatePassengers(passengers) {
  const adult = Number(passengers.adult || 0);
  const child = Number(passengers.child || 0);
  const infant = Number(passengers.infant || 0);
  const unmr = Number(passengers.unmr || 0);

  if (infant > 0 && adult < 1) {
    return "An infant cannot travel without an adult on the booking.";
  }

  if (infant > adult) {
    return "The number of infants cannot exceed the number of adults.";
  }

  if (adult + child < 1 && unmr < 1) {
    return "Please add at least one adult passenger or one child travelling alone.";
  }

  if (adult + child > 9) {
    return "Adults and children cannot exceed 9 passengers on one booking.";
  }

  return "";
}

describe("passenger validation rules", () => {
  it("allows one adult passenger", () => {
    const result = validatePassengers({
      adult: 1,
      child: 0,
      infant: 0,
      unmr: 0,
    });

    expect(result).toBe("");
  });

  it("allows adult with child", () => {
    const result = validatePassengers({
      adult: 1,
      child: 1,
      infant: 0,
      unmr: 0,
    });

    expect(result).toBe("");
  });

  it("allows unaccompanied minor without adult", () => {
    const result = validatePassengers({
      adult: 0,
      child: 0,
      infant: 0,
      unmr: 1,
    });

    expect(result).toBe("");
  });

  it("rejects infant without adult", () => {
    const result = validatePassengers({
      adult: 0,
      child: 0,
      infant: 1,
      unmr: 0,
    });

    expect(result).toMatch(/infant cannot travel without an adult/i);
  });

  it("rejects more infants than adults", () => {
    const result = validatePassengers({
      adult: 1,
      child: 0,
      infant: 2,
      unmr: 0,
    });

    expect(result).toMatch(/infants cannot exceed/i);
  });

  it("rejects no adult, no child and no unaccompanied minor", () => {
    const result = validatePassengers({
      adult: 0,
      child: 0,
      infant: 0,
      unmr: 0,
    });

    expect(result).toMatch(/at least one adult passenger/i);
  });

  it("rejects more than 9 adults and children", () => {
    const result = validatePassengers({
      adult: 6,
      child: 4,
      infant: 0,
      unmr: 0,
    });

    expect(result).toMatch(/cannot exceed 9/i);
  });

  it("does not count infants towards the adult and child limit", () => {
    const result = validatePassengers({
      adult: 5,
      child: 4,
      infant: 1,
      unmr: 0,
    });

    expect(result).toBe("");
  });

  it("handles missing passenger values safely", () => {
    const result = validatePassengers({});

    expect(result).toMatch(/at least one adult passenger/i);
  });
});