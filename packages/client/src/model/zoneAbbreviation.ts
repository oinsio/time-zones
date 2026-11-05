import zoneAbbreviations from "virtual:zone-abbreviations";
import type { Temporal } from "@/lib/temporal";

const JANUARY = 1;
const JULY = 7;
const FIRST_DAY_OF_MONTH = 1;
const NO_ABBREVIATION = "";

/**
 * The zone abbreviation pair of a zone (`EST`, `EDT`), in order of increasing
 * UTC offset; empty for a zone tzdb does not name with letters.
 * Implements FR1 of show-zone-abbreviations-and-zone-label-setting (D2).
 */
export function getZoneAbbreviations(timeZoneId: string): readonly string[] {
  return (zoneAbbreviations[timeZoneId] ?? []).filter(
    (abbreviation) => abbreviation !== NO_ABBREVIATION,
  );
}

/**
 * The zone abbreviation `timeZoneId` uses at `localDateTime`, decided from the
 * UTC offset there against the offsets of the same year's January and July;
 * `undefined` when the zone has none.
 * Implements FR1, FR2 of show-zone-abbreviations-and-zone-label-setting (D2).
 */
export function getZoneAbbreviation(
  timeZoneId: string,
  localDateTime: Temporal.ZonedDateTime,
): string | undefined {
  const pair = zoneAbbreviations[timeZoneId];
  if (!pair) return undefined;
  const [lowerOffsetAbbreviation, higherOffsetAbbreviation] = pair;
  const abbreviation =
    higherOffsetAbbreviation !== undefined && isAtHigherOffset(localDateTime)
      ? higherOffsetAbbreviation
      : lowerOffsetAbbreviation;
  return abbreviation === NO_ABBREVIATION ? undefined : abbreviation;
}

function isAtHigherOffset(localDateTime: Temporal.ZonedDateTime): boolean {
  const januaryOffset = localDateTime.with({
    month: JANUARY,
    day: FIRST_DAY_OF_MONTH,
  }).offsetNanoseconds;
  const julyOffset = localDateTime.with({
    month: JULY,
    day: FIRST_DAY_OF_MONTH,
  }).offsetNanoseconds;
  return (
    januaryOffset !== julyOffset &&
    localDateTime.offsetNanoseconds === Math.max(januaryOffset, julyOffset)
  );
}
