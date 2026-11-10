// Implements FR7, FR8, FR9, FR11, FR14, FR15 of add-grid-meeting-range-and-share (D9).
/** Separates the start from the end of a local meeting span. */
export const MEETING_SPAN_SEPARATOR = "–";
/** Separates the lines of the meeting share text. */
export const MEETING_SHARE_LINE_SEPARATOR = "\n";
/** The `name` of the error a closed system share sheet rejects with. */
export const SHARE_ABORT_ERROR_NAME = "AbortError";
/** A dragged meeting handle this close to the panel's visible edge scrolls the strips. */
export const MEETING_HANDLE_AUTO_SCROLL_EDGE_PX = 32;
/** The strips' scroll per animation frame while a dragged handle is in the edge zone. */
export const MEETING_HANDLE_AUTO_SCROLL_STEP_PX = 8;
/** The class of an hour cell outside the meeting range. */
export const MEETING_DIMMED_OPACITY_CLASS = "opacity-40";
/** The end handle stands on row `⌈rows / divisor⌉`. */
export const MEETING_HANDLE_ROW_DIVISOR = 2;
