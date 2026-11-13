/**
 * The zone IDs of the bundled zone rules release.
 * Implements FR11, FR12 of add-geonames-city-source (D8).
 */
import { ZONE_RULES_RELEASE_FILE } from "../../app.config.ts";
import {
  parseZoneRulesRelease,
  ZoneRulesReleaseError,
} from "../../src/lib/zoneRules/core/index.ts";

export function readReleaseZoneIds(releaseText: string): Set<string> {
  const release = parseZoneRulesRelease(JSON.parse(releaseText));
  if (release instanceof ZoneRulesReleaseError) {
    throw new Error(
      `${ZONE_RULES_RELEASE_FILE} is invalid: ${release.message}`,
    );
  }
  return new Set(release.zones.keys());
}
