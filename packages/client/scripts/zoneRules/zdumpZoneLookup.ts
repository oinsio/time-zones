/**
 * Helpers of the zone rules check: zdump lines per zone and zones the release
 * and the compiled files do not share.
 * Implements FR8 of add-zone-rules-from-iana (design D7).
 */
import { relative, sep } from "node:path";
import type { ZoneRulesRelease } from "../../src/lib/zoneRules/core/index.ts";
import type { ZdumpDifference } from "./checkAgainstZdump.ts";

const ZONE_ID_SEPARATOR = "/";

export function groupZdumpLinesByZone(
  stdout: string,
  compiledDirectory: string,
): Map<string, string> {
  const linesByZone = new Map<string, string[]>();
  for (const line of stdout.split("\n")) {
    const [path] = line.split(/\s+/);
    if (!path) continue;
    const zoneId = relative(compiledDirectory, path)
      .split(sep)
      .join(ZONE_ID_SEPARATOR);
    linesByZone.set(zoneId, [...(linesByZone.get(zoneId) ?? []), line]);
  }
  return new Map(
    [...linesByZone].map(([zoneId, lines]) => [zoneId, lines.join("\n")]),
  );
}

export function findMissingZone(
  release: ZoneRulesRelease,
  compiledZoneIds: string[],
): ZdumpDifference | undefined {
  const compiledIds = new Set(compiledZoneIds);
  const onlyCompiled = compiledZoneIds.find(
    (zoneId) => !release.zones.has(zoneId),
  );
  const onlyRelease = [...release.zones.keys()].find(
    (zoneId) => !compiledIds.has(zoneId),
  );
  const zoneId = onlyCompiled ?? onlyRelease;
  if (zoneId === undefined) return undefined;
  return {
    zoneId,
    instant: "-",
    expected: onlyCompiled ? "a zone of the release" : "a compiled zone file",
    actual: onlyCompiled
      ? "no such zone in the release"
      : "no such compiled file",
  };
}
