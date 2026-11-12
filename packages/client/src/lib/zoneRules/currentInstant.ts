/**
 * Reads the current instant for a formatter called without a date, without the
 * system date function that `.claude/rules/temporal.md` forbids: one native UTC formatter, built
 * on first use, reports the parts of "now" through `formatToParts()`, which the
 * epoch day arithmetic of the core turns into epoch milliseconds.
 * Implements FR6 of add-zone-rules-from-iana (design D5).
 */
import { MINUTES_PER_HOUR, UTC_ZONE_ID } from "@/constants";
import {
  getEpochDayFromCivilDate,
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_MINUTE,
} from "./core/index.ts";

const CLOCK_LOCALE = "en-US";
const HOURS_PER_DAY = 24;
const FRACTIONAL_SECOND_DIGITS = 3;
const MILLISECONDS_PER_DAY =
  HOURS_PER_DAY *
  MINUTES_PER_HOUR *
  SECONDS_PER_MINUTE *
  MILLISECONDS_PER_SECOND;
const MILLISECONDS_PER_HOUR =
  MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
const MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;

const CLOCK_OPTIONS = {
  timeZone: UTC_ZONE_ID,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  fractionalSecondDigits: FRACTIONAL_SECOND_DIGITS,
  hour12: false,
} as const;

function readNumber(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): number {
  const part = parts.find((candidate) => candidate.type === type);
  return part ? Number(part.value) : 0;
}

/** A reader of the current instant in epoch milliseconds, over a native constructor. */
export function createCurrentInstantReader(
  nativeDateTimeFormat: typeof Intl.DateTimeFormat,
): () => number {
  let clockFormatter: Intl.DateTimeFormat | undefined;
  return () => {
    clockFormatter ??= new nativeDateTimeFormat(CLOCK_LOCALE, CLOCK_OPTIONS);
    const parts = clockFormatter.formatToParts();
    const epochDay = getEpochDayFromCivilDate(
      readNumber(parts, "year"),
      readNumber(parts, "month"),
      readNumber(parts, "day"),
    );
    return (
      epochDay * MILLISECONDS_PER_DAY +
      (readNumber(parts, "hour") % HOURS_PER_DAY) * MILLISECONDS_PER_HOUR +
      readNumber(parts, "minute") * MILLISECONDS_PER_MINUTE +
      readNumber(parts, "second") * MILLISECONDS_PER_SECOND +
      readNumber(parts, "fractionalSecond")
    );
  };
}
