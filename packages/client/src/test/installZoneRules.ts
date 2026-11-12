// Implements FR1 of add-zone-rules-from-iana (design D10).
// Installs the zone rules wrapper over the real native `Intl.DateTimeFormat` with the
// committed release, before `@/lib/temporal` is evaluated, so every unit test runs on
// the committed rules like the app. Import this file first in the test setup.
import zoneRulesDocument from "virtual:zone-rules";
import {
  installZoneRulesDateTimeFormat,
  parseZoneRulesRelease,
  type ZoneRulesRelease,
  ZoneRulesReleaseError,
} from "@/lib/zoneRules";

/** The engine's own constructor, which the stale-engine fake delegates to. */
export const realNativeDateTimeFormat = Intl.DateTimeFormat;

const parsedRelease = parseZoneRulesRelease(zoneRulesDocument);
if (parsedRelease instanceof ZoneRulesReleaseError) throw parsedRelease;

/** The committed release, parsed once. */
export const committedRelease: ZoneRulesRelease = parsedRelease;

installZoneRulesDateTimeFormat(committedRelease);
