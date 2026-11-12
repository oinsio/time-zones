// @add-zone-rules-from-iana @FR8: reading the committed zdump fixtures
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseZoneRulesRelease, ZoneRulesReleaseError } from "@/lib/zoneRules";
import { FIXTURE_RELEASE_DOCUMENT } from "./fixtureReleaseDocument";

export function readZdumpFixture(zoneId: string): string {
  return readFileSync(
    join(__dirname, "fixtures", "zdump", `${zoneId.replace("/", "_")}.txt`),
    "utf8",
  );
}

export function parseRelease(document: unknown) {
  const release = parseZoneRulesRelease(document);
  if (release instanceof ZoneRulesReleaseError) throw release;
  return release;
}

export const release = parseRelease(FIXTURE_RELEASE_DOCUMENT);
