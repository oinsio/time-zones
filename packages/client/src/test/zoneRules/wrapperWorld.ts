// Implements FR6 of add-zone-rules-from-iana: shared set-up of the wrapper tests.
import { Temporal } from "@/lib/temporal";
import {
  parseZoneRulesRelease,
  ZoneRulesReleaseError,
} from "@/lib/zoneRules/core";
import { createZoneRulesDateTimeFormat } from "@/lib/zoneRules/dateTimeFormatWrapper";
import {
  createStaleDateTimeFormat,
  type StaleEngineCall,
} from "../fakeStaleDateTimeFormat";
import { FIXTURE_RELEASE_DOCUMENT } from "./fixtureReleaseDocument";

const parsedRelease = parseZoneRulesRelease(FIXTURE_RELEASE_DOCUMENT);
if (parsedRelease instanceof ZoneRulesReleaseError) throw parsedRelease;

export const fixtureRelease = parsedRelease;
export const ALMATY_INSTANT = Temporal.Instant.from(
  "2026-07-15T08:00:00Z",
).epochMilliseconds;
export const NOON_INSTANT = Temporal.Instant.from(
  "2026-07-15T12:00:00Z",
).epochMilliseconds;
export const CLOCK_TIME_OPTIONS = {
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h23",
} as const;

/** The wrapper over the stale engine and the fixture release, with the engine's call log. */
export function createWrapper() {
  const { staleDateTimeFormat, calls } = createStaleDateTimeFormat();
  return {
    Wrapper: createZoneRulesDateTimeFormat(staleDateTimeFormat, fixtureRelease),
    calls,
  };
}

export function countCallsFor(
  calls: StaleEngineCall[],
  timeZone: string,
): number {
  return calls.filter((call) => call.timeZone === timeZone).length;
}
