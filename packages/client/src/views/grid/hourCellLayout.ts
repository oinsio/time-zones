import {
  MIN_FITTING_HOUR_CELL_PX,
  NARROW_HOUR_CELL_MAX_PX,
  NARROW_HOUR_CELL_MIN_PX,
  NARROW_VISIBLE_HOUR_CELLS,
} from "@/constants";

/**
 * Width of the hour cells of the Grid view: the day shared out equally while
 * each cell is at least 32 px, else a scrolling strip of about 9 visible
 * cells of 36–40 px. The pitch includes the gap between cells.
 * Implements NFR-R1, NFR-R2 of add-grid-hour-cells-and-hour-frame (D5).
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
    cellPitchPx: Math.min(
      Math.max(
        stripWidthPx / NARROW_VISIBLE_HOUR_CELLS,
        NARROW_HOUR_CELL_MIN_PX,
      ),
      NARROW_HOUR_CELL_MAX_PX,
    ),
    isScrollable: true,
  };
}
