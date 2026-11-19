import {
  HOUR_CELL_GAP_PX,
  HOUR_CELL_SCROLL_WIDTH_PX,
  MIN_FITTING_HOUR_CELL_PX,
} from "@/constants";

/**
 * Width of the hour cells of the Grid view: the day shared out equally while
 * each cell is at least 32 px, else a scrolling strip of cells 38 px wide.
 * The pitch includes the gap between cells.
 * Implements NFR-R1, NFR-R2 of add-grid-hour-cells-and-hour-frame (D5).
 * Implements FR17 of redesign-cards-grid-and-day-palettes (D5): the scrolling cell is 38 px wide.
 */
export type HourCellLayout = {
  cellPitchPx: number;
  isScrollable: boolean;
};

export function getHourCellLayout(
  stripWidthPx: number,
  cellCount: number,
): HourCellLayout {
  const sharedPitchPx = cellCount === 0 ? 0 : stripWidthPx / cellCount;
  if (sharedPitchPx >= MIN_FITTING_HOUR_CELL_PX || cellCount === 0) {
    return { cellPitchPx: sharedPitchPx, isScrollable: false };
  }
  return {
    cellPitchPx: HOUR_CELL_SCROLL_WIDTH_PX + HOUR_CELL_GAP_PX,
    isScrollable: true,
  };
}
