import {
  LEGACY_STORAGE_KEYS,
  PREFERENCES_SYNC_CHANNEL_NAME,
  STORAGE_KEYS,
} from "@/constants";
import {
  type PreferencesLoadResult,
  PreferencesLoadStatus,
  type PreferencesRepository,
  SaveOutcome,
} from "@/ports";
import { DEFAULT_PREFERENCES } from "@/preferences";
import {
  deserializePreferencesDocument,
  serializePreferencesDocument,
} from "./preferencesDocument";
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

/**
 * `PreferencesRepository` over Web Storage, synced across tabs through the
 * shared `createStorageDocumentSync`.
 * Implements FR7 of add-settings-page-and-device-time-location (D5, D6).
 * Implements FR8 of add-interface-language-selection (D2): reads, migrates and clears the legacy `language` key.
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
      const storage = getStorage();
      const legacyLanguage = storage.getItem(LEGACY_STORAGE_KEYS.LANGUAGE);
      const legacyInterfaceLanguage = legacyLanguage || null;
      const rawDocument = storage.getItem(STORAGE_KEYS.PREFERENCES);
      if (rawDocument === null && legacyInterfaceLanguage !== null) {
        return {
          status: PreferencesLoadStatus.LOADED,
          preferences: {
            ...DEFAULT_PREFERENCES,
            interfaceLanguage: legacyInterfaceLanguage,
          },
        };
      }
      return deserializePreferencesDocument(
        rawDocument,
        legacyInterfaceLanguage,
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
      write((storage) => {
        storage.setItem(
          STORAGE_KEYS.PREFERENCES,
          serializePreferencesDocument(preferences),
        );
        storage.removeItem(LEGACY_STORAGE_KEYS.LANGUAGE);
      }),
    clear: () =>
      write((storage) => {
        storage.removeItem(STORAGE_KEYS.PREFERENCES);
        storage.removeItem(LEGACY_STORAGE_KEYS.LANGUAGE);
      }),
    subscribe: (onExternalChange) =>
      sync.subscribe(() => onExternalChange(load())),
  };
}

/** The repository the app uses; the storage is read lazily (it may throw). */
export const localStoragePreferencesRepository =
  createLocalStoragePreferencesRepository({
    getStorage: () => globalThis.localStorage,
  });
