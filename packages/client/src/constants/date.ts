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

// Implements FR7 of add-meeting-share-dialog (D3).
export const DATE_WITHOUT_WEEKDAY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

export const WEEKDAY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
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
export const FIRST_DAY_OF_WEEK_BY_LANGUAGE: Readonly<Record<string, number>> & {
  readonly en: number;
} = { en: 7, ru: 1 };

// Implements FR7 of refine-meeting-range-entry-and-handles (D5).
/** The locator of the date bar on the main page: the sticky bottom element that holds it. */
export const DATE_BAR_SELECTOR = "[data-date-bar]";

// Implements FR12, FR13 of move-meeting-range-and-extend-past-midnight (D9).
/** The locator of the meeting bar on the main page: the sticky header while it shows the meeting bar. */
export const MEETING_BAR_SELECTOR = "[data-meeting-bar]";
/** The CSS property that keeps the browser's focus scrolling below the sticky meeting bar. */
export const SCROLL_PADDING_TOP_PROPERTY = "scroll-padding-top";
