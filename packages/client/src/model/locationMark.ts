import { isLocationInDeviceTimeZone } from "./deviceTimeZone";
import type { Location } from "./locations";

/**
 * Kinds of the leading mark of a location row.
 * Implements FR4 of match-here-mark-to-design.
 */
export enum LocationMarkKind {
  HERE = "here",
  HOME = "home",
}

/**
 * The row's leading mark, or `undefined` when the row has none. The only place
 * that decides a row's kind.
 * Home wins over Here.
 * Implements FR1, FR4 of match-here-mark-to-design (D1).
 * Implements FR7 of set-home-location-and-show-differences (D3).
 */
export function getLocationMarkKind(
  location: Location,
  deviceTimeZoneId: string,
  homeLocationId: string | null,
): LocationMarkKind | undefined {
  if (location.id === homeLocationId) return LocationMarkKind.HOME;
  return isLocationInDeviceTimeZone(location, deviceTimeZoneId)
    ? LocationMarkKind.HERE
    : undefined;
}
