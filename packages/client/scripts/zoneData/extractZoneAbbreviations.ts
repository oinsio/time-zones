/**
 * Builds the zone abbreviation table from tzdb zone periods.
 * Implements FR1, FR4 of show-zone-abbreviations-and-zone-label-setting (D1).
 */

/** The year whose periods decide which abbreviations a zone uses. */
export const ZONE_ABBREVIATION_RULES_YEAR = 2026;
/** A tzdb designation counts as an abbreviation only when it is letters alone. */
export const LETTERS_ONLY_DESIGNATION = /^[A-Za-z]+$/;

const RULES_YEAR_START_EPOCH_MILLISECONDS = Date.UTC(ZONE_ABBREVIATION_RULES_YEAR, 0, 1);
const RULES_YEAR_END_EPOCH_MILLISECONDS = Date.UTC(ZONE_ABBREVIATION_RULES_YEAR + 1, 0, 1);
const MAX_OFFSETS_PER_ZONE = 2;
const NO_ABBREVIATION = "";

/** One tzdb period of a zone: its designation and offset, valid until the given instant. */
export interface ZonePeriod {
  designation: string;
  utcOffsetMinutes: number;
  untilEpochMilliseconds: number;
}

export type ZoneAbbreviationTable = Record<string, readonly string[]>;

function isInForceDuringRulesYear(
  period: ZonePeriod,
  startEpochMilliseconds: number,
): boolean {
  return (
    period.untilEpochMilliseconds > RULES_YEAR_START_EPOCH_MILLISECONDS &&
    startEpochMilliseconds < RULES_YEAR_END_EPOCH_MILLISECONDS
  );
}

/** The designation by UTC offset, ordered by the last time each offset was in force. */
function collectDesignationsByOffset(periods: readonly ZonePeriod[]): Map<number, string> {
  const designationsByOffset = new Map<number, string>();
  let startEpochMilliseconds = -Infinity;
  for (const period of periods) {
    if (isInForceDuringRulesYear(period, startEpochMilliseconds)) {
      designationsByOffset.delete(period.utcOffsetMinutes);
      designationsByOffset.set(period.utcOffsetMinutes, period.designation);
    }
    startEpochMilliseconds = period.untilEpochMilliseconds;
  }
  return designationsByOffset;
}

function pickAbbreviations(periods: readonly ZonePeriod[]): readonly string[] {
  return [...collectDesignationsByOffset(periods)]
    .slice(-MAX_OFFSETS_PER_ZONE)
    .sort(([firstOffset], [secondOffset]) => firstOffset - secondOffset)
    .map(([, designation]) =>
      LETTERS_ONLY_DESIGNATION.test(designation) ? designation : NO_ABBREVIATION,
    );
}

export function extractZoneAbbreviations(
  zoneIds: readonly string[],
  readZonePeriods: (zoneId: string) => readonly ZonePeriod[] | undefined,
): ZoneAbbreviationTable {
  const table: ZoneAbbreviationTable = {};
  for (const zoneId of zoneIds) {
    const periods = readZonePeriods(zoneId);
    if (!periods) continue;
    const abbreviations = pickAbbreviations(periods);
    if (abbreviations.some((abbreviation) => abbreviation !== NO_ABBREVIATION)) {
      table[zoneId] = abbreviations;
    }
  }
  return table;
}
