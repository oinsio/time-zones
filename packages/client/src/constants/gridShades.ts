// Kept apart from `grid.ts`: only the lazy Grid view uses these, so they stay out of the initial JavaScript chunk (NFR-P1 of keep-location-menu-in-view-and-clear-range-after-share).
// Implements FR5, FR6 of add-grid-hour-cells-and-hour-frame (D6): the shadows of an hour cell.
/** A spread wider than any cell, so the midnight shade fills it. */
export const MIDNIGHT_SHADE_SPREAD_PX = 999;
export const OFFSET_EDGE_WIDTH_PX = 3;
