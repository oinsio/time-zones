// Public API of the model layer (ADR-0002).
// Implements FR8, FR9, FR10 of add-locations-via-search.
export {
  buildLocationId,
  type Location,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  type LocationsState,
  reduceLocations,
} from "./locations";
export {
  type ParseStoredLocationsResult,
  parseStoredLocations,
} from "./parseStoredLocations";
export { createStore, type ReduceResult, type Store } from "./store";
export { canonicalizeTimeZoneId } from "./timeZoneId";
