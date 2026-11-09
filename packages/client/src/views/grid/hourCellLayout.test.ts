// Verifies NFR-R1, NFR-R2 of add-grid-hour-cells-and-hour-frame (D5).
import { describe, expect, it } from "vitest";
import { getHourCellLayout } from "./hourCellLayout";

describe("getHourCellLayout", () => {
  it.each([
    [1374, 24, 57.25, false],
    [778, 24, 32.416667, false],
    [768, 24, 32, false],
    [778, 25, 40, true],
    [332, 24, 36.888889, true],
    [262, 24, 36, true],
    [400, 24, 40, true],
  ])(
    "should give a strip of %i px with %i cells the pitch %f, scrollable %s",
    (stripWidthPx, cellCount, pitch, isScrollable) => {
      const layout = getHourCellLayout(stripWidthPx, cellCount);

      expect(layout.cellPitchPx).toBeCloseTo(pitch, 5);
      expect(layout.isScrollable).toBe(isScrollable);
    },
  );

  it("should not scroll an empty strip", () => {
    expect(getHourCellLayout(0, 0).isScrollable).toBe(false);
  });
});
