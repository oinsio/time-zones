/**
 * The stored release adapters. This sub-module imports only `@/lib/zoneRules`,
 * `@/constants` and `@/ports`, so `boot.ts` can use it before Temporal loads.
 * Implements FR6, FR9 of add-remote-zone-rules-updates (design D2).
 */
export {
  createInMemoryStoredReleaseRepository,
  type InMemoryStoredReleaseRepositoryOptions,
} from "./inMemoryStoredReleaseRepository";
export {
  createLocalStorageStoredReleaseRepository,
  type LocalStorageStoredReleaseRepositoryOptions,
  localStorageStoredReleaseRepository,
} from "./localStorageStoredReleaseRepository";
