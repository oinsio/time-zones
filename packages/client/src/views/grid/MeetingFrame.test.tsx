// Verifies FR7, UX1 of add-grid-meeting-range-and-share (D6).
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MeetingFrame } from "./MeetingFrame";

const SPAN = {
  startMinutes: 555,
  endMinutes: 660,
  firstColumn: 9,
  lastColumn: 10,
};

const renderFrame = () => {
  const { container } = render(
    <ul>
      <MeetingFrame span={SPAN} />
    </ul>,
  );
  return container.querySelector("li") as HTMLElement;
};

describe("MeetingFrame", () => {
  it("should be hidden from assistive technology and take no pointer events", () => {
    const frame = renderFrame();
    expect(frame).toHaveAttribute("aria-hidden", "true");
    expect(frame).toHaveClass("pointer-events-none");
  });

  it("should be drawn in the meeting colour", () => {
    expect(renderFrame()).toHaveClass("border-meeting");
  });

  it("should lie above the cells and below the header boxes", () => {
    expect(renderFrame()).toHaveClass("z-grid-frame");
  });

  it("should name the columns it encloses", () => {
    expect(renderFrame()).toHaveAttribute("data-meeting-frame-columns", "9-10");
  });

  it("should place its left edge and width by minutes and the cell pitch", () => {
    const frame = renderFrame();
    expect(frame.style.left).toBe(
      "calc(var(--grid-row-padding) + 555 / 60 * var(--hour-cell-pitch))",
    );
    expect(frame.style.width).toBe("calc(105 / 60 * var(--hour-cell-pitch))");
  });
});
