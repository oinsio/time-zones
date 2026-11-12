/** Why a read of the published zone rules failed. */
export enum ZoneRulesSourceFailure {
  /** The request failed, was rejected or returned a non-2xx status. */
  REQUEST_FAILED = "REQUEST_FAILED",
  /** The response is not JSON of the expected shape. */
  UNPARSABLE = "UNPARSABLE",
}

/** What the zone rules version file says. */
export type ZoneRulesVersion = { release: string };

export const isZoneRulesSourceFailure = (
  outcome: unknown,
): outcome is ZoneRulesSourceFailure =>
  Object.values(ZoneRulesSourceFailure).includes(
    outcome as ZoneRulesSourceFailure,
  );

/**
 * Where the published zone rules are read from: the version file and the
 * release files the site serves. Never throws.
 * Implements FR3, FR4 of add-remote-zone-rules-updates (design D4).
 */
export interface ZoneRulesVersionSource {
  /** Reads the version file, revalidating the HTTP cache. */
  fetchVersion(): Promise<ZoneRulesVersion | ZoneRulesSourceFailure>;
  /** Reads the release JSON of the named release, unchecked. */
  fetchRelease(name: string): Promise<unknown | ZoneRulesSourceFailure>;
}
