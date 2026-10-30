import type { Location } from "./locations";
import type { WallTimeTarget } from "./referenceMoment";

/**
 * World clock commands and their error codes: plain JSON (ADR-0002).
 * Implements FR8, FR9, FR10 of add-locations-via-search (D1) and FR2 of
 * reorder-locations-by-drag-and-drop.
 * Implements FR3, FR8 of add-time-sliders-to-location-cards (D1): SELECT_INSTANT.
 * Implements FR1, FR2, FR3, FR10 of set-home-location-and-show-differences (D1).
 */

export enum LocationCommandType {
  ADD_LOCATION = "ADD_LOCATION",
  REMOVE_LOCATION = "REMOVE_LOCATION",
  REPLACE_LOCATIONS = "REPLACE_LOCATIONS",
  MOVE_LOCATION = "MOVE_LOCATION",
  SET_DEVICE_TIME_ZONE = "SET_DEVICE_TIME_ZONE",
  SET_DATE = "SET_DATE",
  SHIFT_DATE = "SHIFT_DATE",
  RESET_TO_NOW = "RESET_TO_NOW",
  SELECT_INSTANT = "SELECT_INSTANT",
  SET_HOME_LOCATION = "SET_HOME_LOCATION",
  SET_WALL_TIME = "SET_WALL_TIME",
}

export enum LocationErrorCode {
  DUPLICATE_LOCATION = "DUPLICATE_LOCATION",
  UNKNOWN_TIME_ZONE = "UNKNOWN_TIME_ZONE",
  LOCATION_NOT_FOUND = "LOCATION_NOT_FOUND",
  LOCATION_POSITION_OUT_OF_RANGE = "LOCATION_POSITION_OUT_OF_RANGE",
  INVALID_DATE = "INVALID_DATE",
  DATE_OUT_OF_RANGE = "DATE_OUT_OF_RANGE",
  INVALID_INSTANT = "INVALID_INSTANT",
  INVALID_TIME = "INVALID_TIME",
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
      homeLocationId: string | null;
    }
  | { type: LocationCommandType.SET_HOME_LOCATION; id: string | null }
  | { type: LocationCommandType.SET_DEVICE_TIME_ZONE; timeZoneId: string }
  /** `date` is an ISO date, `now` an ISO 8601 timestamp with `Z`. */
  | { type: LocationCommandType.SET_DATE; date: string; now: string }
  | { type: LocationCommandType.SHIFT_DATE; days: number; now: string }
  | { type: LocationCommandType.RESET_TO_NOW }
  /** `instant` is an ISO 8601 timestamp with `Z`. */
  | { type: LocationCommandType.SELECT_INSTANT; instant: string }
  /** Implements FR3 of add-wall-time-input-with-hint (D1). */
  | {
      type: LocationCommandType.SET_WALL_TIME;
      target: WallTimeTarget;
      /** "HH:MM", 24-hour. */
      time: string;
      /** ISO date: the row's local date when the field opened. */
      date: string;
    };
