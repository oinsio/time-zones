// Public API of the model layer (ADR-0002).
// Implements FR8, FR9, FR10 of add-locations-via-search and FR2 of
// reorder-locations-by-drag-and-drop.
// Implements FR1-FR4 of mark-device-time-zone-in-location-list.

export { isLocationInDeviceTimeZone } from "./deviceTimeZone";
// Implements FR1, FR2, FR6 of show-local-time-and-date-on-location-cards.
export { getLocalDateTime } from "./localDateTime";
export {
  buildLocationId,
  INITIAL_LOCATIONS_STATE,
  type Location,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type LocationsState,
  reduceLocations,
} from "./locations";
export { moveLocationInList } from "./moveLocation";
export {
  type ParseStoredLocationsResult,
  parseStoredLocations,
} from "./parseStoredLocations";
export { createStore, type ReduceResult, type Store } from "./store";
export { canonicalizeTimeZoneId } from "./timeZoneId";
// Implements FR2, FR6 of show-utc-offset-on-location-rows.
export { getUtcOffsetMinutes } from "./utcOffset";
