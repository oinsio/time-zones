import { HourFormat } from "@/preferences";

// Implements FR1, FR2 of show-local-time-and-date-on-location-cards (D2).
export const LOCAL_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
};

export const LOCAL_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

// Implements FR7 of add-time-sliders-to-location-cards (D5).
export const HOUR_LABEL_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  hourCycle: "h23",
};

/**
 * Options of the local time label per hour format; H24 keeps the options above.
 * Implements FR5 of add-settings-page-and-device-time-location (D8).
 */
export const LOCAL_TIME_FORMAT_OPTIONS_BY_HOUR_FORMAT: Record<
  HourFormat,
  Intl.DateTimeFormatOptions
> = {
  [HourFormat.H24]: LOCAL_TIME_FORMAT_OPTIONS,
  [HourFormat.H12]: { hour: "numeric", minute: "2-digit", hourCycle: "h12" },
};

/** Options of the hour label of the day track per hour format. */
export const HOUR_LABEL_FORMAT_OPTIONS_BY_HOUR_FORMAT: Record<
  HourFormat,
  Intl.DateTimeFormatOptions
> = {
  [HourFormat.H24]: HOUR_LABEL_FORMAT_OPTIONS,
  [HourFormat.H12]: { hour: "numeric", hourCycle: "h12" },
};
