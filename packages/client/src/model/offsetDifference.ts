import type { Temporal } from "@/lib/temporal";
import { isLocationInDeviceTimeZone } from "./deviceTimeZone";
import type { Location, WorldClockState } from "./locations";
import { getReferenceZone } from "./referenceMoment";
import { getUtcOffsetMinutes } from "./utcOffset";

/**
 * UTC offset of the reference zone at an instant, in minutes; `undefined` for
 * an unknown zone. Read once per presentation, not per row.
 * Implements FR5 of set-home-location-and-show-differences (D4).
 */
export function getReferenceOffsetMinutes(
  state: WorldClockState,
  instant: Temporal.Instant,
): number | undefined {
  return getUtcOffsetMinutes(getReferenceZone(state), instant);
}

/**
 * Offset difference of a row from the reference zone, in minutes. `undefined`
 * for the home row, for a row in the device zone while no home is set (it is
 * the reference), and when either offset is unknown. The one place that decides
 * which rows have a difference.
 * Implements FR5 of set-home-location-and-show-differences (D4).
 */
export function getOffsetDifferenceMinutes(
  location: Pick<Location, "id" | "timeZoneId">,
  rowOffsetMinutes: number | undefined,
  referenceOffsetMinutes: number | undefined,
  context: { deviceTimeZoneId: string; homeLocationId: string | null },
): number | undefined {
  if (rowOffsetMinutes === undefined || referenceOffsetMinutes === undefined) {
    return undefined;
  }
  if (location.id === context.homeLocationId) return undefined;
  if (
    context.homeLocationId === null &&
    isLocationInDeviceTimeZone(location, context.deviceTimeZoneId)
  ) {
    return undefined;
  }
  return rowOffsetMinutes - referenceOffsetMinutes;
}
