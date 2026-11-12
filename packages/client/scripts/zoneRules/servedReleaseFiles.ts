/**
 * Lists the served zone rules release files (`zone-rules/<release>.json`) of a
 * build directory. Implements FR2, NFR-P1 of add-remote-zone-rules-updates.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  ZONE_RULES_RELEASE_DIRECTORY,
  ZONE_RULES_RELEASE_FILE_EXTENSION,
} from "../../src/constants/zoneRules.ts";
import { parseReleaseName } from "../../src/lib/zoneRules/core/index.ts";

export function findServedReleaseFiles(buildDirectory: string): string[] {
  const releaseDirectory = join(buildDirectory, ZONE_RULES_RELEASE_DIRECTORY);
  return existsSync(releaseDirectory)
    ? readdirSync(releaseDirectory).filter(
        (fileName) =>
          fileName.endsWith(ZONE_RULES_RELEASE_FILE_EXTENSION) &&
          parseReleaseName(
            fileName.slice(0, -ZONE_RULES_RELEASE_FILE_EXTENSION.length),
          ) !== undefined,
      )
    : [];
}
