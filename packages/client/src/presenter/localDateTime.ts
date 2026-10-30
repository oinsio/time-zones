import {
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
  UTC_ZONE_ID,
} from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import type { Temporal } from "@/lib/temporal";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";

/**
 * Local time as two-digit 24-hour "HH:mm".
 * Implements FR1 of show-local-time-and-date-on-location-cards (D3).
 */
export function formatLocalTime(
  localDateTime: Temporal.ZonedDateTime,
  language: SupportedLanguage,
): string {
  return getDateTimeFormatter(
    language,
    localDateTime.timeZoneId,
    DateTimeLabelKind.LOCAL_TIME,
  ).format(localDateTime.epochMilliseconds);
}

/**
 * Local date as short weekday, day and short month in the interface language.
 * Implements FR2 of show-local-time-and-date-on-location-cards (D3).
 */
export function formatLocalDate(
  localDateTime: Temporal.ZonedDateTime,
  language: SupportedLanguage,
): string {
  return getDateTimeFormatter(
    language,
    localDateTime.timeZoneId,
    DateTimeLabelKind.LOCAL_DATE,
  ).format(localDateTime.epochMilliseconds);
}

/**
 * A requested wall-clock time as "HH:mm". It is not an instant, so it is read
 * as milliseconds since midnight through the cached UTC formatter; no zone is
 * looked up and no formatter is built per call.
 * Implements FR7 of add-wall-time-input-with-hint (D4), NFR-P1.
 */
export function formatWallClockTime(
  time: Temporal.PlainTime,
  language: SupportedLanguage,
): string {
  const minutesSinceMidnight = time.hour * MINUTES_PER_HOUR + time.minute;
  return getDateTimeFormatter(
    language,
    UTC_ZONE_ID,
    DateTimeLabelKind.LOCAL_TIME,
  ).format(minutesSinceMidnight * MILLISECONDS_PER_MINUTE);
}
