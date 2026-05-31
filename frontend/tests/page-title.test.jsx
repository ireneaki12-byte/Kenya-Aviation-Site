import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PageTitle from "../src/components/common/PageTitle.jsx";

describe("PageTitle component", () => {
  it("renders eyebrow, title and text", () => {
    render(
      <PageTitle
        eyebrow="Passenger details"
        title="Tell us who is travelling"
        text="Enter passenger and contact details exactly as they should appear on the booking."
      />
    );

    expect(screen.getByText(/passenger details/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /tell us who is travelling/i })).toBeInTheDocument();
    expect(screen.getByText(/enter passenger and contact details/i)).toBeInTheDocument();
  });
});