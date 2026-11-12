import { STORAGE_KEYS, STORED_RELEASE_SCHEMA_VERSION } from "@/constants";
import { parseZoneRulesRelease, ZoneRulesReleaseError } from "@/lib/zoneRules";
import {
  SaveOutcome,
  type StoredReleaseLoadResult,
  StoredReleaseLoadStatus,
  type StoredReleaseRepository,
} from "@/ports";

export type LocalStorageStoredReleaseRepositoryOptions = {
  /** Called on every use, never at creation: reading it may throw. */
  getStorage: () => Storage;
};

type StoredReleaseEnvelope = { schemaVersion: unknown; payload: unknown };

const UNREADABLE: StoredReleaseLoadResult = {
  status: StoredReleaseLoadStatus.UNREADABLE,
};

/** Reads the envelope text; anything it cannot read throws and is UNREADABLE for the caller. */
const readEnvelope = (rawDocument: string): StoredReleaseLoadResult => {
  const envelope: Partial<StoredReleaseEnvelope> | null =
    JSON.parse(rawDocument);
  if (envelope?.schemaVersion !== STORED_RELEASE_SCHEMA_VERSION) {
    return UNREADABLE;
  }
  const release = parseZoneRulesRelease(envelope.payload);
  if (release instanceof ZoneRulesReleaseError) return UNREADABLE;
  return {
    status: StoredReleaseLoadStatus.LOADED,
    release,
    document: envelope.payload,
  };
};

/**
 * `StoredReleaseRepository` over Web Storage: the envelope
 * `{ schemaVersion, payload }` of ADR-0004 under `STORAGE_KEYS.ZONE_RULES`.
 * Writes are not broadcast; other tabs read it at their next check (design D2).
 * Implements FR6, FR9 of add-remote-zone-rules-updates.
 */
export function createLocalStorageStoredReleaseRepository({
  getStorage,
}: LocalStorageStoredReleaseRepositoryOptions): StoredReleaseRepository {
  const write = (change: (storage: Storage) => void): SaveOutcome => {
    try {
      change(getStorage());
    } catch {
      return SaveOutcome.FAILED;
    }
    return SaveOutcome.SAVED;
  };

  return {
    load: () => {
      try {
        const rawDocument = getStorage().getItem(STORAGE_KEYS.ZONE_RULES);
        if (rawDocument === null) {
          return { status: StoredReleaseLoadStatus.EMPTY };
        }
        return readEnvelope(rawDocument);
      } catch {
        return UNREADABLE;
      }
    },
    save: (document) =>
      write((storage) =>
        storage.setItem(
          STORAGE_KEYS.ZONE_RULES,
          JSON.stringify({
            schemaVersion: STORED_RELEASE_SCHEMA_VERSION,
            payload: document,
          }),
        ),
      ),
    clear: () =>
      write((storage) => storage.removeItem(STORAGE_KEYS.ZONE_RULES)),
  };
}

/** The repository the app uses; the storage is read lazily (it may throw). */
export const localStorageStoredReleaseRepository =
  createLocalStorageStoredReleaseRepository({
    getStorage: () => globalThis.localStorage,
  });
