import { isLocationInDeviceTimeZone } from "./deviceTimeZone";
import type { WorldClockState } from "./locations";

/** The derived Here entry: the device time zone, not a stored location. */
export type HereEntry = { timeZoneId: string };

/**
 * The Here entry, or `undefined` when a location already shows the device
 * time. The one place that decides whether it exists; it uses the Here mark's
 * rule, so the mark and the entry cannot disagree.
 * Implements FR1, FR6 of show-here-entry-for-device-time.
 */
export function getHereEntry(state: WorldClockState): HereEntry | undefined {
  const isDeviceTimeShown = state.locations.some((location) =>
    isLocationInDeviceTimeZone(location, state.deviceTimeZoneId),
  );
  return isDeviceTimeShown ? undefined : { timeZoneId: state.deviceTimeZoneId };
}
