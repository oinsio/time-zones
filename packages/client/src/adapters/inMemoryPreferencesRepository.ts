import {
  type PreferencesLoadResult,
  PreferencesLoadStatus,
  type PreferencesRepository,
  SaveOutcome,
} from "@/ports";

type ExternalChangeListener = {
  owner: symbol;
  notify: (result: PreferencesLoadResult) => void;
};

/** Storage shared by in-memory repository instances, like one browser profile. */
export type InMemoryPreferencesBackend = {
  document: PreferencesLoadResult;
  listeners: Set<ExternalChangeListener>;
};

export const createInMemoryPreferencesBackend = (
  initialDocument: PreferencesLoadResult = {
    status: PreferencesLoadStatus.EMPTY,
  },
): InMemoryPreferencesBackend => ({
  document: initialDocument,
  listeners: new Set(),
});

export type InMemoryPreferencesRepositoryOptions = {
  /** What `load` answers until something is saved. */
  initialDocument?: PreferencesLoadResult;
  /** When false, `save` and `clear` return `FAILED` and keep the document. */
  isWritable?: boolean;
  /** Shared by instances that must see each other's changes. */
  backend?: InMemoryPreferencesBackend;
};

/**
 * In-memory `PreferencesRepository` for tests.
 * Implements FR7 of add-settings-page-and-device-time-location (D5).
 */
export function createInMemoryPreferencesRepository({
  initialDocument,
  isWritable = true,
  backend = createInMemoryPreferencesBackend(initialDocument),
}: InMemoryPreferencesRepositoryOptions = {}): PreferencesRepository {
  const instanceKey = Symbol("in-memory-preferences-repository");

  const write = (document: PreferencesLoadResult): SaveOutcome => {
    if (!isWritable) return SaveOutcome.FAILED;
    backend.document = document;
    for (const listener of backend.listeners) {
      if (listener.owner !== instanceKey) listener.notify(document);
    }
    return SaveOutcome.SAVED;
  };

  return {
    load: () => backend.document,
    save: (preferences) =>
      write({ status: PreferencesLoadStatus.LOADED, preferences }),
    clear: () => write({ status: PreferencesLoadStatus.EMPTY }),
    subscribe: (onExternalChange) => {
      const listener = { owner: instanceKey, notify: onExternalChange };
      backend.listeners.add(listener);
      return () => {
        backend.listeners.delete(listener);
      };
    },
  };
}
