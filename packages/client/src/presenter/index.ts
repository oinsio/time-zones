// Public API of the presenter layer (ADR-0002).
// Implements FR5, FR8, FR10 of add-locations-via-search (D9).

// Implements FR3, FR4, FR7, FR9 of select-date-with-calendar-and-now.
export {
  type CalendarDayCell,
  type CalendarWeekday,
  type PresentedCalendarMonth,
  presentCalendarMonth,
} from "./calendarMonth";
export {
  type DateBarGap,
  type PresentedDateBar,
  presentDateBar,
} from "./dateBar";
// Implements FR1, FR2 of show-local-time-and-date-on-location-cards.
export { formatLocalDate, formatLocalTime } from "./localDateTime";
export { type LocationRow, presentLocationRows } from "./presentLocationRows";
export {
  type PresentedSearchResult,
  presentSearchResults,
} from "./presentSearchResults";
// Implements FR3 of show-utc-offset-on-location-rows.
export { formatUtcOffset } from "./utcOffset";
