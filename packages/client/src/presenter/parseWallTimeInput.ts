import {
  MAX_TWELVE_HOUR,
  MAX_WALL_TIME_HOUR,
  MAX_WALL_TIME_MINUTE,
  MIN_TWELVE_HOUR,
  TWELVE_HOUR_WALL_TIME_PATTERN,
  TWELVE_HOUR_WRAP,
  UNIVERSAL_DAY_PERIOD_MARKERS,
  WALL_TIME_INPUT_PATTERNS,
} from "@/constants";
import type { DayPeriodMarkers } from "./dayPeriodMarkers";

const DIGITS_PER_TIME_PART = 2;
const MINUTE_ABSENT = 0;
const WHITESPACE_RUN = /\s+/gu;
const SINGLE_SPACE = " ";

const formatCanonicalTime = (hour: number, minute: number): string => {
  const pad = (part: number) =>
    String(part).padStart(DIGITS_PER_TIME_PART, "0");
  return `${pad(hour)}:${pad(minute)}`;
};

function parseTwelveHourText(
  text: string,
  dayPeriodMarkers: DayPeriodMarkers,
): string | undefined {
  const groups = TWELVE_HOUR_WALL_TIME_PATTERN.exec(text)?.groups;
  if (groups === undefined) return undefined;
  const hour = Number(groups.hour);
  const minute = Number(groups.minute ?? MINUTE_ABSENT);
  if (
    hour < MIN_TWELVE_HOUR ||
    hour > MAX_TWELVE_HOUR ||
    minute > MAX_WALL_TIME_MINUTE
  ) {
    return undefined;
  }
  const marker = groups.marker;
  const isAfterNoon = [
    UNIVERSAL_DAY_PERIOD_MARKERS.pm,
    dayPeriodMarkers.pm.toLowerCase(),
  ].includes(marker);
  const isBeforeNoon = [
    UNIVERSAL_DAY_PERIOD_MARKERS.am,
    dayPeriodMarkers.am.toLowerCase(),
  ].includes(marker);
  if (!isAfterNoon && !isBeforeNoon) return undefined;
  const hourAfterMidnight = hour % TWELVE_HOUR_WRAP;
  return formatCanonicalTime(
    isAfterNoon ? hourAfterMidnight + TWELVE_HOUR_WRAP : hourAfterMidnight,
    minute,
  );
}

/**
 * Reads a typed wall-clock time and returns the canonical `HH:MM` of the
 * `SET_WALL_TIME` command, or `undefined` for any other text. 24-hour texts
 * are `9`, `930`, `9:30`, `09.30`; 12-hour texts are `9 PM`, `9pm`,
 * `9:30 am`, with `AM`/`PM` in any letter case or the language's own markers.
 * Pure and locale-independent apart from the markers it is given.
 * Implements FR2, FR6 of add-wall-time-input-with-hint (D3).
 * Implements FR6 of add-settings-page-and-device-time-location (D9).
 */
export function parseWallTimeInput(
  text: string,
  dayPeriodMarkers: DayPeriodMarkers,
): string | undefined {
  const trimmedText = text.trim();
  for (const pattern of WALL_TIME_INPUT_PATTERNS) {
    const groups = pattern.exec(trimmedText)?.groups;
    if (groups === undefined) continue;
    const hour = Number(groups.hour);
    const minute = Number(groups.minute ?? MINUTE_ABSENT);
    if (hour > MAX_WALL_TIME_HOUR || minute > MAX_WALL_TIME_MINUTE) {
      return undefined;
    }
    return formatCanonicalTime(hour, minute);
  }
  return parseTwelveHourText(
    trimmedText.replace(WHITESPACE_RUN, SINGLE_SPACE).toLowerCase(),
    dayPeriodMarkers,
  );
}
