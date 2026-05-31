import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressSteps from "../src/components/common/ProgressSteps.jsx";

describe("ProgressSteps component", () => {
  it("renders booking progress steps", () => {
    render(<ProgressSteps current={2} />);

    expect(screen.getByText(/^Search$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Flights$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Passenger$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Add-ons$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Summary$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Payment$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Confirm$/i)).toBeInTheDocument();
  });

  it("renders without crashing when current step changes", () => {
    const { rerender } = render(<ProgressSteps current={1} />);

    expect(screen.getByText(/^Search$/i)).toBeInTheDocument();

    rerender(<ProgressSteps current={4} />);

    expect(screen.getByText(/^Summary$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Payment$/i)).toBeInTheDocument();
  });
});