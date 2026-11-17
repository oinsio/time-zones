/** Why a read of the published app revision failed. */
export enum AppRevisionFailure {
  /** The request failed, was rejected or returned a non-2xx status. */
  REQUEST_FAILED = "REQUEST_FAILED",
  /** The response is not JSON naming an app revision. */
  UNPARSABLE = "UNPARSABLE",
}

export const isAppRevisionFailure = (
  outcome: unknown,
): outcome is AppRevisionFailure =>
  Object.values(AppRevisionFailure).includes(outcome as AppRevisionFailure);

/**
 * Where the app revision of the published site is read from. Never throws.
 * Implements FR5, FR6 of apply-data-updates-silently (design D2).
 */
export interface AppRevisionSource {
  /** Reads the app revision the site serves, revalidating the HTTP cache. */
  fetchAppRevision(): Promise<string | AppRevisionFailure>;
}
