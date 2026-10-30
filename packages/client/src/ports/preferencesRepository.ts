import type { Preferences } from "@/preferences";
import type { SaveOutcome } from "./locationRepository";

/** Outcome of reading the stored preferences document. */
export enum PreferencesLoadStatus {
  LOADED = "LOADED",
  EMPTY = "EMPTY",
  UNREADABLE = "UNREADABLE",
}

export type PreferencesLoadResult =
  | { status: PreferencesLoadStatus.LOADED; preferences: Preferences }
  | { status: PreferencesLoadStatus.EMPTY }
  | { status: PreferencesLoadStatus.UNREADABLE };

/**
 * Where the user's preferences are kept between visits (ADR-0004).
 * Synchronous because the theme must be known at the first render.
 * Implements FR7 of add-settings-page-and-device-time-location (D5).
 */
export interface PreferencesRepository {
  load(): PreferencesLoadResult;
  /** Stores the preferences; never throws. */
  save(preferences: Preferences): SaveOutcome;
  /** Removes the stored preferences; never throws. */
  clear(): SaveOutcome;
  /**
   * Reports a change made by another instance (tab, window) with a fresh
   * load; a change made through this instance is not reported to it.
   * Returns the unsubscribe function.
   */
  subscribe(
    onExternalChange: (result: PreferencesLoadResult) => void,
  ): () => void;
}
