/** Most results a city search returns. */
export const MAX_SEARCH_RESULTS = 50;

/** IANA identifier of the universal zone, which the browser's zone list omits. */
export const UTC_ZONE_ID = "UTC";

/** `Intl.DisplayNames` type that resolves country names. */
export const REGION_DISPLAY_TYPE = "region";

/** `Intl.DisplayNames` fallback: unknown regions resolve to undefined. */
export const REGION_DISPLAY_FALLBACK = "none";

/** Suggestions shown before the user types, in display order. */
export const POPULAR_TIME_ZONE_IDS: readonly string[] = [
  UTC_ZONE_ID,
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Almaty",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
];
