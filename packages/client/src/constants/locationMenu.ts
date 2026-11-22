// Kept apart from `grid.ts`: only the lazy views use these, so they stay out of the initial JavaScript chunk (NFR-P1).
// Implements FR1 of add-grid-hour-cells-and-hour-frame (D5): the location menu of a grid row.
/** The gap between a location menu button and its open menu. */
export const LOCATION_MENU_OFFSET_PX = 4;
/**
 * The gap between an open location menu and the edge of the viewport.
 * Implements FR1, NFR-P1 of keep-location-menu-in-view-and-clear-range-after-share (D1).
 */
export const LOCATION_MENU_VIEWPORT_MARGIN_PX = 4;
