// Implements FR1, FR3, FR4 of bind-day-periods-to-sun.
// Shared by the sun tests: local clock times to instants and back.
import { Temporal } from "@/lib/temporal";

export const MINUTES_TOLERANCE = 3;
export const POLAR_MINUTES_TOLERANCE = 10;
const MILLISECONDS_PER_MINUTE = 60_000;

/** The epoch milliseconds of a local wall time (`HH:mm`) on a date in a zone. */
export const toEpochMilliseconds = (
  date: string,
  time: string,
  timeZoneId: string,
): number =>
  Temporal.PlainDateTime.from(`${date}T${time}`).toZonedDateTime(timeZoneId)
    .epochMilliseconds;

/** Whole minutes between two instants, absolute. */
export const minutesBetween = (first: number, second: number): number =>
  Math.abs(first - second) / MILLISECONDS_PER_MINUTE;

/** The local noon of a date in a zone: an instant inside the solar day to examine. */
export const getLocalNoon = (date: string, timeZoneId: string): number =>
  toEpochMilliseconds(date, "12:00", timeZoneId);
