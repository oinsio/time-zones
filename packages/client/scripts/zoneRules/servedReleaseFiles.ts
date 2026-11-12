/**
 * Lists the served zone rules release files (`zone-rules/<release>.json`) of a
 * build directory. Implements FR2, NFR-P1 of add-remote-zone-rules-updates.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ZONE_RULES_RELEASE_DIRECTORY } from "../../src/constants/zoneRules.ts";

const RELEASE_FILE_PATTERN = /^\d{4}[a-z]+\.json$/;

export function findServedReleaseFiles(buildDirectory: string): string[] {
  const releaseDirectory = join(buildDirectory, ZONE_RULES_RELEASE_DIRECTORY);
  return existsSync(releaseDirectory)
    ? readdirSync(releaseDirectory).filter((fileName) =>
        RELEASE_FILE_PATTERN.test(fileName),
      )
    : [];
}
