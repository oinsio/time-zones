import {
  LOCATIONS_SCHEMA_VERSION,
  LOCATIONS_SYNC_CHANNEL_NAME,
  STORAGE_KEYS,
} from "@/constants";
import type { Location } from "@/model";
import {
  type LocationRepository,
  type LocationsLoadResult,
  LocationsLoadStatus,
  SaveOutcome,
} from "@/ports";
import {
  deserializeLocationsDocument,
  LOCATION_MIGRATIONS,
  type PayloadMigrations,
  serializeLocationsDocument,
} from "./locationsDocument";

/** The part of `BroadcastChannel` the adapter uses. */
export interface LocationsSyncChannel {
  postMessage(message: unknown): void;
  addEventListener(type: "message", listener: () => void): void;
  removeEventListener(type: "message", listener: () => void): void;
}

export type LocalStorageLocationRepositoryOptions = {
  /** Called on every use, never at creation: reading it may throw. */
  getStorage: () => Storage;
  /** Returns `undefined` where cross-tab messaging is unavailable. */
  createChannel?: () => LocationsSyncChannel | undefined;
  schemaVersion?: number;
  migrations?: PayloadMigrations;
};

const CHANNEL_MESSAGE_EVENT = "message";
const STORAGE_EVENT = "storage";
const CHANNEL_MESSAGE = "changed";

const createBroadcastChannel = (): LocationsSyncChannel | undefined =>
  typeof BroadcastChannel === "undefined"
    ? undefined
    : new BroadcastChannel(LOCATIONS_SYNC_CHANNEL_NAME);

/**
 * `LocationRepository` over Web Storage, synced across tabs with a
 * `BroadcastChannel` (or `storage` events where it is missing).
 * Implements FR9, FR11, FR12, FR13, FR14 of add-locations-via-search (D4).
 */
export function createLocalStorageLocationRepository({
  getStorage,
  createChannel = createBroadcastChannel,
  schemaVersion = LOCATIONS_SCHEMA_VERSION,
  migrations = LOCATION_MIGRATIONS,
}: LocalStorageLocationRepositoryOptions): LocationRepository {
  let channel: LocationsSyncChannel | undefined;
  let isChannelCreated = false;
  let isPersistenceRequested = false;

  const getChannel = (): LocationsSyncChannel | undefined => {
    if (!isChannelCreated) {
      isChannelCreated = true;
      try {
        channel = createChannel();
      } catch {
        // Without a channel the other tabs catch up on their next load.
      }
    }
    return channel;
  };

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

  const announceChange = () => {
    try {
      getChannel()?.postMessage(CHANNEL_MESSAGE);
    } catch {
      // Other tabs catch up on their next load.
    }
  };

  const write = (change: (storage: Storage) => void): SaveOutcome => {
    try {
      change(getStorage());
    } catch {
      return SaveOutcome.FAILED;
    }
    announceChange();
    return SaveOutcome.SAVED;
  };

  return {
    load,
    save: (locations: readonly Location[]) => {
      const outcome = write((storage) =>
        storage.setItem(
          STORAGE_KEYS.LOCATIONS,
          serializeLocationsDocument(locations, schemaVersion),
        ),
      );
      if (outcome === SaveOutcome.SAVED) requestPersistentStorage();
      return outcome;
    },
    clear: () => write((storage) => storage.removeItem(STORAGE_KEYS.LOCATIONS)),
    subscribe: (onExternalChange) => {
      const syncChannel = getChannel();
      if (syncChannel) {
        const onMessage = () => onExternalChange(load());
        syncChannel.addEventListener(CHANNEL_MESSAGE_EVENT, onMessage);
        return () =>
          syncChannel.removeEventListener(CHANNEL_MESSAGE_EVENT, onMessage);
      }
      const onStorageEvent = (storageEvent: StorageEvent) => {
        const isLocationsChange =
          storageEvent.key === STORAGE_KEYS.LOCATIONS ||
          storageEvent.key === null;
        if (isLocationsChange) onExternalChange(load());
      };
      globalThis.addEventListener(STORAGE_EVENT, onStorageEvent);
      return () =>
        globalThis.removeEventListener(STORAGE_EVENT, onStorageEvent);
    },
  };
}

/** The repository the app uses; the storage is read lazily (it may throw). */
export const localStorageLocationRepository =
  createLocalStorageLocationRepository({
    getStorage: () => globalThis.localStorage,
  });
