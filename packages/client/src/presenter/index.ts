// Public API of the presenter layer (ADR-0002).
// Implements FR5, FR8, FR10 of add-locations-via-search (D9).
export { type LocationRow, presentLocationRows } from "./presentLocationRows";
export {
  type PresentedSearchResult,
  presentSearchResults,
} from "./presentSearchResults";
// Implements FR3 of show-utc-offset-on-location-rows.
export { formatUtcOffset } from "./utcOffset";
