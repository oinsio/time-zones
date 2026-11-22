// Verifies NFR-R1, NFR-R2 of add-grid-hour-cells-and-hour-frame (D5).
// Verifies FR17 of redesign-cards-grid-and-day-palettes: 3 px between cells, 38 px cells when the strip scrolls.
// Verifies FR6 of move-meeting-range-and-extend-past-midnight.
import { describe, expect, it } from "vitest";
import { HOUR_CELL_GAP_PX, HOUR_CELL_SCROLL_WIDTH_PX } from "@/constants";
import { getHourCellLayout } from "./hourCellLayout";

describe("getHourCellLayout", () => {
  it.each([
    [1374, 24, 57.25, false],
    [778, 24, 32.416667, false],
    [768, 24, 32, false],
    [778, 25, 41, true],
    [332, 24, 41, true],
    [262, 24, 41, true],
    [400, 24, 41, true],
    [0, 24, 41, true],
    // FR6: a strip tail makes 27 cells (the sample of move-meeting-range-and-extend-past-midnight)
    [864, 27, 32, false],
    [863, 27, 41, true],
  ])(
    "should give a strip of %i px with %i cells the pitch %f, scrollable %s",
    (stripWidthPx, cellCount, pitch, isScrollable) => {
      const layout = getHourCellLayout(stripWidthPx, cellCount);

      expect(layout.cellPitchPx).toBeCloseTo(pitch, 5);
      expect(layout.isScrollable).toBe(isScrollable);
    },
  );

  it("should keep 3 px between cells", () => {
    expect(HOUR_CELL_GAP_PX).toBe(3);
  });

  it.each([100, 332, 767])(
    "should make a scrolling cell %i px of strip wide 38 px without its gap",
    (stripWidthPx) => {
      const { cellPitchPx } = getHourCellLayout(stripWidthPx, 24);

      expect(cellPitchPx - HOUR_CELL_GAP_PX).toBe(HOUR_CELL_SCROLL_WIDTH_PX);
      expect(HOUR_CELL_SCROLL_WIDTH_PX).toBe(38);
    },
  );

  it("should not scroll an empty strip", () => {
    expect(getHourCellLayout(0, 0).isScrollable).toBe(false);
  });
});
