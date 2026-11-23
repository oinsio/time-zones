import {
  MAX_UNIX_TIME_FRACTION_DIGITS,
  MAX_WALL_TIME_MINUTE,
} from "@/constants";
import type { DayPeriodMarkers } from "../dayPeriodMarkers";
import { parseWallTimeInput } from "../parseWallTimeInput";

/** A wall-clock time with seconds and the digits after the decimal point. */
export type ExactWallTime = {
  hour: number;
  minute: number;
  second: number;
  fractionDigits: string;
};

const SECONDS_PATTERN = new RegExp(
  `^(?<hourMinute>\\d{1,2}:\\d{2}):(?<second>\\d{2})(?:\\.(?<fraction>\\d{1,${MAX_UNIX_TIME_FRACTION_DIGITS}}))?(?![\\d.])(?<rest>.*)$`,
  "u",
);
const CANONICAL_TIME_PATTERN = /^(?<hour>\d{2}):(?<minute>\d{2})$/u;

function toExactWallTime(
  canonicalTime: string,
  second: number,
  fractionDigits: string,
): ExactWallTime | undefined {
  const groups = CANONICAL_TIME_PATTERN.exec(canonicalTime)?.groups;
  if (groups === undefined) return undefined;
  return {
    hour: Number(groups.hour),
    minute: Number(groups.minute),
    second,
    fractionDigits,
  };
}

/**
 * Reads a typed row time: every text `parseWallTimeInput` reads, and seconds
 * with a fraction of 1 to 9 digits after the minutes (`9:30:15`,
 * `9:30:15.123456789`, `9:30:15.5 PM`). The hour and minute go through the
 * wall-time owner, so the 12-hour and compact forms keep one parser.
 * Implements FR10 of add-unix-time-converter-tool (D6).
 */
export function parseExactWallTimeInput(
  text: string,
  dayPeriodMarkers: DayPeriodMarkers,
): ExactWallTime | undefined {
  const groups = SECONDS_PATTERN.exec(text.trim())?.groups;
  if (groups === undefined) {
    const canonicalTime = parseWallTimeInput(text, dayPeriodMarkers);
    return canonicalTime === undefined
      ? undefined
      : toExactWallTime(canonicalTime, 0, "");
  }
  const second = Number(groups.second);
  if (second > MAX_WALL_TIME_MINUTE) return undefined;
  const canonicalTime = parseWallTimeInput(
    `${groups.hourMinute}${groups.rest}`,
    dayPeriodMarkers,
  );
  return canonicalTime === undefined
    ? undefined
    : toExactWallTime(canonicalTime, second, groups.fraction ?? "");
}
