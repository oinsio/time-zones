import type { Location } from "./locations";

/**
 * True when the location's canonical zone ID equals the device zone ID.
 * Both IDs are canonical by invariant (ADR-0007), so equality is strict.
 * Implements FR1, FR2 of mark-device-time-zone-in-location-list.
 */
export function isLocationInDeviceTimeZone(
  location: Location,
  deviceTimeZoneId: string,
): boolean {
  return location.timeZoneId === deviceTimeZoneId;
}
