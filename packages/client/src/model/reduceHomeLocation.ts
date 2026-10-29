import {
  type LocationCommand,
  type LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type WorldClockState,
} from "./locations";
import { canonicalizeTimeZoneId } from "./timeZoneId";

type SetHomeLocationCommand = Extract<
  LocationCommand,
  { type: LocationCommandType.SET_HOME_LOCATION }
>;

/**
 * Marks a listed location as home, or clears home with `null`. Setting the
 * value that is already set returns the same state object.
 * Implements FR1, FR2, FR3 of set-home-location-and-show-differences (D1).
 */
export function reduceHomeLocation(
  state: WorldClockState,
  command: SetHomeLocationCommand,
): LocationsReduceResult {
  if (command.id !== null) {
    const home = state.locations.find((location) => location.id === command.id);
    if (
      home === undefined ||
      canonicalizeTimeZoneId(home.timeZoneId) === undefined
    ) {
      return { ok: false, error: LocationErrorCode.LOCATION_NOT_FOUND };
    }
  }
  if (command.id === state.homeLocationId) return { ok: true, state };
  return { ok: true, state: { ...state, homeLocationId: command.id } };
}
