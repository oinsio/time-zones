import type { Location } from "./locations";

/**
 * True when the location's canonical zone ID equals the device zone ID.
 * Both IDs are canonical by invariant (ADR-0007), so equality is strict.
 * Implements FR1, FR2 of mark-device-time-zone-in-location-list.
 * Implements FR1 of show-here-entry-for-device-time (the Here entry's rule).
 */
export function isLocationInDeviceTimeZone(
  location: Pick<Location, "timeZoneId">,
  deviceTimeZoneId: string,
): boolean {
  return location.timeZoneId === deviceTimeZoneId;
}
