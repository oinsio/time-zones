import { DEVICE_TIME_ZONE_FALLBACK_ID } from "@/constants";
import { followReferenceZone } from "./followReferenceZone";
import {
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
} from "./locationCommands";
import { buildLocationId } from "./locationId";
import { moveLocationInList } from "./moveLocation";
import { reduceHomeLocation } from "./reduceHomeLocation";
import { reduceReferenceMoment } from "./reduceReferenceMoment";
import { reduceSelectInstant } from "./reduceSelectInstant";
import { reduceWallTime } from "./reduceWallTime";
import { LIVE_REFERENCE_MOMENT, type ReferenceMoment } from "./referenceMoment";
import { canonicalizeTimeZoneId } from "./timeZoneId";

export {
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
} from "./locationCommands";
export { buildLocationId, canonicalizeLocationId } from "./locationId";

/**
 * World clock state, commands and reducer.
 * Implements FR8, FR9, FR10 of add-locations-via-search (D1) and FR2 of
 * reorder-locations-by-drag-and-drop.
 * Implements FR3, FR4 of mark-device-time-zone-in-location-list (D1).
 * Implements FR1 of select-date-with-calendar-and-now (D1): the reference moment.
 * Implements FR3, FR8 of add-time-sliders-to-location-cards (D1): SELECT_INSTANT.
 * Implements FR1, FR2, FR3, FR10 of set-home-location-and-show-differences (D1).
 */

export type Location = {
  /** Derived from the canonical zone and the label; unique by invariant. */
  id: string;
  timeZoneId: string;
  label: string;
  /** ISO 3166-1 alpha-2 code; empty for zones without a country. */
  countryCode: string;
};

export type WorldClockState = {
  locations: readonly Location[];
  /** Canonical IANA ID of the device zone; never persisted (ADR-0007). */
  deviceTimeZoneId: string;
  /** Live or pinned; never persisted (ADR-0003). */
  reference: ReferenceMoment;
  /** Id of the home location, or `null`; always an id of `locations`. */
  homeLocationId: string | null;
};

export const INITIAL_WORLD_CLOCK_STATE: WorldClockState = {
  locations: [],
  deviceTimeZoneId: DEVICE_TIME_ZONE_FALLBACK_ID,
  reference: LIVE_REFERENCE_MOMENT,
  homeLocationId: null,
};

export type LocationsReduceResult =
  | { ok: true; state: WorldClockState }
  | { ok: false; error: LocationErrorCode };

function failWith(error: LocationErrorCode): LocationsReduceResult {
  return { ok: false, error };
}

export function reduceLocations(
  state: WorldClockState,
  command: LocationCommand,
): LocationsReduceResult {
  const outcome = reduceCommand(state, command);
  return outcome.ok
    ? { ok: true, state: followReferenceZone(state, outcome.state) }
    : outcome;
}

function reduceCommand(
  state: WorldClockState,
  command: LocationCommand,
): LocationsReduceResult {
  switch (command.type) {
    case LocationCommandType.ADD_LOCATION: {
      const timeZoneId = canonicalizeTimeZoneId(command.timeZoneId);
      if (timeZoneId === undefined) {
        return failWith(LocationErrorCode.UNKNOWN_TIME_ZONE);
      }
      const id = buildLocationId(timeZoneId, command.label);
      if (state.locations.some((location) => location.id === id)) {
        return failWith(LocationErrorCode.DUPLICATE_LOCATION);
      }
      const added: Location = {
        id,
        timeZoneId,
        label: command.label,
        countryCode: command.countryCode,
      };
      return {
        ok: true,
        state: { ...state, locations: [...state.locations, added] },
      };
    }
    case LocationCommandType.REMOVE_LOCATION: {
      if (!state.locations.some((location) => location.id === command.id)) {
        return failWith(LocationErrorCode.LOCATION_NOT_FOUND);
      }
      return {
        ok: true,
        state: {
          ...state,
          locations: state.locations.filter(
            (location) => location.id !== command.id,
          ),
          homeLocationId:
            state.homeLocationId === command.id ? null : state.homeLocationId,
        },
      };
    }
    case LocationCommandType.REPLACE_LOCATIONS: {
      const isHomeListed = command.locations.some(
        (location) => location.id === command.homeLocationId,
      );
      return {
        ok: true,
        state: {
          ...state,
          locations: command.locations,
          homeLocationId: isHomeListed ? command.homeLocationId : null,
        },
      };
    }
    case LocationCommandType.SET_HOME_LOCATION:
      return reduceHomeLocation(state, command);
    case LocationCommandType.SET_DEVICE_TIME_ZONE: {
      const deviceTimeZoneId =
        canonicalizeTimeZoneId(command.timeZoneId) ??
        DEVICE_TIME_ZONE_FALLBACK_ID;
      if (deviceTimeZoneId === state.deviceTimeZoneId) {
        return { ok: true, state };
      }
      return { ok: true, state: { ...state, deviceTimeZoneId } };
    }
    case LocationCommandType.MOVE_LOCATION:
      return moveLocationInList(state, command.id, command.targetIndex);
    case LocationCommandType.SET_DATE:
    case LocationCommandType.SHIFT_DATE:
    case LocationCommandType.RESET_TO_NOW:
      return reduceReferenceMoment(state, command);
    case LocationCommandType.SET_WALL_TIME:
      return reduceWallTime(state, command);
    case LocationCommandType.SELECT_INSTANT:
      return reduceSelectInstant(state, command);
  }
}
