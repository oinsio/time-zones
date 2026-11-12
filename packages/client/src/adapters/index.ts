// Implements FR15 of add-grid-meeting-range-and-share.
export {
  browserTextSharing,
  createBrowserTextSharing,
  type SharingNavigator,
} from "./browserTextSharing";
export {
  createCompositeCitySearch,
  createFetchCitySearchLoader,
  deriveCityNameFromTimeZoneId,
  normalizeSearchText,
  splitIntoWords,
} from "./city-search";
export {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "./inMemoryLocationRepository";
export {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "./inMemoryPreferencesRepository";
export { inMemoryStorageAvailability } from "./inMemoryStorageAvailability";
export {
  createInMemoryTextSharing,
  type InMemoryTextSharing,
  type InMemoryTextSharingOptions,
} from "./inMemoryTextSharing";
export { loadCitySearch } from "./loadCitySearch";
export {
  createLocalStorageAvailability,
  localStorageAvailability,
} from "./localStorageAvailability";
export {
  createLocalStorageLocationRepository,
  type LocationsSyncChannel,
  localStorageLocationRepository,
} from "./localStorageLocationRepository";
export {
  createLocalStoragePreferencesRepository,
  localStoragePreferencesRepository,
} from "./localStoragePreferencesRepository";
export {
  createInMemoryStoredReleaseRepository,
  createLocalStorageStoredReleaseRepository,
  type InMemoryStoredReleaseRepositoryOptions,
  type LocalStorageStoredReleaseRepositoryOptions,
  localStorageStoredReleaseRepository,
} from "./storedRelease";
