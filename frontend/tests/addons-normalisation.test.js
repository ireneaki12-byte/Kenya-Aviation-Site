import { describe, expect, it } from "vitest";

function toSafeArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value).filter(Boolean);
  }

  if (value) {
    return [value];
  }

  return [];
}

describe("add-ons normalisation", () => {
  it("keeps arrays as arrays", () => {
    expect(toSafeArray(["BAG-23", "BAG-32"])).toEqual(["BAG-23", "BAG-32"]);
  });

  it("converts object values into an array", () => {
    expect(
      toSafeArray({
        "adult-1": "BAG-23",
        "adult-2": "BAG-32",
      })
    ).toEqual(["BAG-23", "BAG-32"]);
  });

  it("removes empty object values", () => {
    expect(
      toSafeArray({
        "adult-1": "BAG-23",
        "adult-2": "",
      })
    ).toEqual(["BAG-23"]);
  });

  it("wraps a string as an array", () => {
    expect(toSafeArray("Golf bag")).toEqual(["Golf bag"]);
  });

  it("returns empty array for null or undefined", () => {
    expect(toSafeArray(null)).toEqual([]);
    expect(toSafeArray(undefined)).toEqual([]);
  });
});