import type { Temporal } from "@/lib/temporal";

/**
 * The day of the week of a date in a zone; its value is the i18next context
 * that picks the grammatical form of the meeting share heading.
 * Implements FR7 of add-meeting-share-dialog (D3).
 */
export enum Weekday {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

/** In ISO order: index 0 is `Temporal.PlainDate.dayOfWeek` 1 (Monday). */
const WEEKDAYS_IN_ISO_ORDER: readonly Weekday[] = [
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
  Weekday.SUNDAY,
];

export const getWeekday = (date: Temporal.PlainDate): Weekday =>
  WEEKDAYS_IN_ISO_ORDER[date.dayOfWeek - 1];
