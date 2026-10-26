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
