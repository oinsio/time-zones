import {
  PREFERENCES_SCHEMA_VERSION,
  PREFERENCES_SYNC_CHANNEL_NAME,
  STORAGE_KEYS,
} from "@/constants";
import {
  type PreferencesLoadResult,
  PreferencesLoadStatus,
  type PreferencesRepository,
  SaveOutcome,
} from "@/ports";
import { type Preferences, parseStoredPreferences } from "@/preferences";
import {
  createStorageDocumentSync,
  type StorageSyncChannel,
} from "./storageDocumentSync";

export type LocalStoragePreferencesRepositoryOptions = {
  /** Called on every use, never at creation: reading it may throw. */
  getStorage: () => Storage;
  /** Returns `undefined` where cross-tab messaging is unavailable. */
  createChannel?: () => StorageSyncChannel | undefined;
};

const serializePreferencesDocument = (preferences: Preferences): string =>
  JSON.stringify({
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    payload: {
      theme: preferences.theme,
      hourFormat: preferences.hourFormat,
    },
  });

/** Any document that cannot be read as a valid one is `UNREADABLE`. */
function deserializePreferencesDocument(
  rawDocument: string | null,
): PreferencesLoadResult {
  if (rawDocument === null) return { status: PreferencesLoadStatus.EMPTY };
  try {
    const { schemaVersion, payload } = JSON.parse(rawDocument);
    if (schemaVersion !== PREFERENCES_SCHEMA_VERSION) {
      return { status: PreferencesLoadStatus.UNREADABLE };
    }
    const parsed = parseStoredPreferences(payload);
    return parsed.ok
      ? {
          status: PreferencesLoadStatus.LOADED,
          preferences: parsed.preferences,
        }
      : { status: PreferencesLoadStatus.UNREADABLE };
  } catch {
    return { status: PreferencesLoadStatus.UNREADABLE };
  }
}

/**
 * `PreferencesRepository` over Web Storage, synced across tabs through the
 * shared `createStorageDocumentSync`.
 * Implements FR7 of add-settings-page-and-device-time-location (D5, D6).
 */
export function createLocalStoragePreferencesRepository({
  getStorage,
  createChannel,
}: LocalStoragePreferencesRepositoryOptions): PreferencesRepository {
  const sync = createStorageDocumentSync({
    storageKey: STORAGE_KEYS.PREFERENCES,
    channelName: PREFERENCES_SYNC_CHANNEL_NAME,
    createChannel,
  });

  const load = (): PreferencesLoadResult => {
    try {
      return deserializePreferencesDocument(
        getStorage().getItem(STORAGE_KEYS.PREFERENCES),
      );
    } catch {
      return { status: PreferencesLoadStatus.EMPTY };
    }
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
    save: (preferences) =>
      write((storage) =>
        storage.setItem(
          STORAGE_KEYS.PREFERENCES,
          serializePreferencesDocument(preferences),
        ),
      ),
    clear: () =>
      write((storage) => storage.removeItem(STORAGE_KEYS.PREFERENCES)),
    subscribe: (onExternalChange) =>
      sync.subscribe(() => onExternalChange(load())),
  };
}

/** The repository the app uses; the storage is read lazily (it may throw). */
export const localStoragePreferencesRepository =
  createLocalStoragePreferencesRepository({
    getStorage: () => globalThis.localStorage,
  });
