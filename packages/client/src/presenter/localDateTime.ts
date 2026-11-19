import {
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
  UTC_ZONE_ID,
} from "@/constants";
import type { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import { HourFormat } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";

/**
 * Local time as "HH:mm" or "h:mm AM" by the hour format.
 * Implements FR5 of add-settings-page-and-device-time-location (D8).
 * Implements FR1 of show-local-time-and-date-on-location-cards (D3).
 */
export function formatLocalTime(
  localDateTime: Temporal.ZonedDateTime,
  language: InterfaceLanguageCode,
  hourFormat: HourFormat,
): string {
  return getDateTimeFormatter(
    language,
    localDateTime.timeZoneId,
    DateTimeLabelKind.LOCAL_TIME,
    hourFormat,
  ).format(localDateTime.epochMilliseconds);
}

/** Local time split into the digits and the day period marker (`AM` / `PM`) of the 12-hour format. */
export type LocalTimeParts = { digits: string; dayPeriodMarker: string };

const DAY_PERIOD_PART_TYPE = "dayPeriod";

/**
 * Local time as the digits and the day period marker, read from the parts of
 * the same cached formatter `formatLocalTime` uses, so no formatter is built.
 * The marker is empty in the 24-hour format.
 * Implements FR8, NFR-P1 of redesign-cards-grid-and-day-palettes (D5).
 */
export function formatLocalTimeParts(
  localDateTime: Temporal.ZonedDateTime,
  language: InterfaceLanguageCode,
  hourFormat: HourFormat,
): LocalTimeParts {
  const parts = getDateTimeFormatter(
    language,
    localDateTime.timeZoneId,
    DateTimeLabelKind.LOCAL_TIME,
    hourFormat,
  ).formatToParts(localDateTime.epochMilliseconds);
  const isDayPeriod = (part: Intl.DateTimeFormatPart) =>
    part.type === DAY_PERIOD_PART_TYPE;
  return {
    digits: parts
      .filter((part) => !isDayPeriod(part))
      .map((part) => part.value)
      .join("")
      .trim(),
    dayPeriodMarker: parts.find(isDayPeriod)?.value ?? "",
  };
}

/**
 * Local date as short weekday, day and short month in the interface language.
 * Implements FR2 of show-local-time-and-date-on-location-cards (D3).
 */
export function formatLocalDate(
  localDateTime: Temporal.ZonedDateTime,
  language: InterfaceLanguageCode,
): string {
  return getDateTimeFormatter(
    language,
    localDateTime.timeZoneId,
    DateTimeLabelKind.LOCAL_DATE,
    HourFormat.H24,
  ).format(localDateTime.epochMilliseconds);
}

/**
 * A requested wall-clock time in the hour format. It is not an instant, so it is read
 * as milliseconds since midnight through the cached UTC formatter; no zone is
 * looked up and no formatter is built per call.
 * Implements FR7 of add-wall-time-input-with-hint (D4), NFR-P1.
 */
export function formatWallClockTime(
  time: Temporal.PlainTime,
  language: InterfaceLanguageCode,
  hourFormat: HourFormat,
): string {
  const minutesSinceMidnight = time.hour * MINUTES_PER_HOUR + time.minute;
  return getDateTimeFormatter(
    language,
    UTC_ZONE_ID,
    DateTimeLabelKind.LOCAL_TIME,
    hourFormat,
  ).format(minutesSinceMidnight * MILLISECONDS_PER_MINUTE);
}

/**
 * A plain date as day and short month in the interface language ("Oct 25").
 * It is not an instant, so it is read as UTC midnight through the cached UTC
 * formatter; no zone is looked up and no formatter is built per call.
 * Implements FR2, NFR-P1 of show-clock-change-note-on-location-cards (D5).
 */
export function formatWallClockDate(
  date: Temporal.PlainDate,
  language: InterfaceLanguageCode,
): string {
  return getDateTimeFormatter(
    language,
    UTC_ZONE_ID,
    DateTimeLabelKind.DAY_AND_MONTH,
    HourFormat.H24,
  ).format(date.toZonedDateTime(UTC_ZONE_ID).epochMilliseconds);
}
