/**
 * Finds the served zone rules files (`zone-rules/version.json`,
 * `zone-rules/<release>.json`) in the text of the service worker: they must
 * not be precached, or the check would read a stale copy. The hashed
 * `assets/zone-rules-*.json` is not among them: it stays precached for the
 * offline start.
 * Implements FR2, NFR-P1 of add-remote-zone-rules-updates (design D7).
 */
import { ZONE_RULES_RELEASE_DIRECTORY } from "../../src/constants/zoneRules.ts";

const SERVED_FILE_PATTERN = new RegExp(
  `${ZONE_RULES_RELEASE_DIRECTORY}[\\w.-]+\\.json`,
  "g",
);

export function findPrecachedZoneRulesFiles(
  serviceWorkerText: string,
): string[] {
  return [...serviceWorkerText.matchAll(SERVED_FILE_PATTERN)].map((match) =>
    String(match[0]),
  );
}
