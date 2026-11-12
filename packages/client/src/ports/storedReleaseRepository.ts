import type { ZoneRulesRelease } from "@/lib/zoneRules";
import type { SaveOutcome } from "./locationRepository";

/** Outcome of reading the stored release. */
export enum StoredReleaseLoadStatus {
  LOADED = "LOADED",
  EMPTY = "EMPTY",
  UNREADABLE = "UNREADABLE",
}

export type StoredReleaseLoadResult =
  | {
      status: StoredReleaseLoadStatus.LOADED;
      /** The release, read and validated. */
      release: ZoneRulesRelease;
      /** The release JSON as it was saved; the parsed release does not serialize. */
      document: unknown;
    }
  | { status: StoredReleaseLoadStatus.EMPTY }
  | { status: StoredReleaseLoadStatus.UNREADABLE };

/**
 * Where the downloaded zone rules release is kept between visits: a cached
 * copy of published data, which ADR-0015 lets be removed silently when it
 * cannot be read. Synchronous because it is read at boot.
 * Implements FR6, FR9 of add-remote-zone-rules-updates (design D2).
 */
export interface StoredReleaseRepository {
  load(): StoredReleaseLoadResult;
  /** Stores the release JSON as downloaded; never throws. */
  save(document: unknown): SaveOutcome;
  /** Removes the stored release; never throws. */
  clear(): SaveOutcome;
}
