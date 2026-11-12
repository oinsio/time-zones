import { parseZoneRulesRelease, ZoneRulesReleaseError } from "@/lib/zoneRules";
import {
  SaveOutcome,
  type StoredReleaseLoadResult,
  StoredReleaseLoadStatus,
  type StoredReleaseRepository,
} from "@/ports";

export type InMemoryStoredReleaseRepositoryOptions = {
  /** The release JSON held until something is saved; `undefined` means nothing. */
  initialDocument?: unknown;
  /** When false, `save` and `clear` return `FAILED` and keep the document. */
  isWritable?: boolean;
};

/**
 * In-memory `StoredReleaseRepository` for tests and stories: a held document
 * that is not a valid release loads `UNREADABLE`.
 * Implements FR6, FR9 of add-remote-zone-rules-updates (design D2).
 */
export function createInMemoryStoredReleaseRepository({
  initialDocument,
  isWritable = true,
}: InMemoryStoredReleaseRepositoryOptions = {}): StoredReleaseRepository {
  let heldDocument = initialDocument;

  const load = (): StoredReleaseLoadResult => {
    if (heldDocument === undefined) {
      return { status: StoredReleaseLoadStatus.EMPTY };
    }
    const release = parseZoneRulesRelease(heldDocument);
    if (release instanceof ZoneRulesReleaseError) {
      return { status: StoredReleaseLoadStatus.UNREADABLE };
    }
    return {
      status: StoredReleaseLoadStatus.LOADED,
      release,
      document: heldDocument,
    };
  };

  const write = (document: unknown): SaveOutcome => {
    if (!isWritable) return SaveOutcome.FAILED;
    heldDocument = document;
    return SaveOutcome.SAVED;
  };

  return {
    load,
    save: (document) => write(document),
    clear: () => write(undefined),
  };
}
