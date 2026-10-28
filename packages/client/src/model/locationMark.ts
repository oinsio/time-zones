import { isLocationInDeviceTimeZone } from "./deviceTimeZone";
import type { Location } from "./locations";

/**
 * Kinds of the leading mark of a location row.
 * Implements FR4 of match-here-mark-to-design.
 */
export enum LocationMarkKind {
  HERE = "here",
}

/**
 * The row's leading mark, or `undefined` when the row has none. The only place
 * that decides a row's kind.
 * Implements FR1, FR4 of match-here-mark-to-design (D1).
 */
export function getLocationMarkKind(
  location: Location,
  deviceTimeZoneId: string,
): LocationMarkKind | undefined {
  return isLocationInDeviceTimeZone(location, deviceTimeZoneId)
    ? LocationMarkKind.HERE
    : undefined;
}
