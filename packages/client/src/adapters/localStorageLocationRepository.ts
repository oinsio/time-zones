import {
  LOCATIONS_SCHEMA_VERSION,
  LOCATIONS_SYNC_CHANNEL_NAME,
  STORAGE_KEYS,
} from "@/constants";
import {
  type LocationRepository,
  type LocationsLoadResult,
  LocationsLoadStatus,
  SaveOutcome,
  type StoredLocations,
} from "@/ports";
import {
  deserializeLocationsDocument,
  LOCATION_MIGRATIONS,
  serializeLocationsDocument,
} from "./locationsDocument";
import type { PayloadMigrations } from "./payloadMigrations";
import {
  createStorageDocumentSync,
  type StorageSyncChannel,
} from "./storageDocumentSync";

/** The part of `BroadcastChannel` the adapter uses. */
export type LocationsSyncChannel = StorageSyncChannel;

export type LocalStorageLocationRepositoryOptions = {
  /** Called on every use, never at creation: reading it may throw. */
  getStorage: () => Storage;
  /** Returns `undefined` where cross-tab messaging is unavailable. */
  createChannel?: () => StorageSyncChannel | undefined;
  schemaVersion?: number;
  migrations?: PayloadMigrations;
};

/**
 * `LocationRepository` over Web Storage, synced across tabs with a
 * `BroadcastChannel` (or `storage` events where it is missing).
 * Implements FR9, FR11, FR12, FR13, FR14 of add-locations-via-search (D4).
 */
export function createLocalStorageLocationRepository({
  getStorage,
  createChannel,
  schemaVersion = LOCATIONS_SCHEMA_VERSION,
  migrations = LOCATION_MIGRATIONS,
}: LocalStorageLocationRepositoryOptions): LocationRepository {
  let isPersistenceRequested = false;
  const sync = createStorageDocumentSync({
    storageKey: STORAGE_KEYS.LOCATIONS,
    channelName: LOCATIONS_SYNC_CHANNEL_NAME,
    createChannel,
  });

  const load = (): LocationsLoadResult => {
    try {
      const rawDocument = getStorage().getItem(STORAGE_KEYS.LOCATIONS);
      return deserializeLocationsDocument(
        rawDocument,
        schemaVersion,
        migrations,
      );
    } catch {
      return { status: LocationsLoadStatus.EMPTY };
    }
  };

  const requestPersistentStorage = () => {
    if (isPersistenceRequested) return;
    isPersistenceRequested = true;
    // Eviction protection is best effort: the outcome is ignored.
    void navigator.storage?.persist?.()?.catch(() => undefined);
  };

  const write = (change: (storage: Storage) => void): SaveOutcome => {
    try {
      change(getStorage());
    } catch {
      return SaveOutcome.FAILED;
    }
    sync.announceChange();
    return SaveOutcome.SAVED;
  };

  return {
    load,
    save: (snapshot: StoredLocations) => {
      const outcome = write((storage) =>
        storage.setItem(
          STORAGE_KEYS.LOCATIONS,
          serializeLocationsDocument(snapshot, schemaVersion),
        ),
      );
      if (outcome === SaveOutcome.SAVED) requestPersistentStorage();
      return outcome;
    },
    clear: () => write((storage) => storage.removeItem(STORAGE_KEYS.LOCATIONS)),
    subscribe: (onExternalChange) =>
      sync.subscribe(() => onExternalChange(load())),
  };
}

/** The repository the app uses; the storage is read lazily (it may throw). */
export const localStorageLocationRepository =
  createLocalStorageLocationRepository({
    getStorage: () => globalThis.localStorage,
  });
