// Implements FR1, FR2, FR12 of add-grid-hour-cells-and-hour-frame (D1, D5).
/** The span of one hour cell of the Grid view. */
export const HOUR_CELL_DURATION = { hours: 1 } as const;
/** A cell this wide or wider fits all hours of the reference day without scrolling. */
export const MIN_FITTING_HOUR_CELL_PX = 32;
/** The cells a narrow strip shows at once. */
export const NARROW_VISIBLE_HOUR_CELLS = 9;
export const NARROW_HOUR_CELL_MIN_PX = 36;
export const NARROW_HOUR_CELL_MAX_PX = 40;
/** The gap between hour cells; the cell pitch includes it. */
export const HOUR_CELL_GAP_PX = 2;
// Implements FR3, FR5 of add-grid-hour-cells-and-hour-frame (D2).
/** Separates the hour from the minutes in an hour cell label. */
export const HOUR_CELL_MINUTE_SEPARATOR = ":";
export const HOUR_CELL_MINUTE_DIGITS = 2;
/** The full stop some languages write after a short month name. */
export const SHORT_MONTH_TRAILING_STOP = /\.$/u;
