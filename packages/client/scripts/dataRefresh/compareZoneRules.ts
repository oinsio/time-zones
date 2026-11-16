/**
 * Compares a refreshed zone rules release (and its zone coordinates) with the
 * committed ones for the refresh guard.
 * Implements FR7 of refresh-data-through-scheduled-pull-requests (D5).
 */

/** The identifiers of a release file: zones and links share one key space. */
export type ZoneRulesFile = { zones: Record<string, unknown> };
export type ZoneCoordinatesFile = { zones: Record<string, unknown> };

export type ZoneRulesComparison = {
  /** Identifiers of the committed release the refresh holds neither as zone nor as link. */
  removedZoneIds: string[];
  /** Zones whose coordinates the committed file held and the refreshed one lacks. */
  zonesWithoutCoordinates: string[];
};

function listMissingKeys(
  committed: Record<string, unknown>,
  refreshed: Record<string, unknown>,
): string[] {
  return Object.keys(committed).filter(
    (identifier) => !Object.hasOwn(refreshed, identifier),
  );
}

export function compareZoneRules(
  committed: { release: ZoneRulesFile; coordinates?: ZoneCoordinatesFile },
  refreshed: { release: ZoneRulesFile; coordinates?: ZoneCoordinatesFile },
): ZoneRulesComparison {
  const hasBothCoordinates =
    committed.coordinates !== undefined && refreshed.coordinates !== undefined;
  return {
    removedZoneIds: listMissingKeys(
      committed.release.zones,
      refreshed.release.zones,
    ),
    zonesWithoutCoordinates: hasBothCoordinates
      ? listMissingKeys(committed.coordinates.zones, refreshed.coordinates.zones)
      : [],
  };
}
