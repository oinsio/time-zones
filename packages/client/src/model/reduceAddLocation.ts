import { parseCoordinates } from "./coordinates";
import { buildLocationId } from "./locationId";
import { LocationKind } from "./locationKind";
import {
  type Location,
  type LocationCommand,
  type LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type WorldClockState,
} from "./locations";
import { canonicalizeTimeZoneId } from "./timeZoneId";

type AddLocationCommand = Extract<
  LocationCommand,
  { type: LocationCommandType.ADD_LOCATION }
>;

/**
 * Appends a city location of a known zone; a location with the same id is a
 * duplicate. Coordinates that are not valid are dropped.
 * Implements FR6 of add-city-coordinates-to-locations (D6).
 */
export function reduceAddLocation(
  state: WorldClockState,
  command: AddLocationCommand,
): LocationsReduceResult {
  const timeZoneId = canonicalizeTimeZoneId(command.timeZoneId);
  if (timeZoneId === undefined) {
    return { ok: false, error: LocationErrorCode.UNKNOWN_TIME_ZONE };
  }
  const id = buildLocationId(timeZoneId, command.label);
  if (state.locations.some((location) => location.id === id)) {
    return { ok: false, error: LocationErrorCode.DUPLICATE_LOCATION };
  }
  const added: Location = {
    id,
    kind: LocationKind.CITY,
    timeZoneId,
    label: command.label,
    countryCode: command.countryCode,
    coordinates: parseCoordinates(command.coordinates),
  };
  return {
    ok: true,
    state: { ...state, locations: [...state.locations, added] },
  };
}
