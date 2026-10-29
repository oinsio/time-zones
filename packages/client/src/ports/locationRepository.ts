import type { Location } from "@/model";

/**
 * What is stored: the list and the id of the home location, which is always an
 * id of the list. Implements FR8, FR10 of set-home-location-and-show-differences (D6).
 */
export type StoredLocations = {
  locations: readonly Location[];
  homeLocationId: string | null;
};

/** Outcome of reading the stored locations document. */
export enum LocationsLoadStatus {
  LOADED = "LOADED",
  EMPTY = "EMPTY",
  UNREADABLE = "UNREADABLE",
}

export type LocationsLoadResult =
  | ({ status: LocationsLoadStatus.LOADED } & StoredLocations)
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
  /** Stores the list with its home location; never throws. */
  save(snapshot: StoredLocations): SaveOutcome;
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
