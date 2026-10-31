import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { LocationErrorCode } from "./locationCommands";
import { LocationKind } from "./locationKind";
import type {
  Location,
  LocationsReduceResult,
  WorldClockState,
} from "./locations";

/**
 * The device time location: a location whose zone mirrors the device time zone.
 * Implements FR8 of add-settings-page-and-device-time-location (D1).
 */
export function buildDeviceTimeLocation(deviceTimeZoneId: string): Location {
  return {
    id: DEVICE_TIME_LOCATION_ID,
    kind: LocationKind.DEVICE_TIME,
    timeZoneId: deviceTimeZoneId,
    label: "",
    countryCode: "",
  };
}

/**
 * True for the device time location.
 * Implements FR8 of add-settings-page-and-device-time-location (D1).
 */
export function isDeviceTimeLocation(
  location: Pick<Location, "kind">,
): boolean {
  return location.kind === LocationKind.DEVICE_TIME;
}

/**
 * Sets the zone of the device time location to the device zone; returns the
 * same array when nothing changes.
 * Implements FR8 of add-settings-page-and-device-time-location (D1).
 */
export function withDeviceTimeZone(
  locations: readonly Location[],
  deviceTimeZoneId: string,
): readonly Location[] {
  const isStale = locations.some(
    (location) =>
      isDeviceTimeLocation(location) &&
      location.timeZoneId !== deviceTimeZoneId,
  );
  if (!isStale) return locations;
  return locations.map((location) =>
    isDeviceTimeLocation(location)
      ? { ...location, timeZoneId: deviceTimeZoneId }
      : location,
  );
}

/**
 * The list shown on the first launch: the device time location alone.
 * Implements FR12 of add-settings-page-and-device-time-location (D3).
 */
export function buildFirstLaunchLocations(
  deviceTimeZoneId: string,
): readonly Location[] {
  return [buildDeviceTimeLocation(deviceTimeZoneId)];
}

/**
 * Reduces ADD_DEVICE_TIME_LOCATION: appends it, or fails when listed.
 * Implements FR11 of add-settings-page-and-device-time-location (D1).
 */
export function reduceAddDeviceTimeLocation(
  state: WorldClockState,
): LocationsReduceResult {
  if (state.locations.some(isDeviceTimeLocation)) {
    return { ok: false, error: LocationErrorCode.DUPLICATE_LOCATION };
  }
  return {
    ok: true,
    state: {
      ...state,
      locations: [
        ...state.locations,
        buildDeviceTimeLocation(state.deviceTimeZoneId),
      ],
    },
  };
}
