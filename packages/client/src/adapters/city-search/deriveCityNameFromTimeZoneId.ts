const ZONE_ID_SEPARATOR = "/";
const UNDERSCORES = /_/g;

/**
 * The city name a time zone ID stands for when the CLDR data has none: its
 * last segment, underscores as spaces (`America/New_York` → `New York`).
 * Implements FR8 of show-here-entry-for-device-time (D3); moved from the zone
 * cities source of add-locations-via-search.
 */
export function deriveCityNameFromTimeZoneId(timeZoneId: string): string {
  return (timeZoneId.split(ZONE_ID_SEPARATOR).at(-1) ?? timeZoneId).replace(
    UNDERSCORES,
    " ",
  );
}
