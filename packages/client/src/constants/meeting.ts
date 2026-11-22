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

// Implements FR7, FR8 of refine-meeting-range-entry-and-handles (D5, D8).
/** The height of a meeting handle (`h-12`); a handle centred on a strip must fit on screen. */
export const MEETING_HANDLE_HEIGHT_PX = 48;
/** After a handle drag ends, a click within this time is the release, not a tap. */
export const MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS = 50;

/** Joins the zone parts inside the brackets of a meeting share line. Implements FR6 of add-meeting-share-dialog (D2). */
export const MEETING_SHARE_ZONE_PARTS_SEPARATOR = ", ";

// Implements FR1, FR4 of move-meeting-range-and-extend-past-midnight (D1).
/** The longest meeting range: 24 hours, which may end in the next reference day. */
export const MEETING_RANGE_MAX_MINUTES = 1440;

// Implements FR15, FR16, FR17, FR19, UX1, UX2 of move-meeting-range-and-extend-past-midnight (D7, D8, D11).
/** The border of the meeting frame (`border-[3px]`): the axis of its top line lies half of it below its top. */
export const MEETING_FRAME_BORDER_PX = 3;
/** The line at the bottom of the meeting bar (`border-b`): the move handle rests on its axis. */
export const MEETING_BAR_LINE_PX = 1;
/** The locator of the meeting frame in the panel. */
export const MEETING_FRAME_SELECTOR = "[data-meeting-frame-columns]";
/** The CSS variables that carry the centre of the fixed move handle. */
export const MoveHandleCssVariable = {
  CENTRE_X: "--move-handle-x",
  CENTRE_Y: "--move-handle-y",
} as const;
