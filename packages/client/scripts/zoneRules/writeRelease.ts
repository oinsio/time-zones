/**
 * Writes the release document of design D1: the release name, the cutoff, one
 * entry per zone id with link entries naming their target, one entry per line
 * and in alphabetical order, so a release bump reads as a diff.
 * Implements FR2 of add-zone-rules-from-iana.
 */
import { ZONE_RULES_CUTOFF_EPOCH_SECONDS } from "../../src/lib/zoneRules/core/index.ts";
import type { ReleaseZone } from "./truncateToCutoff.ts";

export type WriteReleaseOptions = {
  release: string;
  zones: ReadonlyMap<string, ReleaseZone>;
  /** Link name to target name; a target may itself be a link. */
  links: ReadonlyMap<string, string>;
};

function resolveLinkTarget(
  linkName: string,
  options: WriteReleaseOptions,
): string {
  const visitedNames = new Set<string>([linkName]);
  let targetName = options.links.get(linkName) as string;
  while (!options.zones.has(targetName)) {
    const nextName = options.links.get(targetName);
    if (nextName === undefined || visitedNames.has(targetName)) {
      throw new Error(
        `The link ${linkName} does not lead to a zone (stopped at ${targetName})`,
      );
    }
    visitedNames.add(targetName);
    targetName = nextName;
  }
  return targetName;
}

export function writeRelease(options: WriteReleaseOptions): string {
  const entries = new Map<string, string>();
  for (const [zoneId, zone] of options.zones) {
    entries.set(zoneId, JSON.stringify(zone));
  }
  for (const linkName of options.links.keys()) {
    if (options.zones.has(linkName)) continue;
    entries.set(linkName, JSON.stringify(resolveLinkTarget(linkName, options)));
  }
  const lines = [...entries.keys()]
    .sort()
    .map((zoneId) => `${JSON.stringify(zoneId)}:${entries.get(zoneId)}`);
  return [
    `{"release":${JSON.stringify(options.release)},"cutoff":${ZONE_RULES_CUTOFF_EPOCH_SECONDS},"zones":{`,
    lines.join(",\n"),
    "}}",
    "",
  ].join("\n");
}
