import { moveLocationInList } from "./moveLocation";
import { canonicalizeTimeZoneId } from "./timeZoneId";

/**
 * Locations state, commands and reducer.
 * Implements FR8, FR9, FR10 of add-locations-via-search (D1) and FR2 of
 * reorder-locations-by-drag-and-drop.
 */

export type Location = {
  /** Derived from the canonical zone and the label; unique by invariant. */
  id: string;
  timeZoneId: string;
  label: string;
  /** ISO 3166-1 alpha-2 code; empty for zones without a country. */
  countryCode: string;
};

export type LocationsState = { locations: readonly Location[] };

export enum LocationCommandType {
  ADD_LOCATION = "ADD_LOCATION",
  REMOVE_LOCATION = "REMOVE_LOCATION",
  REPLACE_LOCATIONS = "REPLACE_LOCATIONS",
  MOVE_LOCATION = "MOVE_LOCATION",
}

export enum LocationErrorCode {
  DUPLICATE_LOCATION = "DUPLICATE_LOCATION",
  UNKNOWN_TIME_ZONE = "UNKNOWN_TIME_ZONE",
  LOCATION_NOT_FOUND = "LOCATION_NOT_FOUND",
  LOCATION_POSITION_OUT_OF_RANGE = "LOCATION_POSITION_OUT_OF_RANGE",
}

export type LocationCommand =
  | {
      type: LocationCommandType.ADD_LOCATION;
      timeZoneId: string;
      label: string;
      countryCode: string;
    }
  | { type: LocationCommandType.REMOVE_LOCATION; id: string }
  | {
      type: LocationCommandType.MOVE_LOCATION;
      id: string;
      /** 0-based index in the list after the move. */
      targetIndex: number;
    }
  | {
      type: LocationCommandType.REPLACE_LOCATIONS;
      locations: readonly Location[];
    };

export type LocationsReduceResult =
  | { ok: true; state: LocationsState }
  | { ok: false; error: LocationErrorCode };

const ID_SEPARATOR = "|";

export function buildLocationId(timeZoneId: string, label: string): string {
  return `${timeZoneId}${ID_SEPARATOR}${label}`;
}

function failWith(error: LocationErrorCode): LocationsReduceResult {
  return { ok: false, error };
}

export function reduceLocations(
  state: LocationsState,
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
      return { ok: true, state: { locations: [...state.locations, added] } };
    }
    case LocationCommandType.REMOVE_LOCATION: {
      if (!state.locations.some((location) => location.id === command.id)) {
        return failWith(LocationErrorCode.LOCATION_NOT_FOUND);
      }
      return {
        ok: true,
        state: {
          locations: state.locations.filter(
            (location) => location.id !== command.id,
          ),
        },
      };
    }
    case LocationCommandType.REPLACE_LOCATIONS:
      return { ok: true, state: { locations: command.locations } };
    case LocationCommandType.MOVE_LOCATION:
      return moveLocationInList(state, command.id, command.targetIndex);
  }
}
