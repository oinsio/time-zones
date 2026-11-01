import {
  CALENDAR_MONTH_FORMAT_OPTIONS,
  CALENDAR_WEEKDAY_SHORT_FORMAT_OPTIONS,
  DAYS_PER_WEEK,
  FIRST_DAY_OF_WEEK_BY_LANGUAGE,
  FULL_DATE_FORMAT_OPTIONS,
} from "@/constants";
import type { Temporal } from "@/lib/temporal";
import {
  type InterfaceLanguageCode,
  pickByLanguageFallback,
  resolveLanguageFallbacks,
} from "@/locales";
import {
  CalendarMove,
  getCalendarFocusTarget,
  getCalendarWeeks,
} from "@/model";

export type CalendarDayCell = {
  isoDate: string;
  dayNumber: number;
  fullLabel: string;
  isToday: boolean;
  isSelected: boolean;
  isFocused: boolean;
};

export type CalendarWeekday = { shortLabel: string; fullLabel: string };

export type PresentedCalendarMonth = {
  heading: string;
  weekdays: CalendarWeekday[];
  weeks: (CalendarDayCell | null)[][];
};

/**
 * ISO weekday the weeks start on in an interface language, along its dialect
 * fallback order.
 * Implements FR10 of add-interface-language-selection (D5).
 */
export function resolveFirstDayOfWeek(language: InterfaceLanguageCode): number {
  return (
    pickByLanguageFallback(language, FIRST_DAY_OF_WEEK_BY_LANGUAGE) ??
    FIRST_DAY_OF_WEEK_BY_LANGUAGE.en
  );
}

export type CalendarMonthContext = {
  focusedDate: Temporal.PlainDate;
  selectedDate: Temporal.PlainDate;
  today: Temporal.PlainDate;
  language: InterfaceLanguageCode;
};

const WEEKDAY_LONG_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
};

/**
 * Heading, weekday names and day cells of the month of `focusedDate`, in the
 * interface language. The heading is formatted from a `PlainDate`, because
 * `PlainYearMonth.toLocaleString` throws for the ISO calendar.
 * Implements FR3, FR9 of select-date-with-calendar-and-now (D4).
 * Implements FR5 of show-city-labels-in-interface-language (D5): labels along the fallback order.
 */
export function presentCalendarMonth({
  focusedDate,
  selectedDate,
  today,
  language,
}: CalendarMonthContext): PresentedCalendarMonth {
  const intlLocales = [...resolveLanguageFallbacks(language)];
  const firstDayOfWeek = resolveFirstDayOfWeek(language);
  const weekStart = getCalendarFocusTarget(
    focusedDate,
    CalendarMove.WEEK_START,
    firstDayOfWeek,
  );
  const weekdays = Array.from({ length: DAYS_PER_WEEK }, (_, dayIndex) => {
    const weekday = weekStart.add({ days: dayIndex });
    return {
      shortLabel: weekday.toLocaleString(
        intlLocales,
        CALENDAR_WEEKDAY_SHORT_FORMAT_OPTIONS,
      ),
      fullLabel: weekday.toLocaleString(
        intlLocales,
        WEEKDAY_LONG_FORMAT_OPTIONS,
      ),
    };
  });
  return {
    heading: focusedDate
      .with({ day: 1 })
      .toLocaleString(intlLocales, CALENDAR_MONTH_FORMAT_OPTIONS),
    weekdays,
    weeks: getCalendarWeeks(focusedDate, firstDayOfWeek).map((week) =>
      week.map((day) =>
        day === null
          ? null
          : {
              isoDate: day.toString(),
              dayNumber: day.day,
              fullLabel: day.toLocaleString(
                intlLocales,
                FULL_DATE_FORMAT_OPTIONS,
              ),
              isToday: day.equals(today),
              isSelected: day.equals(selectedDate),
              isFocused: day.equals(focusedDate),
            },
      ),
    ),
  };
}
