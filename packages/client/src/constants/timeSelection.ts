// Implements FR3, FR4, FR7 of add-time-sliders-to-location-cards (D2, D7).
export const TRACK_STEP_MINUTES = 15;
export const TRACK_HOUR_MOVE_MINUTES = 60;
export const HOUR_LABEL_INTERVAL_HOURS = 6;
export const TRACK_TOUCH_SLOP_PX = 10;
export const GRADIENT_PERCENT_DIGITS = 4;
export const PERCENT_PER_FRACTION = 100;
export const TOUCH_POINTER_TYPE = "touch";
export const MIN_TRACK_FRACTION = 0;
export const MAX_TRACK_FRACTION = 1;
export const TRACK_VALUE_MIN_MINUTES = 0;
// Implements FR1 of fix-day-track-handle-overlap-and-end-of-day (D1).
/** The track end lies this many minutes before the end of the reference day. */
export const TRACK_END_BEFORE_DAY_END_MINUTES = 1;
/** Offset changes move local time by less than this; bounds the boundary search. */
export const OFFSET_CHANGE_MARGIN_HOURS = 3;
// Implements FR1 of show-clock-change-note-on-location-cards (D1).
/** The clock change window reaches this many days before and after the reference date. */
export const CLOCK_CHANGE_WINDOW_DAYS = 7;

// Implements FR1, FR2, FR4 of fix-day-track-drag-continuity-and-smoothness (D1, D3, D4).
export enum TrackTouchEvent {
  START = "touchstart",
  MOVE = "touchmove",
  END = "touchend",
  CANCEL = "touchcancel",
}
/** A touchstart listener that never cancels the browser's scroll. */
export const TRACK_TOUCH_START_LISTENER_OPTIONS: AddEventListenerOptions = {
  passive: true,
};
/** A touchmove listener that may cancel the browser's scroll. */
export const TRACK_TOUCH_MOVE_LISTENER_OPTIONS: AddEventListenerOptions = {
  passive: false,
};

// Implements FR2 of add-wall-time-input-with-hint (D1, D3).
/** Accepted typed texts: `H`, `HH`; `H:MM`, `HH:MM`, `H.MM`, `HH.MM`; `HMM`, `HHMM`. */
export const WALL_TIME_INPUT_PATTERNS: readonly RegExp[] = [
  /^(?<hour>\d{1,2})$/,
  /^(?<hour>\d{1,2})[:.](?<minute>\d{2})$/,
  /^(?<hour>\d{1,2})(?<minute>\d{2})$/,
];
export const MAX_WALL_TIME_HOUR = 23;
export const MAX_WALL_TIME_MINUTE = 59;
/** The canonical `HH:MM` shape of the `SET_WALL_TIME` command. */
export const WALL_TIME_COMMAND_PATTERN = /^(?<hour>\d{2}):(?<minute>\d{2})$/;

// Implements FR6 of add-settings-page-and-device-time-location (D9).
/** Accepted typed 12-hour texts: `H`, `H:MM` or `H.MM` followed by a day-period marker. */
export const TWELVE_HOUR_WALL_TIME_PATTERN =
  /^(?<hour>\d{1,2})(?:[:.](?<minute>\d{2}))?\s?(?<marker>[^\d\s:.]+)$/u;
export const MIN_TWELVE_HOUR = 1;
export const MAX_TWELVE_HOUR = 12;
/** The 12-hour clock hour that is 0 after midnight and 12 after noon. */
export const TWELVE_HOUR_WRAP = 12;
/** The day-period markers every language accepts next to its own. */
export const UNIVERSAL_DAY_PERIOD_MARKERS = { am: "am", pm: "pm" } as const;
