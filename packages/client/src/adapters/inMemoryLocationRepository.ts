import type { Location } from "@/model";
import {
  type LocationRepository,
  type LocationsLoadResult,
  LocationsLoadStatus,
  SaveOutcome,
} from "@/ports";

type ExternalChangeListener = {
  owner: symbol;
  notify: (result: LocationsLoadResult) => void;
};

/** Storage shared by in-memory repository instances, like one browser profile. */
export type InMemoryLocationBackend = {
  document: LocationsLoadResult;
  listeners: Set<ExternalChangeListener>;
};

export const createInMemoryLocationBackend = (
  initialDocument: LocationsLoadResult = { status: LocationsLoadStatus.EMPTY },
): InMemoryLocationBackend => ({
  document: initialDocument,
  listeners: new Set(),
});

export type InMemoryLocationRepositoryOptions = {
  /** What `load` answers until something is saved. */
  initialDocument?: LocationsLoadResult;
  /** When false, `save` and `clear` return `FAILED` and keep the document. */
  isWritable?: boolean;
  /** Shared by instances that must see each other's changes. */
  backend?: InMemoryLocationBackend;
};

/**
 * In-memory `LocationRepository` for tests and stories.
 * Implements FR11, FR13, FR14 of add-locations-via-search (D4).
 */
export function createInMemoryLocationRepository({
  initialDocument,
  isWritable = true,
  backend = createInMemoryLocationBackend(initialDocument),
}: InMemoryLocationRepositoryOptions = {}): LocationRepository {
  const instanceKey = Symbol("in-memory-location-repository");

  const write = (document: LocationsLoadResult): SaveOutcome => {
    if (!isWritable) return SaveOutcome.FAILED;
    backend.document = document;
    for (const listener of backend.listeners) {
      if (listener.owner !== instanceKey) listener.notify(document);
    }
    return SaveOutcome.SAVED;
  };

  return {
    load: () => backend.document,
    save: (locations: readonly Location[]) =>
      write({ status: LocationsLoadStatus.LOADED, locations }),
    clear: () => write({ status: LocationsLoadStatus.EMPTY }),
    subscribe: (onExternalChange) => {
      const listener = { owner: instanceKey, notify: onExternalChange };
      backend.listeners.add(listener);
      return () => {
        backend.listeners.delete(listener);
      };
    },
  };
}
