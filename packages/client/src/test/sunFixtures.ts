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

/** The twelve reference cases of M1 (plus Longyearbyen in both seasons). */
export type ReferenceCity = {
  name: string;
  latitude: number;
  longitude: number;
  timeZoneId: string;
  date: string;
};

export const REFERENCE_CITIES: readonly ReferenceCity[] = [
  {
    name: "Almaty",
    latitude: 43.3,
    longitude: 76.9,
    timeZoneId: "Asia/Almaty",
    date: "2026-03-08",
  },
  {
    name: "Moscow December",
    latitude: 55.8,
    longitude: 37.6,
    timeZoneId: "Europe/Moscow",
    date: "2026-12-21",
  },
  {
    name: "Moscow June",
    latitude: 55.8,
    longitude: 37.6,
    timeZoneId: "Europe/Moscow",
    date: "2026-06-21",
  },
  {
    name: "Kazan",
    latitude: 55.8,
    longitude: 49.1,
    timeZoneId: "Europe/Moscow",
    date: "2026-06-21",
  },
  {
    name: "Saint Petersburg",
    latitude: 59.9,
    longitude: 30.3,
    timeZoneId: "Europe/Moscow",
    date: "2026-06-21",
  },
  {
    name: "Quito",
    latitude: -0.2,
    longitude: -78.5,
    timeZoneId: "America/Guayaquil",
    date: "2026-03-20",
  },
  {
    name: "Sydney",
    latitude: -33.9,
    longitude: 151.2,
    timeZoneId: "Australia/Sydney",
    date: "2026-12-21",
  },
  {
    name: "New York",
    latitude: 40.7,
    longitude: -74.0,
    timeZoneId: "America/New_York",
    date: "2026-03-08",
  },
  {
    name: "Kolkata",
    latitude: 22.5,
    longitude: 88.4,
    timeZoneId: "Asia/Kolkata",
    date: "2026-03-08",
  },
  {
    name: "Murmansk December",
    latitude: 69.0,
    longitude: 33.1,
    timeZoneId: "Europe/Moscow",
    date: "2026-12-21",
  },
  {
    name: "Murmansk June",
    latitude: 69.0,
    longitude: 33.1,
    timeZoneId: "Europe/Moscow",
    date: "2026-06-21",
  },
  {
    name: "Longyearbyen December",
    latitude: 78.2,
    longitude: 15.6,
    timeZoneId: "Arctic/Longyearbyen",
    date: "2026-12-21",
  },
  {
    name: "Longyearbyen June",
    latitude: 78.2,
    longitude: 15.6,
    timeZoneId: "Arctic/Longyearbyen",
    date: "2026-06-21",
  },
];
