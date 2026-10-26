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
