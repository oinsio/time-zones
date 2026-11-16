// Implements FR1-FR4, FR7, FR8 of bind-day-periods-to-sun: helpers of the day-period unit steps.
import { MILLISECONDS_PER_MINUTE } from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  type Coordinates,
  DayPeriod,
  type DayPeriodBoundary,
  getDayPeriodBoundaries,
  getReferenceDay,
  INITIAL_WORLD_CLOCK_STATE,
} from "@/model";

const COORDINATES_SEPARATOR = ",";
const UNICODE_MINUS = "−";
const ASCII_MINUS = "-";
const TIME_SEPARATOR = ":";
const MINUTES_PER_HOUR = 60;

/** Reads "43.3, 76.9" or "−0.2, −78.5" into coordinates. */
export const parseCoordinatesText = (text: string): Coordinates => {
  const [latitude, longitude] = text
    .split(UNICODE_MINUS)
    .join(ASCII_MINUS)
    .split(COORDINATES_SEPARATOR)
    .map(Number);
  return { latitude, longitude };
};

export const MONTH_NUMBERS: Record<string, string> = {
  January: "01",
  March: "03",
  June: "06",
  December: "12",
};

/** Reads "8 March 2026" into "2026-03-08". */
export const parseDateText = (text: string): string => {
  const [day, month, year] = text.split(" ");
  return `${year}-${MONTH_NUMBERS[month]}-${day.padStart(2, "0")}`;
};

/** The reference day of a date in a zone, around its local noon. */
export const getDayOf = (timeZoneId: string, date: string) =>
  getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: timeZoneId },
    Temporal.PlainDateTime.from(`${date}T12:00`)
      .toZonedDateTime(timeZoneId)
      .toInstant(),
  );

export const getBoundariesOf = (
  coordinates: Coordinates,
  timeZoneId: string,
  date: string,
): readonly DayPeriodBoundary[] =>
  getDayPeriodBoundaries(coordinates, getDayOf(timeZoneId, date));

/** The instant of the boundary from one period to another; undefined when there is none. */
export const findBoundaryMilliseconds = (
  boundaries: readonly DayPeriodBoundary[],
  from: DayPeriod,
  to: DayPeriod,
): number | undefined =>
  boundaries.find((boundary) => boundary.from === from && boundary.to === to)
    ?.instant.epochMilliseconds;

/** The epoch milliseconds of a local time ("HH:mm") on a date in a zone. */
export const toMilliseconds = (
  date: string,
  time: string,
  timeZoneId: string,
): number =>
  Temporal.PlainDateTime.from(`${date}T${time}`).toZonedDateTime(timeZoneId)
    .epochMilliseconds;

export const minutesBetween = (first: number, second: number): number =>
  Math.abs(first - second) / MILLISECONDS_PER_MINUTE;

/** Minutes of the day of "HH:mm". */
export const toMinutesOfDay = (time: string): number => {
  const [hours, minutes] = time.split(TIME_SEPARATOR).map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
};

export const PERIOD_BY_WORD: Record<string, DayPeriod> = {
  night: DayPeriod.NIGHT,
  morning: DayPeriod.MORNING,
  day: DayPeriod.DAY,
  evening: DayPeriod.EVENING,
};
