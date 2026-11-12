// Implements FR1 of add-zone-rules-from-iana (design D10).
// Installs the zone rules wrapper over the real native `Intl.DateTimeFormat` with the
// committed release, before `@/lib/temporal` is evaluated, so every unit test runs on
// the committed rules like the app. Import this file first in the test setup.
import zoneRulesDocument from "virtual:zone-rules";
import {
  installZoneRulesDateTimeFormat,
  parseZoneRulesRelease,
  ZoneRulesReleaseError,
} from "@/lib/zoneRules";

/** The engine's own constructor, which the stale-engine fake delegates to. */
export const realNativeDateTimeFormat = Intl.DateTimeFormat;

const committedRelease = parseZoneRulesRelease(zoneRulesDocument);
if (committedRelease instanceof ZoneRulesReleaseError) throw committedRelease;

export { committedRelease };

installZoneRulesDateTimeFormat(committedRelease);
