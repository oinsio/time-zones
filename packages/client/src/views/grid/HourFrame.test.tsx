// Verifies FR8, FR10 of add-grid-hour-cells-and-hour-frame.
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HourFrame } from "./HourFrame";

describe("HourFrame", () => {
  it("should be hidden from assistive technology, take no pointer events and name its column", () => {
    const { container } = render(
      <ul>
        <HourFrame hourFrameIndex={12} />
      </ul>,
    );

    const frame = container.querySelector("li") as HTMLElement;
    expect(frame).toHaveAttribute("aria-hidden", "true");
    expect(frame).toHaveClass("pointer-events-none", "border-accent");
    expect(frame).toHaveAttribute("data-hour-frame-index", "12");
  });

  it("should lie above the cells and below the header boxes", () => {
    const { container } = render(
      <ul>
        <HourFrame hourFrameIndex={0} />
      </ul>,
    );

    expect(container.querySelector("li")).toHaveClass("z-grid-frame");
  });

  it("should place its left edge by the column", () => {
    const { container } = render(
      <ul>
        <HourFrame hourFrameIndex={5} />
      </ul>,
    );

    expect((container.querySelector("li") as HTMLElement).style.left).toContain(
      "5 *",
    );
  });
});
