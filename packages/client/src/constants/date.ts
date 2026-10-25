import type { SupportedLanguage } from "@/i18n";

// Implements FR7, FR9, FR3 of select-date-with-calendar-and-now (D4).
export const DATE_BAR_SHORT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "long",
};

export const DATE_BAR_LONG_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
};

export const FULL_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};

export const CALENDAR_MONTH_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  year: "numeric",
};

export const CALENDAR_WEEKDAY_SHORT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions =
  { weekday: "short" };

export const DAYS_PER_WEEK = 7;

export const ONE_DAY = 1;

/** ISO weekday (1 = Monday … 7 = Sunday) the calendar weeks start on. */
export const FIRST_DAY_OF_WEEK_BY_LANGUAGE: Record<SupportedLanguage, number> =
  { en: 7, ru: 1 };
