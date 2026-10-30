// Verifies FR1 of fix-day-track-drag-continuity-and-smoothness.
import { describe, expect, it } from "vitest";
import { getPointerTrackFraction } from "./dayTrackPointer";

const BAR_BOX = { left: 100, width: 400 };

describe("getPointerTrackFraction", () => {
  it.each([
    [300, 0.5],
    [50, 0],
    [900, 1],
  ])("should map clientX %i to the fraction %f", (clientX, expected) => {
    expect(getPointerTrackFraction(clientX, BAR_BOX)).toBe(expected);
  });

  it("should return null for a bar without width", () => {
    expect(getPointerTrackFraction(300, { left: 100, width: 0 })).toBeNull();
  });
});
