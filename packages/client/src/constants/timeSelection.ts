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
/** Offset changes move local time by less than this; bounds the boundary search. */
export const OFFSET_CHANGE_MARGIN_HOURS = 3;

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
