/**
 * The files the site serves for the zone rules update check: the version file
 * naming the release and the release file itself, which keeps its name so a
 * cache never holds two contents under one name.
 * Implements FR2, NFR-P1 of add-remote-zone-rules-updates (design D7).
 */
// Node loads this script in strip-only mode: the constants file, not the barrel, which reads Vite defines.
import {
  ZONE_RULES_RELEASE_DIRECTORY,
  ZONE_RULES_VERSION_PATH,
} from "../../src/constants/zoneRules.ts";

const RELEASE_FILE_EXTENSION = ".json";

export type ServedZoneRulesFile = { fileName: string; source: string };

export function buildServedZoneRulesFiles(
  releaseText: string,
  deployInstant: string,
): ServedZoneRulesFile[] {
  const { release } = JSON.parse(releaseText) as { release: string };
  return [
    {
      fileName: ZONE_RULES_VERSION_PATH,
      source: JSON.stringify({ release, publishedAt: deployInstant }),
    },
    {
      fileName: `${ZONE_RULES_RELEASE_DIRECTORY}${release}${RELEASE_FILE_EXTENSION}`,
      source: releaseText,
    },
  ];
}
