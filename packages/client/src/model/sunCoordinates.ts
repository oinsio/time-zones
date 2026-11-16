import { COORDINATE_TENTHS_PER_DEGREE } from "@/constants";
import type { Coordinates } from "./coordinates";
import { isDeviceTimeLocation } from "./deviceTimeLocation";
import type { Location } from "./locations";
import { getSunSupport } from "./sunRegistry";

/**
 * The coordinates a location's sun uses: its own, else the zone coordinates
 * of its zone; the device time location always the zone coordinates of the
 * device time zone, never the device's own position.
 * Implements FR7, FR8, NFR-P2 of bind-day-periods-to-sun (D4).
 */

/** The coordinates of the principal place of a zone; `undefined` for UTC or an unknown zone. */
export function getZoneCoordinates(
  timeZoneId: string,
): Coordinates | undefined {
  const tenths = getSunSupport().zoneCoordinates[timeZoneId];
  if (tenths === undefined) return undefined;
  return {
    latitude: tenths[0] / COORDINATE_TENTHS_PER_DEGREE,
    longitude: tenths[1] / COORDINATE_TENTHS_PER_DEGREE,
  };
}

export function getSunCoordinates(
  location: Pick<Location, "kind" | "timeZoneId" | "coordinates">,
): Coordinates | undefined {
  if (isDeviceTimeLocation(location))
    return getZoneCoordinates(location.timeZoneId);
  return location.coordinates ?? getZoneCoordinates(location.timeZoneId);
}
