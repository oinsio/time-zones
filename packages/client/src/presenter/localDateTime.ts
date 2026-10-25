import type { SupportedLanguage } from "@/i18n";
import {
  LOCAL_DATE_FORMAT_OPTIONS,
  LOCAL_TIME_FORMAT_OPTIONS,
} from "@/constants";
import type { Temporal } from "@/lib/temporal";

/**
 * Local time as two-digit 24-hour "HH:mm".
 * Implements FR1 of show-local-time-and-date-on-location-cards (D3).
 */
export function formatLocalTime(
  localDateTime: Temporal.ZonedDateTime,
  language: SupportedLanguage,
): string {
  return localDateTime.toLocaleString(language, LOCAL_TIME_FORMAT_OPTIONS);
}

/**
 * Local date as short weekday, day and short month in the interface language.
 * Implements FR2 of show-local-time-and-date-on-location-cards (D3).
 */
export function formatLocalDate(
  localDateTime: Temporal.ZonedDateTime,
  language: SupportedLanguage,
): string {
  return localDateTime.toLocaleString(language, LOCAL_DATE_FORMAT_OPTIONS);
}
