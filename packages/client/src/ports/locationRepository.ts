import type { Location } from "@/model";

/** Outcome of reading the stored locations document. */
export enum LocationsLoadStatus {
  LOADED = "LOADED",
  EMPTY = "EMPTY",
  UNREADABLE = "UNREADABLE",
}

export type LocationsLoadResult =
  | { status: LocationsLoadStatus.LOADED; locations: readonly Location[] }
  | { status: LocationsLoadStatus.EMPTY }
  | { status: LocationsLoadStatus.UNREADABLE };

/** Outcome of writing; writing never throws. */
export enum SaveOutcome {
  SAVED = "SAVED",
  FAILED = "FAILED",
}

/**
 * Where the user's locations are kept between visits (ADR-0004). Synchronous
 * because the list must be known at the first render.
 * Implements FR9, FR11, FR12, FR13, FR14 of add-locations-via-search.
 */
export interface LocationRepository {
  load(): LocationsLoadResult;
  /** Stores the list; never throws. */
  save(locations: readonly Location[]): SaveOutcome;
  /** Removes the stored list; never throws. */
  clear(): SaveOutcome;
  /**
   * Reports a change made by another instance (tab, window) with a fresh
   * load; a change made through this instance is not reported to it.
   * Returns the unsubscribe function.
   */
  subscribe(
    onExternalChange: (result: LocationsLoadResult) => void,
  ): () => void;
}
