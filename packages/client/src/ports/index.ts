export {
  AppRevisionFailure,
  type AppRevisionSource,
  isAppRevisionFailure,
} from "./appRevisionSource";
export {
  type CityRecord,
  type CitySearch,
  type CitySearchResult,
  isCityNameOfRecord,
  type LoadCitySearch,
  SearchMatchKind,
} from "./citySearch";
export {
  type LocationRepository,
  type LocationsLoadResult,
  LocationsLoadStatus,
  SaveOutcome,
  type StoredLocations,
} from "./locationRepository";
export {
  type PreferencesLoadResult,
  PreferencesLoadStatus,
  type PreferencesRepository,
} from "./preferencesRepository";
// Implements FR9, FR11 of add-meeting-share-dialog.
export {
  type MeetingShare,
  type ShareDestination,
  ShareDestinationId,
} from "./shareDestination";
export type { StorageAvailability } from "./storageAvailability";
export {
  type StoredReleaseLoadResult,
  StoredReleaseLoadStatus,
  type StoredReleaseRepository,
} from "./storedReleaseRepository";
export { CopyOutcome, type TextCopying } from "./textCopying";
export { ShareOutcome, type TextSharing } from "./textSharing";
export {
  isZoneRulesSourceFailure,
  ZoneRulesSourceFailure,
  type ZoneRulesVersion,
  type ZoneRulesVersionSource,
} from "./zoneRulesVersionSource";
