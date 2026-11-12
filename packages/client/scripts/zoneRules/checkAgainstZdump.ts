/**
 * Compares the committed release with `zdump -v -c 2000,2041` of the same IANA
 * release compiled by `zic`: the independent oracle of the zone rules check.
 * Every listed instant is compared, and so is the middle of each stretch
 * between two listed instants, which catches a clock change that only the
 * release has.
 * Implements FR8 of add-zone-rules-from-iana (design D7).
 */
import {
  BINARY_SEARCH_MIDPOINT_DIVISOR,
  getCivilDateFromEpochDay,
  getEpochDayFromCivilDate,
  getLocalTimeType,
  type LocalTimeType,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  type ZoneRulesRelease,
} from "../../src/lib/zoneRules/core/index.ts";

export type ZdumpEntry = {
  epochSeconds: number;
  utcOffsetSeconds: number;
  designation: string;
  isDaylightSavingTime: boolean;
};

export type ZdumpDifference = {
  zoneId: string;
  instant: string;
  expected: string;
  actual: string;
};

/** `<path> <weekday> <month> <day> hh:mm:ss <year> UT = ... <designation> isdst=<0|1> gmtoff=<seconds>` */
const ZDUMP_LINE =
  /^\S+\s+\w{3} (\w{3})\s+(\d+) (\d\d):(\d\d):(\d\d) (\d+) UT = .* (\S+) isdst=(\d) gmtoff=(-?\d+)$/;
const NULL_LINE = /= NULL$/;
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const SECOND_APART = 1;
const ISO_PAD_LENGTH = 2;

function parseZdumpLine(line: string): ZdumpEntry {
  const match = ZDUMP_LINE.exec(line);
  if (!match) throw new Error(`Cannot read the zdump line: ${line}`);
  const [
    ,
    monthName,
    day,
    hours,
    minutes,
    seconds,
    year,
    designation,
    daylightFlag,
    offset,
  ] = match;
  const epochDay = getEpochDayFromCivilDate(
    Number(year),
    MONTH_NAMES.indexOf(monthName as string) + 1,
    Number(day),
  );
  return {
    epochSeconds:
      epochDay * SECONDS_PER_DAY +
      Number(hours) * SECONDS_PER_HOUR +
      Number(minutes) * SECONDS_PER_MINUTE +
      Number(seconds),
    utcOffsetSeconds: Number(offset),
    designation: designation as string,
    isDaylightSavingTime: daylightFlag === "1",
  };
}

/** The entries of zdump's text, in order; the `NULL` lines (the ends of time) are skipped. */
export function parseZdumpLines(text: string): ZdumpEntry[] {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "" && !NULL_LINE.test(line))
    .map(parseZdumpLine);
}

function pad(value: number): string {
  return String(value).padStart(ISO_PAD_LENGTH, "0");
}

function formatInstant(epochSeconds: number): string {
  const epochDay = Math.floor(epochSeconds / SECONDS_PER_DAY);
  const { year, month, day } = getCivilDateFromEpochDay(epochDay);
  const secondOfDay = epochSeconds - epochDay * SECONDS_PER_DAY;
  const hours = Math.floor(secondOfDay / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (secondOfDay % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:${pad(secondOfDay % SECONDS_PER_MINUTE)}Z`;
}

function describeType(
  type: Pick<LocalTimeType, "utcOffsetSeconds" | "designation">,
): string {
  return `${type.utcOffsetSeconds} ${type.designation}`;
}

function isSameLocalTime(entry: ZdumpEntry, type: LocalTimeType): boolean {
  return (
    entry.utcOffsetSeconds === type.utcOffsetSeconds &&
    entry.designation === type.designation &&
    entry.isDaylightSavingTime === type.isDaylightSavingTime
  );
}

/** The first difference between the release and zdump for one zone, or `undefined`. */
export function compareWithRelease(
  release: ZoneRulesRelease,
  zoneId: string,
  entries: readonly ZdumpEntry[],
): ZdumpDifference | undefined {
  const zoneRules = release.zones.get(zoneId);
  if (!zoneRules) {
    return {
      zoneId,
      instant: "-",
      expected: "a zone in zdump",
      actual: "no such zone in the release",
    };
  }
  const checks = entries.flatMap((entry, index) => {
    const next = entries[index + 1];
    const middleChecks =
      next && next.epochSeconds - entry.epochSeconds > SECOND_APART
        ? [
            {
              entry,
              epochSeconds: Math.floor(
                (entry.epochSeconds + next.epochSeconds) /
                  BINARY_SEARCH_MIDPOINT_DIVISOR,
              ),
            },
          ]
        : [];
    return [{ entry, epochSeconds: entry.epochSeconds }, ...middleChecks];
  });
  for (const { entry, epochSeconds } of checks) {
    const actualType = getLocalTimeType(zoneRules, epochSeconds);
    if (!isSameLocalTime(entry, actualType)) {
      return {
        zoneId,
        instant: formatInstant(epochSeconds),
        expected: describeType(entry),
        actual: describeType(actualType),
      };
    }
  }
  return undefined;
}
