import type { WorldClockState } from "./locations";

/**
 * The watched zones: the distinct zones of the listed locations plus the
 * device time zone, whether or not the device time location is listed.
 * Implements FR9 of apply-data-updates-silently (D5).
 */
export function getWatchedZoneIds(state: WorldClockState): string[] {
  const zoneIds = new Set(
    state.locations.map((location) => location.timeZoneId),
  );
  zoneIds.add(state.deviceTimeZoneId);
  return [...zoneIds];
}
