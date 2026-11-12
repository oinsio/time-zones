/**
 * Integer calendar arithmetic on epoch days (days since 1970-01-01). The core
 * runs before `temporal-polyfill` is evaluated and is the data Temporal reads,
 * so it uses neither Temporal nor `Date` (design D4).
 * Implements FR3 of add-zone-rules-from-iana.
 */
import {
  DAYS_PER_COMMON_YEAR,
  DAYS_PER_WEEK,
  EPOCH_WEEKDAY,
  EPOCH_YEAR,
  GREGORIAN_AVERAGE_DAYS_PER_YEAR,
  MONTHS_PER_YEAR,
} from "./zoneRulesConstants.ts";

export type CivilDate = { year: number; month: number; day: number };

const LEAP_YEAR_CYCLE = 4;
const CENTURY = 100;
const LEAP_CENTURY_CYCLE = 400;
const FEBRUARY = 2;
const DAYS_IN_MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function isLeapYear(year: number): boolean {
  return (
    (year % LEAP_YEAR_CYCLE === 0 && year % CENTURY !== 0) ||
    year % LEAP_CENTURY_CYCLE === 0
  );
}

export function getDaysInMonth(year: number, month: number): number {
  const isLeapFebruary = month === FEBRUARY && isLeapYear(year);
  return (DAYS_IN_MONTHS[month - 1] as number) + (isLeapFebruary ? 1 : 0);
}

function countLeapYearsBefore(year: number): number {
  const previousYear = year - 1;
  return (
    Math.floor(previousYear / LEAP_YEAR_CYCLE) -
    Math.floor(previousYear / CENTURY) +
    Math.floor(previousYear / LEAP_CENTURY_CYCLE)
  );
}

function getEpochDayOfYearStart(year: number): number {
  return (
    (year - EPOCH_YEAR) * DAYS_PER_COMMON_YEAR +
    countLeapYearsBefore(year) -
    countLeapYearsBefore(EPOCH_YEAR)
  );
}

export function getEpochDayFromCivilDate(
  year: number,
  month: number,
  day: number,
): number {
  let epochDay = getEpochDayOfYearStart(year) + day - 1;
  for (let earlierMonth = 1; earlierMonth < month; earlierMonth++) {
    epochDay += getDaysInMonth(year, earlierMonth);
  }
  return epochDay;
}

export function getYearOfEpochDay(epochDay: number): number {
  let year =
    EPOCH_YEAR + Math.floor(epochDay / GREGORIAN_AVERAGE_DAYS_PER_YEAR);
  while (getEpochDayOfYearStart(year + 1) <= epochDay) year++;
  while (getEpochDayOfYearStart(year) > epochDay) year--;
  return year;
}

export function getCivilDateFromEpochDay(epochDay: number): CivilDate {
  const year = getYearOfEpochDay(epochDay);
  let dayOfYear = epochDay - getEpochDayOfYearStart(year);
  let month = 1;
  while (month < MONTHS_PER_YEAR && dayOfYear >= getDaysInMonth(year, month)) {
    dayOfYear -= getDaysInMonth(year, month);
    month++;
  }
  return { year, month, day: dayOfYear + 1 };
}

/** 0 is Sunday. */
export function getWeekdayOfEpochDay(epochDay: number): number {
  return (
    (((epochDay + EPOCH_WEEKDAY) % DAYS_PER_WEEK) + DAYS_PER_WEEK) %
    DAYS_PER_WEEK
  );
}
