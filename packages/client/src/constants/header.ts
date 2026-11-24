/**
 * Size of the Add location and Settings icons in the page header, in px.
 * Implements FR6 of redesign-cards-grid-and-day-palettes (D4).
 */
export const HEADER_ICON_SIZE_PX = 27;

/**
 * The title's size classes with no tool button: 23 px up to 361 px, 27 px above.
 * Implements FR6, UX4 of redesign-cards-grid-and-day-palettes (D4).
 */
export const HEADER_TITLE_CLASS_NAME =
  "text-header-title-narrow font-bold min-[361px]:text-header-title";

/**
 * The title's size classes with a tool button: 20 px up to 337 px, 23 px up to
 * 367 px, 27 px from 368 px. At 320 px 154 px are left beside three 44 px
 * buttons and the Russian title needs 150 px at 20 px.
 * Implements FR4, NFR-R1 of add-unix-time-converter-tool (D2).
 */
export const HEADER_TITLE_WITH_TOOLS_CLASS_NAME =
  "text-header-title-compact font-bold min-[338px]:text-header-title-narrow min-[368px]:text-header-title";

/**
 * The gap between the title and the buttons: 4 px with a tool button, so the
 * Russian title of 204 px at 27 px stays on one line at 368 px, 8 px otherwise.
 * Implements FR4, NFR-R1 of add-unix-time-converter-tool (D2).
 */
export const HEADER_GAP_CLASS_NAME = "gap-2";
export const HEADER_GAP_WITH_TOOLS_CLASS_NAME = "gap-1";
