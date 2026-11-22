// Implements FR1, FR2, FR12 of add-grid-hour-cells-and-hour-frame (D1, D5).
/** The span of one hour cell of the Grid view. */
export const HOUR_CELL_DURATION = { hours: 1 } as const;
/** A cell this wide or wider fits all hours of the reference day without scrolling. */
export const MIN_FITTING_HOUR_CELL_PX = 32;
/**
 * The width of an hour cell of a scrolling strip, at any strip width.
 * Implements FR17 of redesign-cards-grid-and-day-palettes (D5).
 */
export const HOUR_CELL_SCROLL_WIDTH_PX = 38;
/** The gap between hour cells; the cell pitch includes it. Implements FR17 of redesign-cards-grid-and-day-palettes (D5). */
export const HOUR_CELL_GAP_PX = 3;
// Implements FR3, FR5 of add-grid-hour-cells-and-hour-frame (D2).
/** Separates the hour from the minutes in an hour cell label. */
export const HOUR_CELL_MINUTE_SEPARATOR = ":";
export const HOUR_CELL_MINUTE_DIGITS = 2;
/** The full stop some languages write after a short month name. */
export const SHORT_MONTH_TRAILING_STOP = /\.$/u;
// Implements FR1, NFR-R2 of add-grid-hour-cells-and-hour-frame (D5): the hour grid layout variables.
/** The horizontal padding of a grid row; the hour strip fills the panel minus twice this. */
export const GRID_ROW_PADDING_PX = 16;
export enum HourGridCssVariable {
  PANEL_WIDTH = "--grid-panel-width",
  ROW_PADDING = "--grid-row-padding",
  CELL_PITCH = "--hour-cell-pitch",
  CELL_COUNT = "--hour-cell-count",
  CELL_GAP = "--hour-cell-gap",
}
