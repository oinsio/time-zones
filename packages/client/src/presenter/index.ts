// Public API of the presenter layer (ADR-0002).
// Implements FR5, FR8, FR10 of add-locations-via-search (D9).

// Implements FR1, FR3, FR4 of match-here-mark-to-design.
export { DayPeriod, type DayPeriodStop, LocationMarkKind } from "@/model";
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
// Implements FR2 of add-wall-time-input-with-hint.
export { type DayPeriodMarkers, getDayPeriodMarkers } from "./dayPeriodMarkers";
// Implements FR1, FR2, FR7, FR9 of add-time-sliders-to-location-cards.
export type { HourLabel, PresentedDayTrack } from "./dayTrack";
// Implements FR1, FR2 of show-local-time-and-date-on-location-cards.
export {
  formatLocalDate,
  formatLocalTime,
  formatWallClockTime,
} from "./localDateTime";
export {
  LOCATION_MARK_TEXT_KEYS,
  type PresentedLocationMark,
  presentLocationMarks,
} from "./locationMark";
// Implements FR5-FR7 of set-home-location-and-show-differences.
export {
  formatOffsetDifference,
  type PresentedOffsetDifference,
} from "./offsetDifference";
export { parseWallTimeInput } from "./parseWallTimeInput";
export { presentDeviceTimeOptionLabels } from "./presentDeviceTimeOptionLabels";
export { type LocationRow, presentLocationRows } from "./presentLocationRows";
export {
  type PresentedSearchResult,
  presentSearchResults,
} from "./presentSearchResults";
export type { LocationRowsContext } from "./presentZoneMoment";
// Implements FR3 of show-utc-offset-on-location-rows.
export { formatUtcOffset } from "./utcOffset";
