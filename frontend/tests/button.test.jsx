import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../src/components/common/Button.jsx";

describe("Button component", () => {
  it("renders button text", () => {
    render(<Button>Continue</Button>);

    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Search flights</Button>);

    await user.click(screen.getByRole("button", { name: /search flights/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("supports secondary variant", () => {
    render(<Button variant="secondary">Back</Button>);

    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });
});