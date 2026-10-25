import {
  CALENDAR_MONTH_FORMAT_OPTIONS,
  CALENDAR_WEEKDAY_SHORT_FORMAT_OPTIONS,
  DAYS_PER_WEEK,
  FIRST_DAY_OF_WEEK_BY_LANGUAGE,
  FULL_DATE_FORMAT_OPTIONS,
} from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import type { Temporal } from "@/lib/temporal";
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

export type CalendarMonthContext = {
  focusedDate: Temporal.PlainDate;
  selectedDate: Temporal.PlainDate;
  today: Temporal.PlainDate;
  language: SupportedLanguage;
};

const WEEKDAY_LONG_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
};

/**
 * Heading, weekday names and day cells of the month of `focusedDate`, in the
 * interface language. The heading is formatted from a `PlainDate`, because
 * `PlainYearMonth.toLocaleString` throws for the ISO calendar.
 * Implements FR3, FR9 of select-date-with-calendar-and-now (D4).
 */
export function presentCalendarMonth({
  focusedDate,
  selectedDate,
  today,
  language,
}: CalendarMonthContext): PresentedCalendarMonth {
  const firstDayOfWeek = FIRST_DAY_OF_WEEK_BY_LANGUAGE[language];
  const weekStart = getCalendarFocusTarget(
    focusedDate,
    CalendarMove.WEEK_START,
    firstDayOfWeek,
  );
  const weekdays = Array.from({ length: DAYS_PER_WEEK }, (_, dayIndex) => {
    const weekday = weekStart.add({ days: dayIndex });
    return {
      shortLabel: weekday.toLocaleString(
        language,
        CALENDAR_WEEKDAY_SHORT_FORMAT_OPTIONS,
      ),
      fullLabel: weekday.toLocaleString(language, WEEKDAY_LONG_FORMAT_OPTIONS),
    };
  });
  return {
    heading: focusedDate
      .with({ day: 1 })
      .toLocaleString(language, CALENDAR_MONTH_FORMAT_OPTIONS),
    weekdays,
    weeks: getCalendarWeeks(focusedDate, firstDayOfWeek).map((week) =>
      week.map((day) =>
        day === null
          ? null
          : {
              isoDate: day.toString(),
              dayNumber: day.day,
              fullLabel: day.toLocaleString(language, FULL_DATE_FORMAT_OPTIONS),
              isToday: day.equals(today),
              isSelected: day.equals(selectedDate),
              isFocused: day.equals(focusedDate),
            },
      ),
    ),
  };
}
