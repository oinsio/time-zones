// Implements FR2, FR7, FR8 of add-zone-rules-from-iana: helpers of the release scenarios.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Temporal } from "@/lib/temporal";
import type { ZoneRules } from "@/lib/zoneRules";
import { committedRelease } from "@/test/installZoneRules";
import { ZONE_RULES_RELEASE_FILE } from "../../../../../app.config";
import { parseZdumpLines } from "../../../../../scripts/zoneRules/checkAgainstZdump.ts";

export const MILLISECONDS_PER_SECOND = 1000;
export const LISTED_CHANGES_END_YEAR = 2007;
export const ZDUMP_ZONE_IDS = [
  "America/New_York",
  "Asia/Almaty",
  "Europe/Dublin",
];
export const ZDUMP_DIRECTORY = join(
  __dirname,
  "../../../zoneRules/fixtures/zdump",
);
export const WRONG_NEW_YORK_FUTURE_RULE = "EST5EDT,M3.2.0,M10.1.0";

export const committedDocument = JSON.parse(
  readFileSync(ZONE_RULES_RELEASE_FILE, "utf8"),
);
export const toEpochSeconds = (instant: string) =>
  Temporal.Instant.from(instant).epochMilliseconds / MILLISECONDS_PER_SECOND;

export function readZone(zoneId: string): ZoneRules {
  const zoneRules = committedRelease.zones.get(zoneId);
  if (!zoneRules) throw new Error(`The release lacks ${zoneId}`);
  return zoneRules;
}

export function readFutureRuleText(zoneId: string): string {
  return committedDocument.zones[zoneId].futureRule;
}

export function readZdump(zoneId: string) {
  return parseZdumpLines(
    readFileSync(
      join(ZDUMP_DIRECTORY, `${zoneId.replace("/", "_")}.txt`),
      "utf8",
    ),
  );
}
